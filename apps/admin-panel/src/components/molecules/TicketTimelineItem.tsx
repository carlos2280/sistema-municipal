import CircleIcon from '@mui/icons-material/Circle'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TicketHistorial } from '@/types/mesa-ayuda'
import { EstadoChip } from '@/components/atoms/EstadoChip'

interface TicketTimelineItemProps {
  historial: TicketHistorial
  isLast?: boolean
}

export function TicketTimelineItem({ historial, isLast = false }: TicketTimelineItemProps) {
  const theme = useTheme()

  const formattedDate = format(parseISO(historial.createdAt), "d MMM yyyy, HH:mm", {
    locale: es,
  })

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        pb: isLast ? 0 : 2,
        borderLeft: isLast ? '2px solid transparent' : '2px solid',
        borderColor: isLast ? 'transparent' : theme.palette.divider,
        ml: '5px',
        pl: 2,
        position: 'relative',
      }}
    >
      <CircleIcon
        color="primary"
        sx={{ fontSize: 12, position: 'absolute', left: -7, top: 4 }}
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
