import type { Comentario } from '@/types/mesa-ayuda.types'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

interface ComentarioItemProps {
  comentario: Comentario
}

function ComentarioItem({ comentario }: ComentarioItemProps) {
  const theme = useTheme()
  const initials = comentario.autorNombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const fecha = new Date(comentario.createdAt).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: '0.75rem',
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        {initials}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
          >
            {comentario.autorNombre}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {fecha}
          </Typography>
          {comentario.esInterno && (
            <Chip
              label="Interno"
              size="small"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                borderColor: theme.palette.warning.main,
                color: theme.palette.warning.main,
              }}
            />
          )}
        </Box>

        {/* Contenido */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            background: comentario.esInterno
              ? alpha(theme.palette.warning.light, 0.08)
              : alpha(theme.meridian.surfaces.s2, 0.6),
            border: `1px solid ${
              comentario.esInterno
                ? alpha(theme.palette.warning.main, 0.2)
                : theme.meridian.borders.muted
            }`,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: 'pre-wrap' }}
          >
            {comentario.contenido}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ComentarioItem
