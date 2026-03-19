import { SystemGroupBadge } from '@/components/atoms'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  ArrowLeft,
  CalendarPlus,
  MoreVertical,
  Phone,
  Users,
  Video,
  X,
} from 'lucide-react'
import { UserAvatar } from 'mf_ui/components'
import { StatusDot } from 'mf_ui/components'

interface ChatHeaderProps {
  conversacionId: number
  isConnected?: boolean
  nombre?: string
  online?: boolean
  esGrupo?: boolean
  esSistema?: boolean
  participantesCount?: number
  onBack?: () => void
  onClose?: () => void
  onShowMembers?: () => void
  onVoiceCall?: () => void
  onVideoCall?: () => void
  onScheduleMeeting?: () => void
}

export function ChatHeader({
  conversacionId,
  nombre,
  online,
  esGrupo = false,
  esSistema = false,
  participantesCount,
  onBack,
  onClose,
  onShowMembers,
  onVoiceCall,
  onVideoCall,
  onScheduleMeeting,
}: ChatHeaderProps) {
  const theme = useTheme()
  const displayName = nombre || `Conversación ${conversacionId}`
  const isOnline = online ?? false

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.5,
        py: 1.5,
        borderBottom: `1px solid ${theme.meridian.borders.default}`,
        bgcolor: theme.meridian.surfaces.s1,
      }}
    >
      {/* Back button + User Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onBack && (
          <IconButton
            size="small"
            onClick={onBack}
            sx={{ color: 'text.secondary' }}
          >
            <ArrowLeft size={20} />
          </IconButton>
        )}
        <UserAvatar
          name={displayName}
          size="md"
          status={esGrupo ? undefined : isOnline ? 'online' : 'offline'}
          icon={esGrupo ? <Users size={20} /> : undefined}
        />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '15px',
                fontFamily: '"Bricolage Grotesque", sans-serif',
              }}
            >
              {displayName}
            </Typography>
            {esSistema && <SystemGroupBadge />}
          </Box>
          {esGrupo ? (
            <Typography
              onClick={onShowMembers}
              sx={{
                fontSize: '12px',
                fontFamily: '"DM Sans", sans-serif',
                color: 'text.secondary',
                cursor: onShowMembers ? 'pointer' : 'default',
                '&:hover': onShowMembers ? { color: 'primary.main' } : {},
              }}
            >
              {participantesCount} miembros
            </Typography>
          ) : (
            <Typography
              sx={{
                fontSize: '12px',
                fontFamily: '"DM Sans", sans-serif',
                color: isOnline ? 'success.main' : 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <StatusDot
                color={isOnline ? 'success' : 'neutral'}
                size="small"
              />
              {isOnline ? 'En línea' : 'Desconectado'}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {esGrupo && onShowMembers && (
          <IconButton
            size="small"
            onClick={onShowMembers}
            sx={{ color: 'text.secondary' }}
            title="Miembros"
          >
            <Users size={20} />
          </IconButton>
        )}
        {onScheduleMeeting && (
          <IconButton
            size="small"
            sx={{ color: 'text.secondary' }}
            title="Programar reunión"
            onClick={onScheduleMeeting}
          >
            <CalendarPlus size={20} />
          </IconButton>
        )}
        <IconButton
          size="small"
          sx={{ color: 'text.secondary' }}
          title="Llamada de voz"
          onClick={onVoiceCall}
        >
          <Phone size={20} />
        </IconButton>
        <IconButton
          size="small"
          sx={{ color: 'text.secondary' }}
          title="Videollamada"
          onClick={onVideoCall}
        >
          <Video size={20} />
        </IconButton>
        <IconButton size="small" sx={{ color: 'text.secondary' }} title="Más">
          <MoreVertical size={20} />
        </IconButton>
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
            title="Cerrar"
          >
            <X size={20} />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}
