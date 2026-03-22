import MoreVertIcon from '@mui/icons-material/MoreVert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { EstadoChip, PrioridadChip, SlaIndicator, TenantBadge } from '@/components/atoms'
import type { AdminTicketDetail } from '@/types/mesa-ayuda'

interface TicketHeaderProps {
  ticket: AdminTicketDetail
  isMutating: boolean
  onCambiarEstado: () => void
  onAsignar: () => void
  onCambiarPrioridad: () => void
  onCambiarCategoria: () => void
}

export function TicketHeader({
  ticket,
  isMutating,
  onCambiarEstado,
  onAsignar,
  onCambiarPrioridad,
  onCambiarCategoria,
}: TicketHeaderProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              {ticket.numero} — {ticket.titulo}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <EstadoChip estado={ticket.estado} />
              <PrioridadChip
                codigo={ticket.prioridadCodigo}
                nombre={ticket.prioridadNombre}
                color={ticket.prioridadColor}
              />
              <SlaIndicator fechaLimite={ticket.fechaLimite ?? null} estado={ticket.estado} />
              <TenantBadge nombre={ticket.tenantNombre} slug={ticket.tenantSlug} />
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={onCambiarEstado}
            disabled={isMutating || ticket.estado === 'cerrado'}
          >
            Cambiar Estado
          </Button>
          <Button variant="outlined" size="small" onClick={onAsignar} disabled={isMutating}>
            Asignar
          </Button>
          <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} disabled={isMutating}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
            <MenuItem onClick={() => { setMenuAnchor(null); onCambiarPrioridad() }}>
              Cambiar Prioridad
            </MenuItem>
            <MenuItem onClick={() => { setMenuAnchor(null); onCambiarCategoria() }}>
              Cambiar Categoría
            </MenuItem>
          </Menu>
        </Stack>
      </CardContent>
    </Card>
  )
}
