import LockIcon from '@mui/icons-material/Lock'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TicketComentario } from '@/types/mesa-ayuda'

interface ComentarioItemProps {
  comentario: TicketComentario
}

export function ComentarioItem({ comentario }: ComentarioItemProps) {
  const theme = useTheme()

  const autorNombre = comentario.autorNombre ?? comentario.autor ?? 'Desconocido'
  const contenido = comentario.contenido ?? comentario.texto ?? ''
  const esInterno = comentario.esInterno ?? false

  const formattedDate = format(parseISO(comentario.createdAt), "d MMM yyyy, HH:mm", {
    locale: es,
  })

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: esInterno
          ? alpha(theme.palette.warning.main, 0.08)
          : theme.palette.action.hover,
        border: '1px solid',
        borderColor: esInterno
          ? alpha(theme.palette.warning.main, 0.25)
          : theme.palette.divider,
        mb: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {autorNombre}
          </Typography>
          {esInterno && (
            <Chip
              icon={<LockIcon sx={{ fontSize: 12 }} />}
              label="Interno"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ height: 20, fontSize: 10 }}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {formattedDate}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {contenido}
      </Typography>
    </Box>
  )
}
