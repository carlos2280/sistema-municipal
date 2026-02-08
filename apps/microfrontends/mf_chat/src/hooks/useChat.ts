import { useCallback, useEffect, useState } from 'react'
import {
  type Mensaje,
  useObtenerMensajesQuery,
  useCrearMensajeMutation,
} from 'mf_store/store'
import { useSocket } from './useSocket'

interface UseChatOptions {
  conversacionId: number
  enabled?: boolean
}

interface TypingState {
  [userId: number]: boolean
}

interface UseChatReturn {
  mensajes: Mensaje[]
  isLoading: boolean
  isConnected: boolean
  isTyping: TypingState
  error: string | null
  sendMessage: (contenido: string, tipo?: Mensaje['tipo']) => Promise<void>
  setTyping: (isTyping: boolean) => void
  loadMoreMessages: () => void
  hasMore: boolean
}

export function useChat({ conversacionId, enabled = true }: UseChatOptions): UseChatReturn {
  const { isConnected, emit, on, off } = useSocket()
  const [localMensajes, setLocalMensajes] = useState<Mensaje[]>([])
  const [isTyping, setIsTypingState] = useState<TypingState>({})
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  // Resetear cursor cuando cambia la conversación
  useEffect(() => {
    setCursor(undefined)
    setLocalMensajes([])
  }, [conversacionId])

  // RTK Query para obtener mensajes
  const {
    data: mensajesData,
    isLoading,
    error: queryError,
    refetch,
  } = useObtenerMensajesQuery(
    { conversacionId, cursor },
    {
      skip: !enabled || !conversacionId,
      refetchOnMountOrArgChange: true, // Forzar recarga al abrir el chat
    }
  )

  // Mutation para crear mensaje (fallback si socket falla)
  const [crearMensaje] = useCrearMensajeMutation()

  // Sincronizar mensajes del query con estado local
  // Los mensajes vienen en orden DESC (más reciente primero), invertimos para mostrar cronológicamente
  useEffect(() => {
    if (mensajesData?.mensajes) {
      setLocalMensajes([...mensajesData.mensajes].reverse())
    }
  }, [mensajesData])

  // Unirse a la sala de conversación
  useEffect(() => {
    if (!isConnected || !conversacionId || !enabled) return

    emit('chat:join', { conversacionId })

    return () => {
      emit('chat:leave', { conversacionId })
    }
  }, [isConnected, conversacionId, enabled, emit])

  // Escuchar nuevos mensajes en tiempo real
  useEffect(() => {
    if (!isConnected || !enabled) return

    const handleNewMessage = (mensaje: Mensaje) => {
      if (mensaje.conversacionId === conversacionId) {
        setLocalMensajes((prev) => {
          // Evitar duplicados
          if (prev.some((m) => m.id === mensaje.id)) {
            return prev
          }
          return [...prev, mensaje]
        })
      }
    }

    const handleTyping = ({
      userId,
      isTyping: typing,
    }: {
      conversacionId: number
      userId: number
      isTyping: boolean
    }) => {
      setIsTypingState((prev) => ({ ...prev, [userId]: typing }))
    }

    on('chat:message', handleNewMessage)
    on('chat:typing', handleTyping)

    return () => {
      off('chat:message')
      off('chat:typing')
    }
  }, [isConnected, conversacionId, enabled, on, off])

  // Enviar mensaje
  const sendMessage = useCallback(
    async (contenido: string, tipo: Mensaje['tipo'] = 'texto') => {
      if (!contenido.trim()) return

      if (isConnected) {
        // Enviar via Socket.IO (tiempo real)
        emit('chat:message', {
          conversacionId,
          contenido,
          tipo,
        })
      } else {
        // Fallback: enviar via REST API
        await crearMensaje({
          conversacionId,
          contenido,
          tipo,
        }).unwrap()
        refetch()
      }
    },
    [isConnected, conversacionId, emit, crearMensaje, refetch]
  )

  // Indicador de escritura
  const setTyping = useCallback(
    (typing: boolean) => {
      if (!isConnected) return

      emit('chat:typing', {
        conversacionId,
        isTyping: typing,
      })
    },
    [isConnected, conversacionId, emit]
  )

  // Cargar más mensajes (paginación)
  const loadMoreMessages = useCallback(() => {
    if (mensajesData?.nextCursor) {
      setCursor(mensajesData.nextCursor)
    }
  }, [mensajesData?.nextCursor])

  return {
    mensajes: localMensajes,
    isLoading,
    isConnected,
    isTyping,
    error: queryError ? 'Error cargando mensajes' : null,
    sendMessage,
    setTyping,
    loadMoreMessages,
    hasMore: !!mensajesData?.nextCursor,
  }
}
