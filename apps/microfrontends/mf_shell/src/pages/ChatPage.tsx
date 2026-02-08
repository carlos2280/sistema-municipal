import { Suspense, lazy } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// Componente de error
function ChatError() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 2,
      }}
    >
      <Typography color="error">
        Error al cargar el módulo de chat
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Por favor, intenta recargar la página
      </Typography>
    </Box>
  )
}

// Carga dinámica del ChatPage desde mf_chat
const MfChatPage = lazy(() =>
  import('mf_chat/components')
    .then((mod) => ({ default: mod.ChatPage }))
    .catch((err) => {
      console.error('[ChatPage] Error cargando mf_chat/components:', err)
      return { default: ChatError }
    })
)

function ChatLoadingFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Cargando chat...
      </Typography>
    </Box>
  )
}

/**
 * Página wrapper para el módulo de chat.
 * Carga dinámicamente el microfrontend mf_chat.
 */
export default function ChatPage() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Suspense fallback={<ChatLoadingFallback />}>
        <MfChatPage />
      </Suspense>
    </Box>
  )
}
