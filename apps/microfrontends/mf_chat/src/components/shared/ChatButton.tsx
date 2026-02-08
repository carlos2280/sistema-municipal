import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { MessageSquare } from 'lucide-react'

interface ChatButtonProps {
  unreadCount?: number
  onClick?: () => void
}

/**
 * Botón de chat para usar en el header del shell.
 * Muestra un badge con el número de mensajes no leídos.
 */
export function ChatButton({ unreadCount = 0, onClick }: ChatButtonProps) {
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
            bgcolor: 'primary.light',
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
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
      </IconButton>
    </Tooltip>
  )
}

export default ChatButton
