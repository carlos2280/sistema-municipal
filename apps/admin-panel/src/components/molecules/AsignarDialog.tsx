import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { AsignarTicketInput } from '@/types/mesa-ayuda'

const schema = z.object({
  asignadoNombre: z.string().min(1, 'Ingresa el nombre del encargado').max(200),
})

type FormValues = z.infer<typeof schema>

interface AsignarDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AsignarTicketInput) => void
  isLoading: boolean
  asignadoActual?: string | null
}

export function AsignarDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  asignadoActual,
}: AsignarDialogProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { asignadoNombre: asignadoActual ?? '' },
  })

  function handleClose() {
    reset()
    onClose()
  }

  function handleValid(values: FormValues) {
    onSubmit({ asignadoId: 0, asignadoNombre: values.asignadoNombre })
    reset()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)' } } }}>
      <DialogTitle>Asignar Ticket</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Controller
          name="asignadoNombre"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre del encargado"
              fullWidth
              size="small"
              error={!!errors.asignadoNombre}
              helperText={errors.asignadoNombre?.message}
              autoFocus
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit(handleValid)} disabled={isLoading}>
          Asignar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
