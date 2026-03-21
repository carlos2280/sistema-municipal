import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { AgregarComentarioInput } from '@/types/mesa-ayuda'

const schema = z.object({
  contenido: z.string().min(1, 'El comentario no puede estar vacío').max(2000),
  esInterno: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface ComentarioFormProps {
  onSubmit: (data: AgregarComentarioInput) => void
  isLoading: boolean
}

export function ComentarioForm({ onSubmit, isLoading }: ComentarioFormProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { contenido: '', esInterno: false },
  })

  function handleValid(values: FormValues) {
    onSubmit(values)
    reset()
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleValid)} sx={{ mt: 2 }}>
      <Controller
        name="contenido"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            multiline
            rows={3}
            fullWidth
            placeholder="Escribe un comentario..."
            error={!!errors.contenido}
            helperText={errors.contenido?.message}
            size="small"
            sx={{ mb: 1 }}
          />
        )}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Controller
          name="esInterno"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  size="small"
                  color="warning"
                />
              }
              label="Nota interna"
              slotProps={{ typography: { variant: 'body2' } }}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={isLoading}
          endIcon={<SendIcon />}
        >
          Enviar
        </Button>
      </Box>
    </Box>
  )
}
