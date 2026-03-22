import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { AdminCategoria, CategoriaColor, CreateCategoriaInput } from '@/types/mesa-ayuda'

const COLORES: CategoriaColor[] = ['primary', 'secondary', 'error', 'warning', 'info', 'success']

const schema = z.object({
  codigo: z.string().min(1).max(50).regex(/^[a-z_]+$/, 'Solo letras minúsculas y guiones bajos'),
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  descripcion: z.string().max(500).optional(),
  icono: z.string().max(50).optional(),
  color: z.enum(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
  orden: z.number().int().min(0).optional(),
})

type FormValues = z.infer<typeof schema>

interface CategoriaFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateCategoriaInput) => void
  isLoading: boolean
  categoria?: AdminCategoria | null
}

export function CategoriaFormDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  categoria,
}: CategoriaFormDialogProps) {
  const isEditing = !!categoria

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      codigo: categoria?.codigo ?? '',
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
      icono: categoria?.icono ?? '',
      color: (categoria?.color as CategoriaColor) ?? 'primary',
      orden: categoria?.orden ?? 0,
    },
  })

  function handleClose() {
    reset()
    onClose()
  }

  function handleValid(values: FormValues) {
    onSubmit({
      codigo: values.codigo,
      nombre: values.nombre,
      descripcion: values.descripcion || undefined,
      icono: values.icono || undefined,
      color: values.color,
      orden: values.orden,
    })
    reset()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)' } } }}>
      <DialogTitle>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <Controller
          name="codigo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Código"
              fullWidth
              size="small"
              disabled={isEditing}
              error={!!errors.codigo}
              helperText={errors.codigo?.message ?? 'Ej: infraestructura'}
            />
          )}
        />
        <Controller
          name="nombre"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre"
              fullWidth
              size="small"
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />
          )}
        />
        <Controller
          name="descripcion"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Descripción (opcional)"
              fullWidth
              size="small"
              multiline
              rows={2}
              error={!!errors.descripcion}
              helperText={errors.descripcion?.message}
            />
          )}
        />
        <Controller
          name="icono"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Ícono (opcional)"
              fullWidth
              size="small"
              placeholder="Ej: computer"
              error={!!errors.icono}
              helperText={errors.icono?.message}
            />
          )}
        />
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small" error={!!errors.color}>
              <InputLabel>Color</InputLabel>
              <Select {...field} label="Color">
                {COLORES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
              {errors.color && <FormHelperText>{errors.color.message}</FormHelperText>}
            </FormControl>
          )}
        />
        <Controller
          name="orden"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
              label="Orden"
              type="number"
              fullWidth
              size="small"
              error={!!errors.orden}
              helperText={errors.orden?.message}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit(handleValid)} disabled={isLoading}>
          {isEditing ? 'Guardar cambios' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
