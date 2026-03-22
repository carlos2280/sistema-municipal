import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

interface LogoutDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function LogoutDialog({
  open,
  onClose,
  onConfirm,
}: LogoutDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Cerrar sesión</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Confirmas que deseas cerrar la sesión del panel de administración?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disableElevation
        >
          Cerrar sesión
        </Button>
      </DialogActions>
    </Dialog>
  )
}
