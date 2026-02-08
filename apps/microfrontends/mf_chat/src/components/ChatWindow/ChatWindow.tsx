import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'
import { useChat, useConversaciones, useOnlineUsers } from '../../hooks'
import { ChatHeader } from './ChatHeader'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

interface ChatWindowProps {
  conversacionId: number
  currentUserId?: number
  onBack?: () => void
  onClose?: () => void
}

export function ChatWindow({
  conversacionId,
  currentUserId,
  onBack,
  onClose,
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

  const { conversaciones } = useConversaciones()
  const { isUserOnline } = useOnlineUsers()

  // Obtener información de la conversación activa
  const conversacionInfo = useMemo(() => {
    const conv = conversaciones.find((c) => c.id === conversacionId)
    if (!conv) return null

    // Para conversaciones directas, obtener el nombre del otro participante
    if (conv.tipo === 'directa' && conv.participantes.length > 0) {
      const otherParticipant = conv.participantes.find(
        (p) => p.usuarioId !== currentUserId
      )
      const otherUserId = otherParticipant?.usuarioId
      return {
        nombre: otherParticipant?.usuario?.nombreCompleto || conv.nombre || 'Chat',
        online: otherUserId ? isUserOnline(otherUserId) : false,
      }
    }

    // Para grupos, usar el nombre del grupo
    return {
      nombre: conv.nombre || 'Grupo',
      online: false,
    }
  }, [conversaciones, conversacionId, currentUserId, isUserOnline])

  const handleSendMessage = async (contenido: string) => {
    await sendMessage(contenido)
  }

  const handleAttachFile = () => {
    console.log('Adjuntar archivo')
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
        onBack={onBack}
        onClose={onClose}
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
        />
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        onAttachFile={handleAttachFile}
        onTyping={handleTyping}
        disabled={!isConnected}
      />
    </Box>
  )
}
