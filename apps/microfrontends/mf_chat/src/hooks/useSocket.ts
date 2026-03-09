import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { type Socket, io } from 'socket.io-client'

// Socket.IO goes through api-gateway so the HTTP-only cookie (JWT) is sent automatically
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ── Global singleton (survives Module Federation scope boundaries) ──────────
// En Module Federation cada remote tiene su propio scope de módulo,
// así que "let" a nivel de módulo NO es suficiente. Usamos window.
interface ChatSocketGlobal {
  socket: Socket | null
  refCount: number
  listeners: Set<() => void>
}

const GLOBAL_KEY = '__mf_chat_socket__' as const

function getGlobal(): ChatSocketGlobal {
  const w = window as unknown as Record<string, ChatSocketGlobal>
  if (!w[GLOBAL_KEY]) {
    w[GLOBAL_KEY] = { socket: null, refCount: 0, listeners: new Set() }
  }
  return w[GLOBAL_KEY]
}

function notifyListeners() {
  for (const listener of getGlobal().listeners) listener()
}

function getOrCreateSocket(token?: string): Socket {
  const g = getGlobal()
  if (!g.socket) {
    g.socket = io(SOCKET_URL, {
      autoConnect: true,
      auth: token ? { token } : undefined,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    g.socket.on('connect', () => {
      console.log('[Socket] Conectado:', g.socket?.id)
      notifyListeners()
    })

    g.socket.on('disconnect', () => {
      console.log('[Socket] Desconectado')
      notifyListeners()
    })

    g.socket.on('connect_error', (error) => {
      console.error('[Socket] Error de conexión:', error.message)
    })
  }
  return g.socket
}

function destroySocket() {
  const g = getGlobal()
  if (g.socket) {
    g.socket.disconnect()
    g.socket = null
    notifyListeners()
  }
}

// ── External store for isConnected ─────────────────────────────────────────

function subscribe(listener: () => void) {
  const g = getGlobal()
  g.listeners.add(listener)
  return () => g.listeners.delete(listener)
}

function getSnapshot(): boolean {
  return getGlobal().socket?.connected ?? false
}

// ── Hook ───────────────────────────────────────────────────────────────────

interface UseSocketOptions {
  autoConnect?: boolean
  token?: string
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  emit: <T>(event: string, data: T) => void
  on: <T>(event: string, callback: (data: T) => void) => void
  off: (event: string) => void
}

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { autoConnect = true, token } = options
  const [socket, setSocket] = useState<Socket | null>(null)
  const isConnected = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    if (!autoConnect) return

    const g = getGlobal()
    const s = getOrCreateSocket(token)
    g.refCount++
    setSocket(s)

    return () => {
      g.refCount--
      if (g.refCount <= 0) {
        g.refCount = 0
        destroySocket()
      }
    }
  }, [autoConnect, token])

  const connect = useCallback(() => {
    const s = getGlobal().socket
    if (s && !s.connected) s.connect()
  }, [])

  const disconnect = useCallback(() => {
    getGlobal().socket?.disconnect()
  }, [])

  const emit = useCallback(<T,>(event: string, data: T) => {
    getGlobal().socket?.emit(event, data)
  }, [])

  const on = useCallback(<T,>(event: string, callback: (data: T) => void) => {
    getGlobal().socket?.on(event, callback)
  }, [])

  const off = useCallback((event: string) => {
    getGlobal().socket?.off(event)
  }, [])

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  }
}
