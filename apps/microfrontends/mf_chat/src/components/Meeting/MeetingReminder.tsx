import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import { Bell } from 'lucide-react'
import { memo } from 'react'
import type { Reunion } from '../../types/meeting.types'

interface MeetingReminderProps {
  open: boolean
  reunion: Reunion | null
  minutosRestantes: number
  onClose: () => void
  onVerDetalle?: (reunionId: number) => void
}

export const MeetingReminder = memo(function MeetingReminder({
  open,
  reunion,
  minutosRestantes,
  onClose,
  onVerDetalle,
}: MeetingReminderProps) {
  if (!reunion) return null

  const mensaje =
    minutosRestantes <= 0
      ? `La reunión "${reunion.titulo}" está comenzando`
      : `La reunión "${reunion.titulo}" comienza en ${minutosRestantes} min`

  return (
    <Snackbar
      open={open}
      autoHideDuration={10000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        icon={<Bell size={18} />}
        severity="info"
        onClose={onClose}
        action={
          onVerDetalle ? (
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                onVerDetalle(reunion.id)
                onClose()
              }}
            >
              Ver
            </Button>
          ) : undefined
        }
        sx={{ minWidth: 280 }}
      >
        {mensaje}
      </Alert>
    </Snackbar>
  )
})
