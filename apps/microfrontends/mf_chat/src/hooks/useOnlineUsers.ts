import { useCallback, useEffect, useState } from 'react'
import { useSocket } from './useSocket'

interface UseOnlineUsersReturn {
  onlineUsers: Set<number>
  isUserOnline: (userId: number) => boolean
}

export function useOnlineUsers(): UseOnlineUsersReturn {
  const { isConnected, on, off, emit } = useSocket()
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!isConnected) return

    // Solicitar lista inicial de usuarios online
    emit('presence:get-online', {})

    // Recibir lista inicial
    const handleOnlineList = (userIds: number[]) => {
      setOnlineUsers(new Set(userIds))
    }

    // Usuario se conecta
    const handleUserOnline = ({ userId }: { userId: number }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.add(userId)
        return next
      })
    }

    // Usuario se desconecta
    const handleUserOffline = ({ userId }: { userId: number }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }

    on('presence:online-list', handleOnlineList)
    on('user:online', handleUserOnline)
    on('user:offline', handleUserOffline)

    return () => {
      off('presence:online-list')
      off('user:online')
      off('user:offline')
    }
  }, [isConnected, on, off, emit])

  const isUserOnline = useCallback(
    (userId: number) => onlineUsers.has(userId),
    [onlineUsers]
  )

  return {
    onlineUsers,
    isUserOnline,
  }
}
