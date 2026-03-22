import TicketDetail from '@/components/organisms/TicketDetail'
import { useTicketDetalle } from '@/hooks/useTicketDetalle'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

interface DetalleTicketProps {
  ticketId: number
  onBack: () => void
}

function DetalleTicket({ ticketId, onBack }: DetalleTicketProps) {
  const theme = useTheme()
  const { ticket, isLoading, agregarComentario, isAddingComentario } =
    useTicketDetalle(ticketId)

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.disabled,
          cursor: 'pointer',
          mb: 2,
          display: 'block',
          '&:hover': { color: theme.palette.text.secondary },
        }}
        onClick={onBack}
      >
        ← Volver a bandeja
      </Typography>

      <TicketDetail
        ticket={ticket}
        isLoading={isLoading}
        onAgregarComentario={agregarComentario}
        isAddingComentario={isAddingComentario}
      />
    </Box>
  )
}

export default DetalleTicket
