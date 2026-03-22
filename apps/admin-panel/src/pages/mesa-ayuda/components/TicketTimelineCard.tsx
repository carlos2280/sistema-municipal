import { TicketTimelineItem } from '@/components/molecules'
import type { TicketHistorial } from '@/types/mesa-ayuda'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

interface TicketTimelineCardProps {
  historial: TicketHistorial[]
}

export function TicketTimelineCard({ historial }: TicketTimelineCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          Historial de Estados
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        {historial.map((item, index) => (
          <TicketTimelineItem
            key={item.id}
            historial={item}
            isLast={index === historial.length - 1}
          />
        ))}
        {historial.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Sin historial
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
