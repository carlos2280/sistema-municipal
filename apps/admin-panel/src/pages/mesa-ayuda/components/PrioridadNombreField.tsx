import TextField from '@mui/material/TextField'
import type { ControllerRenderProps } from 'react-hook-form'

interface PrioridadNombreFieldProps {
  field: ControllerRenderProps<
    { nombre: string; color: string; slaHoras: number },
    'nombre'
  >
  error?: string
}

export function PrioridadNombreField({
  field,
  error,
}: PrioridadNombreFieldProps) {
  return (
    <TextField
      {...field}
      size="small"
      fullWidth
      error={!!error}
      helperText={error}
    />
  )
}
