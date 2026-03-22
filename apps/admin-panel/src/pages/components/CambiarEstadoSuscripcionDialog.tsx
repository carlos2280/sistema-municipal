import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import type { EstadoSuscripcion } from '@/types'

interface CambiarEstadoSuscripcionDialogProps {
  open: boolean
  estado: EstadoSuscripcion
  motivo: string
  isPending: boolean
  onClose: () => void
  onEstadoChange: (estado: EstadoSuscripcion) => void
  onMotivoChange: (motivo: string) => void
  onConfirm: () => void
}

export function CambiarEstadoSuscripcionDialog({
  open,
  estado,
  motivo,
  isPending,
  onClose,
  onEstadoChange,
  onMotivoChange,
  onConfirm,
}: CambiarEstadoSuscripcionDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)' } } }}
    >
      <DialogTitle>Cambiar Estado</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <FormControl fullWidth>
          <InputLabel>Estado</InputLabel>
          <Select
            value={estado}
            label="Estado"
            onChange={(e) => onEstadoChange(e.target.value as EstadoSuscripcion)}
          >
            <MenuItem value="activa">Activa</MenuItem>
            <MenuItem value="trial">Trial</MenuItem>
            <MenuItem value="suspendida">Suspendida</MenuItem>
            <MenuItem value="cancelada">Cancelada</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Motivo (opcional)"
          multiline
          rows={2}
          value={motivo}
          onChange={(e) => onMotivoChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onConfirm} disabled={isPending}>
          {isPending ? 'Guardando...' : 'Cambiar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
