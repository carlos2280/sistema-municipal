import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react'
import { Image, Paperclip, Send, Smile } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiAnchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    setMensaje((prev) => prev + emojiData.emoji)
    inputRef.current?.focus()
  }, [])

  const emojiTheme = theme.palette.mode === 'dark' ? Theme.DARK : Theme.LIGHT

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
          inputRef={inputRef}
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
          ref={emojiAnchorRef}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            cursor: 'pointer',
            color: showEmojiPicker ? 'primary.main' : 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
        >
          <Smile size={16} />
          <Typography sx={{ fontSize: 12 }}>Emoji</Typography>
        </Box>
      </Box>

      {/* Emoji Picker */}
      <Popper
        open={showEmojiPicker}
        anchorEl={emojiAnchorRef.current}
        placement="top-end"
        sx={{ zIndex: 1400 }}
      >
        <ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
          <Box sx={{ boxShadow: 8, borderRadius: 2, overflow: 'hidden' }}>
            <EmojiPicker
              theme={emojiTheme}
              onEmojiClick={handleEmojiClick}
              searchPlaceHolder="Buscar emoji..."
              width={350}
              height={400}
              previewConfig={{ showPreview: false }}
              lazyLoadEmojis
            />
          </Box>
        </ClickAwayListener>
      </Popper>
    </Box>
  )
}
