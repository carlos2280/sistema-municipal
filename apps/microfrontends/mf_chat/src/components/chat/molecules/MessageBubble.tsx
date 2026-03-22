import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { memo } from 'react'

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

const MotionBox = motion.create(Box)

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
    <MotionBox
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.0, 0.0, 0.2, 1.0] }}
      sx={{
        display: 'flex',
        justifyContent: esPropio ? 'flex-end' : 'flex-start',
        mb: 1,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          bgcolor: esPropio ? 'primary.main' : theme.meridian.surfaces.s2,
          color: esPropio ? 'white' : 'text.primary',
          borderRadius: 2,
          px: 2,
          py: 1,
          boxShadow: esPropio ? 'none' : theme.meridian.shadows.sm,
        }}
      >
        <Typography
          sx={{
            fontSize: '13.5px',
            fontFamily: '"DM Sans", sans-serif',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
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
              bgcolor: esPropio
                ? alpha(theme.palette.common.white, 0.15)
                : theme.palette.action.hover,
              borderRadius: 1.5,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: esPropio
                  ? alpha(theme.palette.common.white, 0.2)
                  : theme.palette.action.selected,
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: esPropio
                  ? alpha(theme.palette.common.white, 0.2)
                  : alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText
                size={20}
                color={
                  esPropio
                    ? theme.palette.common.white
                    : theme.palette.primary.main
                }
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontFamily: '"DM Sans", sans-serif',
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
                  fontSize: '11px',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontFeatureSettings: "'tnum' 1",
                  color: esPropio
                    ? alpha(theme.palette.common.white, 0.7)
                    : 'text.secondary',
                }}
              >
                {archivo.tamanio}
              </Typography>
            </Box>
          </Box>
        )}

        <Typography
          sx={{
            fontSize: '11px',
            fontFamily: '"Space Grotesk", sans-serif',
            fontFeatureSettings: "'tnum' 1",
            color: esPropio
              ? alpha(theme.palette.common.white, 0.7)
              : 'text.secondary',
            textAlign: 'right',
            mt: 0.5,
          }}
        >
          {hora}
        </Typography>
      </Box>
    </MotionBox>
  )
})
