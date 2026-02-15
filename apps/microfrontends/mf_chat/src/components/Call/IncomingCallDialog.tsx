import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { Phone, PhoneOff, Video } from 'lucide-react'
import type { CallState } from '../../types/videocall.types'

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
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)' },
              '70%': { boxShadow: '0 0 0 20px rgba(25, 118, 210, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' },
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

        <Typography variant="h6" fontWeight={600}>
          {callState.callerName || 'Llamada entrante'}
        </Typography>

        <Typography variant="body2" color="text.secondary">
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
            <Typography variant="caption" color="text.secondary">
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
            <Typography variant="caption" color="text.secondary">
              Aceptar
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
