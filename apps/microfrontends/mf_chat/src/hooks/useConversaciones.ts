import { useEffect } from 'react'
import {
  type Conversacion,
  useObtenerConversacionesQuery,
} from 'mf_store/store'
import { useSocket } from './useSocket'

interface UseConversacionesReturn {
  conversaciones: Conversacion[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useConversaciones(): UseConversacionesReturn {
  const {
    data: conversaciones = [],
    isLoading,
    error,
    refetch,
  } = useObtenerConversacionesQuery()
  const { on, off, isConnected } = useSocket()

  // Escuchar eventos de Socket.IO para refrescar cuando hay cambios
  useEffect(() => {
    if (!isConnected) return

    // Cuando llega un nuevo mensaje, refrescar la lista
    const handleNewMessage = () => {
      refetch()
    }

    // Cuando el usuario se conecta/desconecta, podríamos refrescar
    const handleUserStatus = () => {
      // Opcional: refetch() para actualizar estados online
    }

    on('chat:message', handleNewMessage)
    on('user:online', handleUserStatus)
    on('user:offline', handleUserStatus)

    return () => {
      off('chat:message')
      off('user:online')
      off('user:offline')
    }
  }, [isConnected, on, off, refetch])

  return {
    conversaciones,
    isLoading,
    error: error ? 'Error cargando conversaciones' : null,
    refetch,
  }
}
