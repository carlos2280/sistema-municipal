import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { PhoneOff } from 'lucide-react'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from '@livekit/components-react'
import '@livekit/components-styles'
import type { CallState } from '../../types/videocall.types'

interface CallModalProps {
  callState: CallState
  onEndCall: () => void
}

export function CallModal({ callState, onEndCall }: CallModalProps) {
  const isActive =
    callState.estado === 'connecting' ||
    callState.estado === 'connected' ||
    (callState.estado === 'ringing' && !callState.isIncoming)

  if (!isActive) return null

  // Caller esperando respuesta (aún no tiene token o lo tiene pero nadie aceptó)
  if (callState.estado === 'ringing' && !callState.isIncoming) {
    return (
      <Dialog
        open
        fullScreen
        slotProps={{ paper: { sx: { bgcolor: '#1a1a2e' } } }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'white',
            gap: 3,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Llamando...
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Esperando respuesta
          </Typography>
          <IconButton
            onClick={onEndCall}
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              width: 64,
              height: 64,
              mt: 4,
              '&:hover': { bgcolor: 'error.dark' },
            }}
          >
            <PhoneOff size={28} />
          </IconButton>
        </Box>
      </Dialog>
    )
  }

  // Conectando o conectado con token
  if (!callState.token || !callState.livekitUrl) return null

  return (
    <Dialog
      open
      fullScreen
      slotProps={{ paper: { sx: { bgcolor: '#1a1a2e' } } }}
    >
      <Box sx={{ height: '100%', width: '100%' }}>
        <LiveKitRoom
          token={callState.token}
          serverUrl={callState.livekitUrl}
          connect={true}
          onDisconnected={onEndCall}
          data-lk-theme="default"
          style={{ height: '100%' }}
        >
          {callState.tipo === 'video' ? (
            <VideoConference />
          ) : (
            <AudioCallView onEndCall={onEndCall} />
          )}
          <RoomAudioRenderer />
        </LiveKitRoom>
      </Box>
    </Dialog>
  )
}

function AudioCallView({ onEndCall }: { onEndCall: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        bgcolor: '#1a1a2e',
        color: 'white',
        gap: 3,
      }}
    >
      <Typography variant="h5" fontWeight={600}>
        Llamada de voz
      </Typography>
      <Typography variant="body2" sx={{ color: 'grey.400' }}>
        En curso
      </Typography>
      <Box sx={{ mt: 4 }}>
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: false,
            screenShare: false,
            leave: false,
          }}
        />
      </Box>
      <IconButton
        onClick={onEndCall}
        sx={{
          bgcolor: 'error.main',
          color: 'white',
          width: 64,
          height: 64,
          mt: 2,
          '&:hover': { bgcolor: 'error.dark' },
        }}
      >
        <PhoneOff size={28} />
      </IconButton>
    </Box>
  )
}
