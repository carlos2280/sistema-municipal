import type { AdminTicketDetail } from '@/types/mesa-ayuda'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface InfoRowProps {
  label: string
  value: React.ReactNode
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Box sx={{ display: 'flex', py: 0.75 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ width: 140, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="body2">{value ?? '—'}</Typography>
    </Box>
  )
}

function fmt(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy, HH:mm', { locale: es })
}

interface TicketInfoCardProps {
  ticket: AdminTicketDetail
}

export function TicketInfoCard({ ticket }: TicketInfoCardProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          Información
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        <InfoRow label="Categoría" value={ticket.categoriaNombre} />
        <InfoRow label="Prioridad" value={ticket.prioridadNombre} />
        <InfoRow label="Solicitante" value={ticket.solicitante} />
        <InfoRow label="Email" value={ticket.emailSolicitante} />
        <InfoRow label="Asignado" value={ticket.asignado ?? 'Sin asignar'} />
        <InfoRow
          label="Fecha límite SLA"
          value={ticket.fechaLimite ? fmt(ticket.fechaLimite) : 'Sin SLA'}
        />
        <InfoRow
          label="Fecha resolución"
          value={ticket.fechaResolucion ? fmt(ticket.fechaResolucion) : '—'}
        />
        <InfoRow label="Creado" value={fmt(ticket.createdAt)} />
        <InfoRow label="Actualizado" value={fmt(ticket.updatedAt)} />
      </CardContent>
    </Card>
  )
}
