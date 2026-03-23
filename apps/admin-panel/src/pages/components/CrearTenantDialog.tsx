import type { CreateTenantInput } from '@/types'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface CrearTenantDialogProps {
  open: boolean
  form: CreateTenantInput
  error: string
  isPending: boolean
  onClose: () => void
  onChange: (form: CreateTenantInput) => void
  onSubmit: () => void
}

export function CrearTenantDialog({
  open,
  form,
  error,
  isPending,
  onClose,
  onChange,
  onSubmit,
}: CrearTenantDialogProps) {
  const emailInvalido =
    form.adminEmail.length > 0 && !EMAIL_REGEX.test(form.adminEmail)

  const submitDisabled =
    isPending ||
    !form.nombre ||
    !form.slug ||
    !form.dominioBase ||
    !form.adminNombre ||
    !EMAIL_REGEX.test(form.adminEmail)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)' } } }}
    >
      <DialogTitle>Nueva Municipalidad</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: '8px !important',
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}

        <Typography variant="overline" color="text.secondary">
          Datos del municipio
        </Typography>

        <TextField
          label="Nombre"
          required
          value={form.nombre}
          onChange={(e) => onChange({ ...form, nombre: e.target.value })}
        />
        <TextField
          label="Slug"
          required
          value={form.slug}
          onChange={(e) =>
            onChange({
              ...form,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
            })
          }
          helperText="Solo letras minúsculas, números y guiones"
        />
        <TextField
          label="Dominio Base"
          required
          value={form.dominioBase}
          onChange={(e) => onChange({ ...form, dominioBase: e.target.value })}
          helperText="Ej: santiago.plataforma.cl"
        />
        <TextField
          label="RUT (opcional)"
          value={form.rut ?? ''}
          onChange={(e) =>
            onChange({ ...form, rut: e.target.value || undefined })
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
          helperText="Por defecto: 50"
        />

        <Box sx={{ pt: 1 }}>
          <Typography variant="overline" color="text.secondary">
            Administrador inicial
          </Typography>
        </Box>

        <TextField
          label="Email del admin"
          type="email"
          required
          value={form.adminEmail}
          placeholder="admin@pelarco.cl"
          onChange={(e) => onChange({ ...form, adminEmail: e.target.value })}
          error={emailInvalido}
          helperText={emailInvalido ? 'Ingresa un email válido' : undefined}
        />
        <TextField
          label="Nombre del admin"
          required
          value={form.adminNombre}
          placeholder="Juan Pérez"
          onChange={(e) => onChange({ ...form, adminNombre: e.target.value })}
        />

        <Typography variant="caption" color="text.secondary">
          Se enviará un email con credenciales temporales a esta dirección.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={submitDisabled}
        >
          {isPending ? 'Creando...' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
