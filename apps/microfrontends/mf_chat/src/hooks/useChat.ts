import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type Mensaje,
  useObtenerMensajesQuery,
  useCrearMensajeMutation,
} from 'mf_store/store'
import { useSocket } from './useSocket'

const SEND_RATE_LIMIT_MS = 1_000
const TYPING_AUTO_CLEAR_MS = 5_000

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

  // Rate limiting refs
  const lastSendTimeRef = useRef(0)
  // Typing auto-clear timeouts per user
  const typingTimeoutsRef = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  // Resetear cursor cuando cambia la conversación
  useEffect(() => {
    setCursor(undefined)
    setLocalMensajes([])
    setIsTypingState({})
  }, [conversacionId])

  // Cleanup typing timeouts on unmount
  useEffect(() => {
    const timeouts = typingTimeoutsRef.current
    return () => {
      for (const t of timeouts.values()) clearTimeout(t)
      timeouts.clear()
    }
  }, [])

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
  // Los mensajes vienen en orden DESC (más reciente primero), invertimos para mostrar cronológicamente.
  // Merge: RTK Query es la fuente de verdad; mensajes real-time que aún no están en el query se conservan al final.
  useEffect(() => {
    if (!mensajesData?.mensajes) return
    const queryMensajes = [...mensajesData.mensajes].reverse()
    setLocalMensajes((prev) => {
      const queryIds = new Set(queryMensajes.map((m) => m.id))
      const realTimeOnly = prev.filter((m) => !queryIds.has(m.id))
      return [...queryMensajes, ...realTimeOnly]
    })
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
      conversacionId: convId,
    }: {
      conversacionId: number
      userId: number
      isTyping: boolean
    }) => {
      if (convId !== conversacionId) return

      setIsTypingState((prev) => ({ ...prev, [userId]: typing }))

      // Auto-clear: si el usuario cierra pestaña sin emitir typing=false,
      // limpiamos automáticamente después de TYPING_AUTO_CLEAR_MS
      const timeouts = typingTimeoutsRef.current
      const existing = timeouts.get(userId)
      if (existing) clearTimeout(existing)

      if (typing) {
        timeouts.set(
          userId,
          setTimeout(() => {
            setIsTypingState((prev) => ({ ...prev, [userId]: false }))
            timeouts.delete(userId)
          }, TYPING_AUTO_CLEAR_MS)
        )
      } else {
        timeouts.delete(userId)
      }
    }

    on('chat:message', handleNewMessage)
    on('chat:typing', handleTyping)

    return () => {
      off('chat:message')
      off('chat:typing')
    }
  }, [isConnected, conversacionId, enabled, on, off])

  // Enviar mensaje (con rate limiting para prevenir spam)
  const sendMessage = useCallback(
    async (contenido: string, tipo: Mensaje['tipo'] = 'texto') => {
      if (!contenido.trim()) return

      const now = Date.now()
      if (now - lastSendTimeRef.current < SEND_RATE_LIMIT_MS) return
      lastSendTimeRef.current = now

      if (isConnected) {
        emit('chat:message', {
          conversacionId,
          contenido,
          tipo,
        })
      } else {
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
