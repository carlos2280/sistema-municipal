import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { Building2, Users } from 'lucide-react'
import { SystemGroupBadge } from '../shared'

interface ConversationItemProps {
  id: number
  nombre: string
  ultimoMensaje: string
  hora: string
  noLeidos: number
  online: boolean
  tipo: 'directa' | 'grupo'
  sistema?: boolean
  isActive?: boolean
  onClick?: () => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
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

export function ConversationItem({
  nombre,
  ultimoMensaje,
  hora,
  noLeidos,
  online,
  tipo,
  sistema,
  isActive,
  onClick,
}: ConversationItemProps) {
  const theme = useTheme()

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2.5,
        py: 1.5,
        cursor: 'pointer',
        bgcolor: isActive ? 'primary.light' : 'transparent',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          bgcolor: isActive ? 'primary.light' : theme.palette.action.hover,
        },
      }}
    >
      {/* Avatar */}
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: tipo === 'grupo' ? 2 : '50%',
            bgcolor: getAvatarColor(nombre),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {tipo === 'grupo' ? (
            sistema ? <Building2 size={20} /> : <Users size={20} />
          ) : (
            getInitials(nombre)
          )}
        </Box>
        {tipo === 'directa' && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: online ? 'success.main' : 'grey.400',
              border: `2px solid ${theme.palette.background.paper}`,
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: noLeidos > 0 ? 600 : 500,
                fontSize: 14,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {nombre}
            </Typography>
            {sistema && <SystemGroupBadge />}
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              color: noLeidos > 0 ? 'primary.main' : 'text.secondary',
              fontWeight: noLeidos > 0 ? 600 : 400,
              flexShrink: 0,
              ml: 1,
            }}
          >
            {hora}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 0.25,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ultimoMensaje}
          </Typography>
          {noLeidos > 0 && (
            <Badge
              badgeContent={noLeidos}
              color="primary"
              sx={{
                ml: 1,
                '& .MuiBadge-badge': {
                  fontSize: 11,
                  height: 18,
                  minWidth: 18,
                },
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}
