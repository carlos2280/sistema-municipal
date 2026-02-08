import { useCallback, useEffect, useRef, useState } from 'react'
import { type Socket, io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3004'

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
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!autoConnect) return

    socketRef.current = io(SOCKET_URL, {
      autoConnect: true,
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
    })

    socketRef.current.on('connect', () => {
      setIsConnected(true)
      console.log('[Socket] Conectado:', socketRef.current?.id)
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
      console.log('[Socket] Desconectado')
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('[Socket] Error de conexión:', error.message)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [autoConnect, token])

  const connect = useCallback(() => {
    if (!socketRef.current?.connected) {
      socketRef.current?.connect()
    }
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
  }, [])

  const emit = useCallback(<T,>(event: string, data: T) => {
    socketRef.current?.emit(event, data)
  }, [])

  const on = useCallback(<T,>(event: string, callback: (data: T) => void) => {
    socketRef.current?.on(event, callback)
  }, [])

  const off = useCallback((event: string) => {
    socketRef.current?.off(event)
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  }
}
