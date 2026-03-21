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
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { CambiarEstadoInput, EstadoTicket } from '@/types/mesa-ayuda'
import { TRANSICIONES_ESTADO } from '@/types/mesa-ayuda'

const ESTADO_LABEL: Record<EstadoTicket, string> = {
  abierto: 'Abierto',
  en_progreso: 'En Progreso',
  en_espera: 'En Espera',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
}

const schema = z.object({
  estado: z.enum(['abierto', 'en_progreso', 'en_espera', 'resuelto', 'cerrado']),
  motivo: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

interface CambiarEstadoDialogProps {
  open: boolean
  onClose: () => void
  estadoActual: EstadoTicket
  onSubmit: (data: CambiarEstadoInput) => void
  isLoading: boolean
}

export function CambiarEstadoDialog({
  open,
  onClose,
  estadoActual,
  onSubmit,
  isLoading,
}: CambiarEstadoDialogProps) {
  const transiciones = TRANSICIONES_ESTADO[estadoActual]

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { estado: transiciones[0] ?? 'cerrado', motivo: '' },
  })

  function handleClose() {
    reset()
    onClose()
  }

  function handleValid(values: FormValues) {
    onSubmit({ estado: values.estado, motivo: values.motivo || undefined })
    reset()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cambiar Estado del Ticket</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <Controller
          name="estado"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Nuevo Estado</InputLabel>
              <Select {...field} label="Nuevo Estado" error={!!errors.estado}>
                {transiciones.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {ESTADO_LABEL[estado]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <Controller
          name="motivo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Motivo (opcional)"
              multiline
              rows={2}
              fullWidth
              size="small"
              error={!!errors.motivo}
              helperText={errors.motivo?.message}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(handleValid)}
          disabled={isLoading || transiciones.length === 0}
        >
          Cambiar Estado
        </Button>
      </DialogActions>
    </Dialog>
  )
}
