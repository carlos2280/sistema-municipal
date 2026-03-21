import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { AdminCategoria, CambiarCategoriaInput } from '@/types/mesa-ayuda'

const schema = z.object({
  categoriaId: z.number().min(1),
})

type FormValues = z.infer<typeof schema>

interface CambiarCategoriaDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CambiarCategoriaInput) => void
  isLoading: boolean
  categorias: AdminCategoria[]
  categoriaActualId?: number
}

export function CambiarCategoriaDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  categorias,
  categoriaActualId,
}: CambiarCategoriaDialogProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { categoriaId: categoriaActualId ?? categorias[0]?.id ?? 0 },
  })

  function handleClose() {
    reset()
    onClose()
  }

  function handleValid(values: FormValues) {
    onSubmit({ categoriaId: values.categoriaId })
    reset()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cambiar Categoría</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Controller
          name="categoriaId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Categoría</InputLabel>
              <Select {...field} label="Categoría" error={!!errors.categoriaId}>
                {categorias.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit(handleValid)} disabled={isLoading}>
          Cambiar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
