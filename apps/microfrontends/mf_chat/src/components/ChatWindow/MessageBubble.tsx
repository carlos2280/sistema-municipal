import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { memo } from 'react'
import { FileText } from 'lucide-react'

/** Elimina caracteres de control invisibles (excepto newline/tab) y null bytes */
function sanitizeContent(text: string): string {
  // biome-ignore lint: regex is intentional for security — strip C0/C1 control chars except \n \t
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '').trim()
}

interface MessageBubbleProps {
  contenido: string
  esPropio: boolean
  hora: string
  remitente?: string
  archivo?: {
    nombre: string
    tamanio: string
  }
}

export const MessageBubble = memo(function MessageBubble({
  contenido,
  esPropio,
  hora,
  remitente,
  archivo,
}: MessageBubbleProps) {
  const theme = useTheme()
  const displayContent = sanitizeContent(contenido)

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: esPropio ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          bgcolor: esPropio ? 'primary.main' : 'background.paper',
          color: esPropio ? 'white' : 'text.primary',
          borderRadius: 2,
          px: 2,
          py: 1,
          boxShadow: esPropio
            ? 'none'
            : '0 1px 2px rgba(0,0,0,0.08)',
        }}
      >
        <Typography sx={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {displayContent}
        </Typography>

        {/* Archivo adjunto */}
        {archivo && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1,
              p: 1.5,
              bgcolor: esPropio ? alpha(theme.palette.common.white, 0.15) : theme.palette.action.hover,
              borderRadius: 1.5,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: esPropio ? alpha(theme.palette.common.white, 0.2) : theme.palette.action.selected,
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: esPropio ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText
                size={20}
                color={esPropio ? theme.palette.common.white : theme.palette.primary.main}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {archivo.nombre}
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  color: esPropio ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                }}
              >
                {archivo.tamanio}
              </Typography>
            </Box>
          </Box>
        )}

        <Typography
          sx={{
            fontSize: 11,
            color: esPropio ? 'rgba(255,255,255,0.7)' : 'text.secondary',
            textAlign: 'right',
            mt: 0.5,
          }}
        >
          {hora}
        </Typography>
      </Box>
    </Box>
  )
})
