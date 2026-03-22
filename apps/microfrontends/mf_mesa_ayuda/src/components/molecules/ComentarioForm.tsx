import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import { alpha, useTheme } from '@mui/material/styles'
import { Send } from 'lucide-react'
import { useCallback, useState } from 'react'

interface ComentarioFormProps {
  onSubmit: (contenido: string, esInterno: boolean) => void
  isSubmitting: boolean
}

function ComentarioForm({ onSubmit, isSubmitting }: ComentarioFormProps) {
  const theme = useTheme()
  const [contenido, setContenido] = useState('')
  const [esInterno, setEsInterno] = useState(false)

  const handleSubmit = useCallback(() => {
    const trimmed = contenido.trim()
    if (!trimmed) return
    onSubmit(trimmed, esInterno)
    setContenido('')
    setEsInterno(false)
  }, [contenido, esInterno, onSubmit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        background: alpha(theme.meridian.surfaces.ground, 0.92),
        backdropFilter: 'blur(12px)',
        border: `1px solid ${theme.meridian.borders.muted}`,
      }}
    >
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={6}
        placeholder="Escribe un comentario... (Ctrl+Enter para enviar)"
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        onKeyDown={handleKeyDown}
        size="small"
        sx={{ mb: 1.5 }}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={esInterno}
              onChange={(e) => setEsInterno(e.target.checked)}
            />
          }
          label="Nota interna"
          slotProps={{
            typography: {
              variant: 'caption',
              color: 'text.secondary',
            },
          }}
        />

        <Button
          variant="contained"
          size="small"
          startIcon={<Send size={14} />}
          onClick={handleSubmit}
          disabled={!contenido.trim() || isSubmitting}
        >
          Enviar
        </Button>
      </Box>
    </Box>
  )
}

export default ComentarioForm
