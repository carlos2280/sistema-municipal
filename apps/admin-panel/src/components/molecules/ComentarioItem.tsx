import LockIcon from '@mui/icons-material/Lock'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TicketComentario } from '@/types/mesa-ayuda'

interface ComentarioItemProps {
  comentario: TicketComentario
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function getAvatarColor(name: string): string {
  const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#FB923C']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function ComentarioItem({ comentario }: ComentarioItemProps) {
  const theme = useTheme()

  const autorNombre = comentario.autorNombre ?? comentario.autor ?? 'Desconocido'
  const contenido = comentario.contenido ?? comentario.texto ?? ''
  const esInterno = comentario.esInterno ?? false

  const formattedDate = format(parseISO(comentario.createdAt), 'd MMM yyyy, HH:mm', {
    locale: es,
  })

  const avatarColor = getAvatarColor(autorNombre)

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: esInterno
          ? alpha(theme.palette.warning.main, 0.08)
          : theme.meridian.surfaces.s2,
        border: '1px solid',
        borderColor: esInterno
          ? alpha(theme.palette.warning.main, 0.25)
          : theme.meridian.borders.default,
        mb: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: alpha(avatarColor, 0.2),
              color: avatarColor,
              border: `1px solid ${alpha(avatarColor, 0.3)}`,
            }}
          >
            {getInitials(autorNombre)}
          </Avatar>
          <Typography variant="body2" fontWeight={600}>
            {autorNombre}
          </Typography>
          {esInterno && (
            <Chip
              icon={<LockIcon sx={{ fontSize: '12px !important' }} />}
              label="Interno"
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 600,
                backgroundColor: alpha(theme.palette.warning.main, 0.15),
                color: theme.palette.warning.main,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                '& .MuiChip-icon': { color: theme.palette.warning.main },
              }}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
          {formattedDate}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', pl: '36px' }}>
        {contenido}
      </Typography>
    </Box>
  )
}
