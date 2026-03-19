import type { CallState } from '@/types/videocall.types'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { Phone, PhoneOff, Video } from 'lucide-react'

interface IncomingCallDialogProps {
  callState: CallState
  onAccept: () => void
  onReject: () => void
}

export function IncomingCallDialog({
  callState,
  onAccept,
  onReject,
}: IncomingCallDialogProps) {
  const theme = useTheme()
  const isOpen = callState.estado === 'ringing' && callState.isIncoming
  const isVideo = callState.tipo === 'video'

  return (
    <Dialog
      open={isOpen}
      onClose={onReject}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3, overflow: 'hidden' },
        },
      }}
    >
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 4,
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 28,
            fontWeight: 700,
            fontFamily: '"Bricolage Grotesque", sans-serif',
            // MERIDIAN pulse: scale 1→1.05→1, 2s ease-inOut loop
            animation: 'incomingPulse 2s ease-in-out infinite',
            '@keyframes incomingPulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              '50%': {
                transform: 'scale(1.05)',
                boxShadow: `0 0 0 20px ${alpha(theme.palette.primary.main, 0)}`,
              },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >
          {callState.callerName
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || '?'}
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontFamily: '"Bricolage Grotesque", sans-serif',
          }}
        >
          {callState.callerName || 'Llamada entrante'}
        </Typography>

        <Typography
          sx={{
            fontSize: '13.5px',
            fontFamily: '"DM Sans", sans-serif',
            color: 'text.secondary',
          }}
        >
          {isVideo ? 'Videollamada entrante...' : 'Llamada de voz entrante...'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <IconButton
              onClick={onReject}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                width: 56,
                height: 56,
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              <PhoneOff size={24} />
            </IconButton>
            <Typography
              sx={{
                fontSize: '12px',
                fontFamily: '"DM Sans", sans-serif',
                color: 'text.secondary',
              }}
            >
              Rechazar
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <IconButton
              onClick={onAccept}
              sx={{
                bgcolor: 'success.main',
                color: 'white',
                width: 56,
                height: 56,
                '&:hover': { bgcolor: 'success.dark' },
              }}
            >
              {isVideo ? <Video size={24} /> : <Phone size={24} />}
            </IconButton>
            <Typography
              sx={{
                fontSize: '12px',
                fontFamily: '"DM Sans", sans-serif',
                color: 'text.secondary',
              }}
            >
              Aceptar
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
