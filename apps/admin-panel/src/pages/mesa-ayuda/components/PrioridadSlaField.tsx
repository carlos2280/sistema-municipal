import TextField from '@mui/material/TextField'
import type { ControllerRenderProps } from 'react-hook-form'

interface PrioridadSlaFieldProps {
  field: ControllerRenderProps<
    { nombre: string; color: string; slaHoras: number },
    'slaHoras'
  >
  error?: string
}

export function PrioridadSlaField({ field, error }: PrioridadSlaFieldProps) {
  return (
    <TextField
      {...field}
      onChange={(e) => field.onChange(Number(e.target.value))}
      size="small"
      type="number"
      fullWidth
      slotProps={{ htmlInput: { min: 1, max: 720 } }}
      error={!!error}
      helperText={error}
    />
  )
}
