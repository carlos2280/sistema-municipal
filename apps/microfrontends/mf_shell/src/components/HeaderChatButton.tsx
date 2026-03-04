import { useState, useEffect, type FC } from 'react'
import { loadRemote } from '@module-federation/enhanced/runtime'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import { alpha, styled } from '@mui/material/styles'
import { MessageSquare } from 'lucide-react'
import { selectModulosActivos, useAppSelector, type ActiveModule } from 'mf_store/store'

// Mismo estilo base que AppBarIconButton en AppLayout — mantener sincronizados
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 10,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  transition: theme.transitions.create(['background-color', 'color', 'transform'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    transform: 'scale(1.05)',
  },
}))

interface HeaderChatButtonProps {
  onClick: () => void
  unreadCount?: number
}

interface ChatButtonComponentProps {
  unreadCount?: number
  onClick?: () => void
}

/**
 * Botón de chat para el header.
 * Intenta cargar el componente de mf_chat, con fallback local si no está disponible.
 */
export function HeaderChatButton({ onClick, unreadCount = 0 }: HeaderChatButtonProps) {
  const modulosActivos = useAppSelector(selectModulosActivos)
  const isChatActive = modulosActivos.some((m: ActiveModule) => m.codigo === 'chat')
  const [RemoteChatButton, setRemoteChatButton] = useState<FC<ChatButtonComponentProps> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let mounted = true

    loadRemote<{ ChatButton: FC<ChatButtonComponentProps> }>('mf_chat/ChatButton')
      .then((mod) => {
        if (mounted && mod?.ChatButton) {
          setRemoteChatButton(() => mod.ChatButton)
          setIsLoading(false)
        } else if (mounted) {
          setLoadFailed(true)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.warn('[HeaderChatButton] mf_chat no disponible, usando fallback local:', err?.message)
        if (mounted) {
          setLoadFailed(true)
          setIsLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  // Ocultar si módulo chat no está activo
  if (!isChatActive) return null

  // Loading state
  if (isLoading) {
    return (
      <IconButton disabled sx={{ width: 40, height: 40 }}>
        <Skeleton variant="circular" width={24} height={24} />
      </IconButton>
    )
  }

  // Si falló la carga o no hay componente remoto, usar fallback local
  if (loadFailed || !RemoteChatButton) {
    return <LocalChatButton onClick={onClick} unreadCount={unreadCount} />
  }

  // Componente remoto cargado correctamente
  return <RemoteChatButton unreadCount={unreadCount} onClick={onClick} />
}

/**
 * Botón de chat local (usado como fallback si mf_chat no está disponible)
 */
export function LocalChatButton({ onClick, unreadCount = 0 }: HeaderChatButtonProps) {
  return (
    <Tooltip title="Chat" arrow disableInteractive>
      <StyledIconButton onClick={onClick} aria-label="Abrir chat">
        <Badge
          badgeContent={unreadCount}
          color="primary"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: 10,
              height: 18,
              minWidth: 18,
            },
          }}
        >
          <MessageSquare size={20} />
        </Badge>
      </StyledIconButton>
    </Tooltip>
  )
}

// Exportar LocalChatButton como HeaderChatButtonFallback para compatibilidad
export const HeaderChatButtonFallback = LocalChatButton

export default HeaderChatButton
