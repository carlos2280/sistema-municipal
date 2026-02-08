import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import {
  Mic,
  MicOff,
  Monitor,
  Phone,
  Video,
  VideoOff,
} from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

export function VideoCallPage() {
  const { callId } = useParams<{ callId: string }>()
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const handleEndCall = () => {
    // TODO: Implementar lógica para finalizar llamada
    window.history.back()
  }

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: '#1A1A2E',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
            }}
          >
            MR
          </Box>
          <Box>
            <Typography sx={{ color: 'white', fontWeight: 500 }}>
              María Rodríguez
            </Typography>
            <Typography sx={{ color: 'grey.500', fontSize: 12 }}>
              En llamada...
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ color: 'grey.400', fontSize: 14 }}>
          Call ID: {callId}
        </Typography>
      </Box>

      {/* Video Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        {/* Remote Video */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 800,
            aspectRatio: '16/9',
            bgcolor: '#2D2D3F',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 48,
                fontWeight: 600,
                mx: 'auto',
                mb: 2,
              }}
            >
              MR
            </Box>
            <Typography sx={{ color: 'white', fontSize: 20 }}>
              María Rodríguez
            </Typography>
          </Box>
        </Box>

        {/* Local Video (Picture in Picture) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 120,
            right: 24,
            width: 200,
            aspectRatio: '16/9',
            bgcolor: '#3D3D4F',
            borderRadius: 1,
            border: '2px solid rgba(255,255,255,0.1)',
          }}
        />
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 3,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <IconButton
          onClick={() => setIsMuted(!isMuted)}
          sx={{
            bgcolor: isMuted ? 'error.main' : 'rgba(255,255,255,0.1)',
            color: 'white',
            width: 56,
            height: 56,
            '&:hover': {
              bgcolor: isMuted ? 'error.dark' : 'rgba(255,255,255,0.2)',
            },
          }}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </IconButton>

        <IconButton
          onClick={() => setIsVideoOn(!isVideoOn)}
          sx={{
            bgcolor: !isVideoOn ? 'error.main' : 'rgba(255,255,255,0.1)',
            color: 'white',
            width: 56,
            height: 56,
            '&:hover': {
              bgcolor: !isVideoOn ? 'error.dark' : 'rgba(255,255,255,0.2)',
            },
          }}
        >
          {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
        </IconButton>

        <IconButton
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          sx={{
            bgcolor: isScreenSharing
              ? 'primary.main'
              : 'rgba(255,255,255,0.1)',
            color: 'white',
            width: 56,
            height: 56,
            '&:hover': {
              bgcolor: isScreenSharing
                ? 'primary.dark'
                : 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <Monitor size={24} />
        </IconButton>

        <IconButton
          onClick={handleEndCall}
          sx={{
            bgcolor: 'error.main',
            color: 'white',
            width: 56,
            height: 56,
            '&:hover': { bgcolor: 'error.dark' },
          }}
        >
          <Phone size={24} style={{ transform: 'rotate(135deg)' }} />
        </IconButton>
      </Box>
    </Box>
  )
}
