import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [mensaje, setMensaje] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiAnchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMensaje(e.target.value)

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
        borderTop: `1px solid ${theme.meridian.borders.default}`,
        bgcolor: theme.meridian.surfaces.s1,
      }}
    >
      {/* Input Row */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        {/* MERIDIAN-spec input */}
        <Box
          component="input"
          ref={inputRef}
          value={mensaje}
          onChange={
            handleChange as unknown as React.ChangeEventHandler<HTMLInputElement>
          }
          onKeyDown={
            handleKeyDown as unknown as React.KeyboardEventHandler<HTMLInputElement>
          }
          disabled={disabled}
          placeholder="Escribe un mensaje..."
          sx={{
            flex: 1,
            height: 40,
            px: 1.5,
            py: 0,
            backgroundColor: theme.meridian.surfaces.s3,
            border: `1px solid ${theme.meridian.borders.default}`,
            borderRadius: `${theme.shape.borderRadius}px`,
            fontSize: '13.5px',
            fontFamily: '"DM Sans", sans-serif',
            color: theme.palette.text.primary,
            outline: 'none',
            '&::placeholder': {
              color: theme.palette.text.disabled,
            },
            '&:focus': {
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.meridian.surfaces.s4,
            },
            '&:disabled': {
              opacity: 0.5,
              cursor: 'not-allowed',
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
            width: 40,
            height: 40,
            '&:hover': { bgcolor: 'primary.dark' },
            '&:disabled': {
              bgcolor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
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
          gap: { xs: 1.5, sm: 3 },
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
          <Typography
            sx={{
              fontSize: '12px',
              fontFamily: '"DM Sans", sans-serif',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Adjuntar
          </Typography>
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
          <Typography
            sx={{
              fontSize: '12px',
              fontFamily: '"DM Sans", sans-serif',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Imagen
          </Typography>
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
          <Typography
            sx={{
              fontSize: '12px',
              fontFamily: '"DM Sans", sans-serif',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Emoji
          </Typography>
        </Box>
      </Box>

      {/* Emoji Picker */}
      <Popper
        open={showEmojiPicker}
        anchorEl={emojiAnchorRef.current}
        placement={isMobile ? 'top' : 'top-end'}
        sx={{ zIndex: 1400 }}
      >
        <ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
          <Box sx={{ boxShadow: 8, borderRadius: 2, overflow: 'hidden' }}>
            <EmojiPicker
              theme={emojiTheme}
              onEmojiClick={handleEmojiClick}
              searchPlaceHolder="Buscar emoji..."
              width={isMobile ? Math.min(window.innerWidth - 48, 320) : 350}
              height={isMobile ? 320 : 400}
              previewConfig={{ showPreview: false }}
              lazyLoadEmojis
            />
          </Box>
        </ClickAwayListener>
      </Popper>
    </Box>
  )
}
