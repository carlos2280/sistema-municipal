import { useState, useEffect, useRef, type FC } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import type { Theme } from '@mui/material/styles'
import { MessageSquare } from 'lucide-react'
import { useTheme as useAppTheme } from 'mf_ui/theme'

interface ChatDrawerProps {
  open: boolean
  onClose: () => void
  theme?: Theme
}

/**
 * Wrapper para el ChatDrawer de mf_chat.
 * Carga dinámicamente el componente y muestra un fallback si no está disponible.
 * Usa el tema de mf_ui para que el drawer herede los colores personalizados.
 */
export function ChatDrawerWrapper({ open, onClose }: ChatDrawerProps) {
  const { theme } = useAppTheme()
  const [RemoteChatDrawer, setRemoteChatDrawer] = useState<FC<ChatDrawerProps> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const hasAttemptedLoadRef = useRef(false)

  useEffect(() => {
    // Solo cargar cuando se abre por primera vez
    if (!open || hasAttemptedLoadRef.current) return

    hasAttemptedLoadRef.current = true
    setIsLoading(true)

    import('mf_chat/ChatDrawer')
      .then((mod) => {
        const ChatDrawerComponent = mod.ChatDrawer || mod.default

        if (ChatDrawerComponent) {
          setRemoteChatDrawer(() => ChatDrawerComponent)
        } else {
          console.error('[ChatDrawerWrapper] No se encontró ChatDrawer en el módulo')
          setLoadFailed(true)
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('[ChatDrawerWrapper] Error al cargar:', err)
        setLoadFailed(true)
        setIsLoading(false)
      })
  }, [open])

  // Si el drawer no está abierto, no renderizar nada
  if (!open) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: { sx: { bgcolor: theme.palette.background.paper } }
        }}
      >
        <Box
          sx={{
            width: 420,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <CircularProgress color="primary" />
          <Typography color="text.secondary">Cargando chat...</Typography>
        </Box>
      </Drawer>
    )
  }

  // Si falló la carga, mostrar mensaje
  if (loadFailed || !RemoteChatDrawer) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: { sx: { bgcolor: theme.palette.background.paper } }
        }}
      >
        <Box
          sx={{
            width: 420,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 3,
            bgcolor: 'background.paper',
          }}
        >
          <MessageSquare size={48} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" textAlign="center">
            Chat no disponible
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            El módulo de chat no está cargado. Intenta recargar la página.
          </Typography>
        </Box>
      </Drawer>
    )
  }

  // Componente remoto cargado correctamente
  // Pasar el tema como prop para que el Drawer (portal) lo use correctamente
  return <RemoteChatDrawer open={open} onClose={onClose} theme={theme} />
}

export default ChatDrawerWrapper
