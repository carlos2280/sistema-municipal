import TicketForm from '@/components/organisms/TicketForm'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'

/**
 * Pagina standalone de nuevo ticket.
 * Usada cuando el shell la monta como ruta independiente.
 */
function NuevoTicketPage() {
  const theme = useTheme()
  const [created, setCreated] = useState(false)

  if (created) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography
          variant="h6"
          color="text.primary"
          sx={{ fontWeight: 600, mb: 1 }}
        >
          Ticket creado exitosamente
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.primary.main,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => setCreated(false)}
        >
          Crear otro ticket
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <TicketForm
        onSuccess={() => setCreated(true)}
        onCancel={() => setCreated(false)}
      />
    </Box>
  )
}

export default NuevoTicketPage
