import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { Image, Paperclip, Send, Smile } from 'lucide-react'
import { useState } from 'react'

interface MessageInputProps {
  onSendMessage: (contenido: string) => void
  onAttachFile: () => void
  onTyping?: (isTyping: boolean) => void
  disabled?: boolean
}

export function MessageInput({
  onSendMessage,
  onAttachFile,
  onTyping,
  disabled = false,
}: MessageInputProps) {
  const theme = useTheme()
  const [mensaje, setMensaje] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMensaje(e.target.value)

    // Notificar estado de escritura
    if (onTyping) {
      if (e.target.value && !isTyping) {
        setIsTyping(true)
        onTyping(true)
      } else if (!e.target.value && isTyping) {
        setIsTyping(false)
        onTyping(false)
      }
    }
  }

  const handleSend = () => {
    if (mensaje.trim() && !disabled) {
      onSendMessage(mensaje.trim())
      setMensaje('')
      // Limpiar estado de typing
      if (onTyping && isTyping) {
        setIsTyping(false)
        onTyping(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box
      sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Input Row */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        {/* Text Field */}
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Escribe un mensaje..."
          value={mensaje}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.action.hover,
              borderRadius: 2,
              '& fieldset': {
                borderColor: theme.palette.divider,
              },
            },
          }}
        />

        {/* Send Button */}
        <IconButton
          onClick={handleSend}
          disabled={disabled || !mensaje.trim()}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '&:disabled': { bgcolor: theme.palette.action.disabledBackground, color: theme.palette.action.disabled },
          }}
        >
          <Send size={20} />
        </IconButton>
      </Box>

      {/* Attachment Hints */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          mt: 1.5,
        }}
      >
        <Box
          onClick={onAttachFile}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            cursor: 'pointer',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
        >
          <Paperclip size={16} />
          <Typography sx={{ fontSize: 12 }}>Adjuntar</Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            cursor: 'pointer',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
        >
          <Image size={16} />
          <Typography sx={{ fontSize: 12 }}>Imagen</Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            cursor: 'pointer',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
        >
          <Smile size={16} />
          <Typography sx={{ fontSize: 12 }}>Emoji</Typography>
        </Box>
      </Box>
    </Box>
  )
}
