import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { ArrowLeft, MoreVertical, Phone, Users, Video, X } from 'lucide-react'
import { SystemGroupBadge } from '../shared'

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
}

function getAvatarColor(name: string): string {
  const colors = [
    '#7C3AED',
    '#2563EB',
    '#059669',
    '#DC2626',
    '#D97706',
    '#7C3AED',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
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
}: ChatHeaderProps) {
  const displayName = nombre || `Conversación ${conversacionId}`
  const isOnline = online ?? false

  const handleVideoCall = () => {
    console.log('Iniciar videollamada')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.5,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Back button + User Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onBack && (
          <IconButton size="small" onClick={onBack} sx={{ color: 'text.secondary' }}>
            <ArrowLeft size={20} />
          </IconButton>
        )}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: esGrupo ? 2 : '50%',
            bgcolor: getAvatarColor(displayName),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
          }}
        >
          {esGrupo ? (
            <Users size={20} />
          ) : (
            displayName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
          )}
        </Box>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
              {displayName}
            </Typography>
            {esSistema && <SystemGroupBadge />}
          </Box>
          {esGrupo ? (
            <Typography
              onClick={onShowMembers}
              sx={{
                fontSize: 12,
                color: 'text.secondary',
                cursor: onShowMembers ? 'pointer' : 'default',
                '&:hover': onShowMembers
                  ? { color: 'primary.main' }
                  : {},
              }}
            >
              {participantesCount} miembros
            </Typography>
          ) : (
            <Typography
              sx={{
                fontSize: 12,
                color: isOnline ? 'success.main' : 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: isOnline ? 'success.main' : 'grey.400',
                }}
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
        <IconButton
          size="small"
          sx={{ color: 'text.secondary' }}
          title="Llamada de voz"
        >
          <Phone size={20} />
        </IconButton>
        <IconButton
          size="small"
          sx={{ color: 'text.secondary' }}
          title="Videollamada"
          onClick={handleVideoCall}
        >
          <Video size={20} />
        </IconButton>
        <IconButton size="small" sx={{ color: 'text.secondary' }} title="Más">
          <MoreVertical size={20} />
        </IconButton>
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }} title="Cerrar">
            <X size={20} />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}
