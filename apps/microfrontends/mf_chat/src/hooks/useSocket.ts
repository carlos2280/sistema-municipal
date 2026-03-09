import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { type Socket, io } from 'socket.io-client'

// Socket.IO goes through api-gateway so the HTTP-only cookie (JWT) is sent automatically
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const MAX_AUTH_RETRIES = 3
const AUTH_RETRY_DELAY_MS = 2_000

// ── Global singleton (survives Module Federation scope boundaries) ──────────
// En Module Federation cada remote tiene su propio scope de módulo,
// así que "let" a nivel de módulo NO es suficiente. Usamos window.
interface ChatSocketGlobal {
  socket: Socket | null
  refCount: number
  listeners: Set<() => void>
  authErrorCount: number
  authRetryTimer: ReturnType<typeof setTimeout> | null
}

const GLOBAL_KEY = '__mf_chat_socket__' as const

function getGlobal(): ChatSocketGlobal {
  const w = window as unknown as Record<string, ChatSocketGlobal>
  if (!w[GLOBAL_KEY]) {
    w[GLOBAL_KEY] = {
      socket: null,
      refCount: 0,
      listeners: new Set(),
      authErrorCount: 0,
      authRetryTimer: null,
    }
  }
  return w[GLOBAL_KEY]
}

function notifyListeners() {
  for (const listener of getGlobal().listeners) listener()
}

function isAuthError(error: Error): boolean {
  const msg = error.message.toLowerCase()
  return (
    msg.includes('unauthorized') ||
    msg.includes('jwt') ||
    msg.includes('token') ||
    msg.includes('auth') ||
    msg.includes('403') ||
    msg.includes('401')
  )
}

function getOrCreateSocket(token?: string): Socket {
  const g = getGlobal()
  if (!g.socket) {
    g.authErrorCount = 0

    g.socket = io(SOCKET_URL, {
      autoConnect: true,
      auth: token ? { token } : undefined,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
    })

    g.socket.on('connect', () => {
      console.log('[Socket] Conectado:', g.socket?.id)
      g.authErrorCount = 0
      notifyListeners()
    })

    g.socket.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado:', reason)
      notifyListeners()
    })

    g.socket.on('connect_error', (error) => {
      console.error('[Socket] Error de conexión:', error.message)

      if (isAuthError(error)) {
        g.authErrorCount++
        console.warn(`[Socket] Error de autenticación (${g.authErrorCount}/${MAX_AUTH_RETRIES})`)

        if (g.authErrorCount >= MAX_AUTH_RETRIES) {
          // Detener reconexión automática — la sesión expiró
          g.socket?.disconnect()
          console.error('[Socket] Sesión expirada. Se requiere re-autenticación.')
          notifyListeners()
        }
      }
    })
  }
  return g.socket
}

/** Fuerza reconexión con credenciales frescas (tras refresh de sesión) */
function reconnectWithFreshAuth() {
  const g = getGlobal()
  if (g.authRetryTimer) clearTimeout(g.authRetryTimer)

  g.authRetryTimer = setTimeout(() => {
    g.authRetryTimer = null
    if (g.socket && !g.socket.connected) {
      g.authErrorCount = 0
      g.socket.connect()
    }
  }, AUTH_RETRY_DELAY_MS)
}

function destroySocket() {
  const g = getGlobal()
  if (g.authRetryTimer) {
    clearTimeout(g.authRetryTimer)
    g.authRetryTimer = null
  }
  if (g.socket) {
    g.socket.removeAllListeners()
    g.socket.disconnect()
    g.socket = null
    g.authErrorCount = 0
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
  reconnect: () => void
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

  const reconnect = useCallback(() => {
    reconnectWithFreshAuth()
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
    reconnect,
    emit,
    on,
    off,
  }
}
