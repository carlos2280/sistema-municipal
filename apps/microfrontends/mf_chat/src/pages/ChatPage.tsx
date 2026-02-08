import Box from '@mui/material/Box'
import { useParams } from 'react-router-dom'
import { ChatPanel } from '../components/ChatPanel/ChatPanel'
import { ChatWindow } from '../components/ChatWindow/ChatWindow'

export function ChatPage() {
  const { conversacionId } = useParams<{ conversacionId: string }>()

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* Panel lateral con lista de conversaciones */}
      <ChatPanel activeConversationId={conversacionId ? Number(conversacionId) : undefined} />

      {/* Ventana de chat activo */}
      {conversacionId ? (
        <ChatWindow conversacionId={Number(conversacionId)} />
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#FAFAFA',
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <Box
              component="span"
              sx={{ fontSize: 64, display: 'block', mb: 2 }}
            >
              💬
            </Box>
            <Box sx={{ fontSize: 18, fontWeight: 500 }}>
              Selecciona una conversación
            </Box>
            <Box sx={{ fontSize: 14, mt: 1 }}>
              Elige una conversación del panel izquierdo para comenzar
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
