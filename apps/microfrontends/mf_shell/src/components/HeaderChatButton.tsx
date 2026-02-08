import { useState, useEffect, type FC } from 'react'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import { MessageSquare } from 'lucide-react'

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
  const [RemoteChatButton, setRemoteChatButton] = useState<FC<ChatButtonComponentProps> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let mounted = true

    import('mf_chat/ChatButton')
      .then((mod) => {
        if (mounted) {
          setRemoteChatButton(() => mod.ChatButton)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.warn('[HeaderChatButton] mf_chat no disponible, usando fallback local:', err.message)
        if (mounted) {
          setLoadFailed(true)
          setIsLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

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
      <IconButton
        onClick={onClick}
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="primary"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: 10,
              height: 18,
              minWidth: 18,
              bgcolor: '#7C3AED',
            },
          }}
        >
          <MessageSquare size={20} />
        </Badge>
      </IconButton>
    </Tooltip>
  )
}

// Exportar LocalChatButton como HeaderChatButtonFallback para compatibilidad
export const HeaderChatButtonFallback = LocalChatButton

export default HeaderChatButton
