import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { EstadoTicket, TicketHistorial } from '@/types/mesa-ayuda'
import { EstadoChip } from '@/components/atoms/EstadoChip'

interface TicketTimelineItemProps {
  historial: TicketHistorial
  isLast?: boolean
}

function getDotColor(theme: Theme, estadoNuevo: EstadoTicket): string {
  switch (estadoNuevo) {
    case 'resuelto':
    case 'cerrado':
      return theme.palette.success.main
    case 'en_progreso':
      return theme.palette.warning.main
    case 'abierto':
      return theme.palette.info.main
    default:
      return theme.palette.primary.main
  }
}

export function TicketTimelineItem({ historial, isLast = false }: TicketTimelineItemProps) {
  const theme = useTheme()

  const formattedDate = format(parseISO(historial.createdAt), 'd MMM yyyy, HH:mm', {
    locale: es,
  })

  const dotColor = getDotColor(theme, historial.estadoNuevo)

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        pb: isLast ? 0 : 2,
        position: 'relative',
        pl: 3,
        '&::before': isLast
          ? undefined
          : {
              content: '""',
              position: 'absolute',
              left: '7px',
              top: '20px',
              bottom: 0,
              width: '1px',
              background: `linear-gradient(to bottom, ${alpha(theme.palette.divider, 0.8)}, ${alpha(theme.palette.divider, 0.1)})`,
            },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 2,
          top: 5,
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: dotColor,
          border: `2px solid ${alpha(dotColor, 0.3)}`,
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1 }}>
        {historial.estadoAnterior && historial.estadoNuevo ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <EstadoChip estado={historial.estadoAnterior} size="small" />
            <SwapHorizIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <EstadoChip estado={historial.estadoNuevo} size="small" />
          </Box>
        ) : (
          <Typography variant="body2" fontWeight={600}>
            {historial.accion ?? `→ ${historial.estadoNuevo}`}
          </Typography>
        )}
        {historial.motivo && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
            {historial.motivo}
          </Typography>
        )}
        {historial.detalle && !historial.motivo && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
            {historial.detalle}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {historial.ejecutadoPor ?? historial.usuario} — {formattedDate}
        </Typography>
      </Box>
    </Box>
  )
}
