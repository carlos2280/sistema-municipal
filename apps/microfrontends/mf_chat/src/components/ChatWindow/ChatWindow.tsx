import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo, useState } from 'react'
import { useIniciarReunionMutation, useLazyObtenerTokenLlamadaQuery } from 'mf_store/store'
import { useChat, useConversaciones, useMeetings, useOnlineUsers } from '../../hooks'
import type { Reunion } from '../../types/meeting.types'
import { CreateMeetingDialog, MeetingReminder } from '../Meeting'
import { ChatHeader } from './ChatHeader'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

interface ChatWindowProps {
  conversacionId: number
  currentUserId?: number
  onBack?: () => void
  onClose?: () => void
  onShowMembers?: () => void
  onVoiceCall?: (conversacionId: number) => void
  onVideoCall?: (conversacionId: number) => void
  onShowMeetings?: () => void
  onJoinCall?: (llamadaId: number, token?: string) => void
}

export function ChatWindow({
  conversacionId,
  currentUserId,
  onBack,
  onClose,
  onShowMembers,
  onVoiceCall,
  onVideoCall,
  onJoinCall,
}: ChatWindowProps) {
  const {
    mensajes,
    isLoading,
    isConnected,
    isTyping,
    error,
    sendMessage,
    setTyping,
  } = useChat({ conversacionId })

  // ─── Reuniones ─────────────────────────────────────────────────────────────
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [reminder, setReminder] = useState<{ reunion: Reunion; minutos: number } | null>(null)
  const [iniciarMutation] = useIniciarReunionMutation()
  const [obtenerToken] = useLazyObtenerTokenLlamadaQuery()

  const handleReminder = useCallback((reunion: Reunion, minutosRestantes: number) => {
    setReminder({ reunion, minutos: minutosRestantes })
  }, [])

  const handleStarting = useCallback((reunion: Reunion, llamadaId: number) => {
    // Si es activa y tiene llamadaId podemos notificar al usuario
  }, [])

  const { crearReunion } = useMeetings({
    conversacionId,
    onReminder: handleReminder,
    onStarting: handleStarting,
  })

  const handleIniciarMeeting = useCallback(async (reunionId: number) => {
    try {
      const response = await iniciarMutation(reunionId).unwrap()
      onJoinCall?.(response.llamada.id, response.llamada.token)
    } catch (err) {
      console.error('[Meeting] Error al iniciar reunión:', err)
    }
  }, [iniciarMutation, onJoinCall])

  // BUG-02: obtener token LiveKit antes de unirse como participante
  const handleJoinMeeting = useCallback(async (llamadaId: number) => {
    try {
      const result = await obtenerToken(llamadaId).unwrap()
      onJoinCall?.(llamadaId, result.token)
    } catch (err) {
      console.error('[Meeting] Error al obtener token para unirse:', err)
    }
  }, [obtenerToken, onJoinCall])

  const { conversaciones } = useConversaciones()
  const { isUserOnline } = useOnlineUsers()

  // Grupos del usuario con sus miembros para el ParticipantSelector
  const gruposParaSelector = useMemo(() => {
    return conversaciones
      .filter((c) => c.tipo === 'grupo')
      .map((c) => ({
        id: c.id,
        nombre: c.nombre ?? `Grupo ${c.id}`,
        miembros: (c.participantes ?? [])
          .filter((p) => p.usuarioId !== currentUserId)
          .map((p) => ({
            id: p.usuarioId,
            nombre: p.usuario?.nombreCompleto ?? `Usuario ${p.usuarioId}`,
          })),
      }))
      .filter((g) => g.miembros.length > 0)
  }, [conversaciones, currentUserId])

  // Obtener información de la conversación activa
  const conversacionInfo = useMemo(() => {
    const conv = conversaciones.find((c) => c.id === conversacionId)
    if (!conv) return null

    // Para conversaciones directas, obtener el nombre del otro participante
    const participantes = conv.participantes ?? []

    if (conv.tipo === 'directa' && participantes.length > 0) {
      const otherParticipant = participantes.find(
        (p) => p.usuarioId !== currentUserId
      )
      const otherUserId = otherParticipant?.usuarioId
      return {
        nombre: otherParticipant?.usuario?.nombreCompleto || conv.nombre || 'Chat',
        online: otherUserId ? isUserOnline(otherUserId) : false,
        esGrupo: false,
        esSistema: false,
        participantesCount: 2,
      }
    }

    // Para grupos, usar el nombre del grupo
    return {
      nombre: conv.nombre || 'Grupo',
      online: false,
      esGrupo: true,
      esSistema: conv.sistema ?? false,
      participantesCount: participantes.length,
    }
  }, [conversaciones, conversacionId, currentUserId, isUserOnline])

  const handleSendMessage = async (contenido: string) => {
    await sendMessage(contenido)
  }

  const handleAttachFile = () => {
    // TODO: Implementar selector de archivos
  }

  const handleTyping = (typing: boolean) => {
    setTyping(typing)
  }

  // Obtener quién está escribiendo
  const typingUsers = Object.entries(isTyping)
    .filter(([userId, typing]) => typing && Number(userId) !== currentUserId)
    .map(([userId]) => userId)

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      <ChatHeader
        conversacionId={conversacionId}
        isConnected={isConnected}
        nombre={conversacionInfo?.nombre}
        online={conversacionInfo?.online}
        esGrupo={conversacionInfo?.esGrupo}
        esSistema={conversacionInfo?.esSistema}
        participantesCount={conversacionInfo?.participantesCount}
        onBack={onBack}
        onClose={onClose}
        onShowMembers={conversacionInfo?.esGrupo ? onShowMembers : undefined}
        onVoiceCall={() => onVoiceCall?.(conversacionId)}
        onVideoCall={() => onVideoCall?.(conversacionId)}
        onScheduleMeeting={() => setCreateDialogOpen(true)}
      />

      {isLoading ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : error ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <MessageList
          mensajes={mensajes}
          currentUserId={currentUserId}
          typingUsers={typingUsers}
          onJoinMeeting={handleJoinMeeting}
          onIniciarMeeting={handleIniciarMeeting}
        />
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        onAttachFile={handleAttachFile}
        onTyping={handleTyping}
        disabled={!isConnected}
      />

      <CreateMeetingDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onConfirm={async (data) => { await crearReunion(data) }}
        organizadorId={currentUserId}
        grupos={gruposParaSelector}
      />

      <MeetingReminder
        open={!!reminder}
        reunion={reminder?.reunion ?? null}
        minutosRestantes={reminder?.minutos ?? 0}
        onClose={() => setReminder(null)}
      />
    </Box>
  )
}
