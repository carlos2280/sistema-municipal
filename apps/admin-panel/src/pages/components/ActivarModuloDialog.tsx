import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

interface Modulo {
  id: number
  nombre: string
}

interface ActivarModuloDialogProps {
  open: boolean
  modulos: Modulo[]
  selectedId: number
  isPending: boolean
  onClose: () => void
  onSelect: (id: number) => void
  onActivar: () => void
}

export function ActivarModuloDialog({
  open,
  modulos,
  selectedId,
  isPending,
  onClose,
  onSelect,
  onActivar,
}: ActivarModuloDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)' } } }}
    >
      <DialogTitle>Activar Módulo</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Módulo</InputLabel>
          <Select
            value={selectedId}
            label="Módulo"
            onChange={(e) => onSelect(Number(e.target.value))}
          >
            {modulos.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onActivar}
          disabled={!selectedId || isPending}
        >
          {isPending ? 'Activando...' : 'Activar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
