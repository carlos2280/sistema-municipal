import type { UpdateTenantInput } from '@/types'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

interface EditTenantDialogProps {
  open: boolean
  form: UpdateTenantInput
  isPending: boolean
  onClose: () => void
  onChange: (form: UpdateTenantInput) => void
  onSave: () => void
}

export function EditTenantDialog({
  open,
  form,
  isPending,
  onClose,
  onChange,
  onSave,
}: EditTenantDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)' } } }}
    >
      <DialogTitle>Editar Municipalidad</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: '8px !important',
        }}
      >
        <TextField
          label="Nombre"
          value={form.nombre ?? ''}
          onChange={(e) => onChange({ ...form, nombre: e.target.value })}
        />
        <TextField
          label="Dominio Base"
          value={form.dominioBase ?? ''}
          onChange={(e) => onChange({ ...form, dominioBase: e.target.value })}
        />
        <TextField
          label="RUT"
          value={form.rut ?? ''}
          onChange={(e) =>
            onChange({ ...form, rut: e.target.value || undefined })
          }
        />
        <TextField
          label="Dirección"
          value={form.direccion ?? ''}
          onChange={(e) =>
            onChange({ ...form, direccion: e.target.value || undefined })
          }
        />
        <TextField
          label="Teléfono"
          value={form.telefono ?? ''}
          onChange={(e) =>
            onChange({ ...form, telefono: e.target.value || undefined })
          }
        />
        <TextField
          label="Email de Contacto"
          value={form.emailContacto ?? ''}
          onChange={(e) =>
            onChange({ ...form, emailContacto: e.target.value || undefined })
          }
        />
        <TextField
          label="Max Usuarios"
          type="number"
          value={form.maxUsuarios ?? ''}
          onChange={(e) =>
            onChange({
              ...form,
              maxUsuarios: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave} disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
