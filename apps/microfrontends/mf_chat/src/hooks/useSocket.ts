import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { type Socket, io } from 'socket.io-client'

// Socket.IO goes through api-gateway so the HTTP-only cookie (JWT) is sent automatically
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ── Singleton socket instance ──────────────────────────────────────────────
let sharedSocket: Socket | null = null
let refCount = 0

function getOrCreateSocket(token?: string): Socket {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, {
      autoConnect: true,
      auth: token ? { token } : undefined,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    sharedSocket.on('connect', () => {
      console.log('[Socket] Conectado:', sharedSocket?.id)
      notifyListeners()
    })

    sharedSocket.on('disconnect', () => {
      console.log('[Socket] Desconectado')
      notifyListeners()
    })

    sharedSocket.on('connect_error', (error) => {
      console.error('[Socket] Error de conexión:', error.message)
    })
  }
  return sharedSocket
}

function destroySocket() {
  if (sharedSocket) {
    sharedSocket.disconnect()
    sharedSocket = null
    notifyListeners()
  }
}

// ── External store for isConnected ─────────────────────────────────────────
const listeners = new Set<() => void>()

function notifyListeners() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): boolean {
  return sharedSocket?.connected ?? false
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

    const s = getOrCreateSocket(token)
    refCount++
    setSocket(s)

    return () => {
      refCount--
      if (refCount <= 0) {
        refCount = 0
        destroySocket()
      }
    }
  }, [autoConnect, token])

  const connect = useCallback(() => {
    if (!sharedSocket?.connected) {
      sharedSocket?.connect()
    }
  }, [])

  const disconnect = useCallback(() => {
    sharedSocket?.disconnect()
  }, [])

  const emit = useCallback(<T,>(event: string, data: T) => {
    sharedSocket?.emit(event, data)
  }, [])

  const on = useCallback(<T,>(event: string, callback: (data: T) => void) => {
    sharedSocket?.on(event, callback)
  }, [])

  const off = useCallback((event: string) => {
    sharedSocket?.off(event)
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
