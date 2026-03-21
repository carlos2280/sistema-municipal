import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { AdminPrioridad, CambiarPrioridadInput } from '@/types/mesa-ayuda'

const schema = z.object({
  prioridadId: z.number().min(1),
  recalcularSla: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface CambiarPrioridadDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CambiarPrioridadInput) => void
  isLoading: boolean
  prioridades: AdminPrioridad[]
  prioridadActualId?: number
}

export function CambiarPrioridadDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  prioridades,
  prioridadActualId,
}: CambiarPrioridadDialogProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { prioridadId: prioridadActualId ?? prioridades[0]?.id ?? 0, recalcularSla: true },
  })

  function handleClose() {
    reset()
    onClose()
  }

  function handleValid(values: FormValues) {
    onSubmit({ prioridadId: values.prioridadId, recalcularSla: values.recalcularSla })
    reset()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cambiar Prioridad</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <Controller
          name="prioridadId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Prioridad</InputLabel>
              <Select {...field} label="Prioridad" error={!!errors.prioridadId}>
                {prioridades.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <Controller
          name="recalcularSla"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={field.onChange}
                  size="small"
                />
              }
              label="Recalcular fecha límite SLA"
            />
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
