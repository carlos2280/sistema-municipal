import { ComentarioForm, ComentarioItem } from '@/components/molecules'
import type {
  AgregarComentarioInput,
  TicketComentario,
} from '@/types/mesa-ayuda'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

interface TicketComentariosCardProps {
  comentarios: TicketComentario[]
  isLoading: boolean
  onSubmit: (data: AgregarComentarioInput) => void
}

export function TicketComentariosCard({
  comentarios,
  isLoading,
  onSubmit,
}: TicketComentariosCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Comentarios ({comentarios.length})
        </Typography>
        {comentarios.map((comentario) => (
          <ComentarioItem key={comentario.id} comentario={comentario} />
        ))}
        {comentarios.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No hay comentarios aún
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />
        <ComentarioForm onSubmit={onSubmit} isLoading={isLoading} />
      </CardContent>
    </Card>
  )
}
