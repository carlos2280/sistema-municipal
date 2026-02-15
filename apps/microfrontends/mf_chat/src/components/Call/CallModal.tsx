import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { PhoneOff } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from '@livekit/components-react'
import '@livekit/components-styles'
import type { CallState } from '../../types/videocall.types'

const TRANSLATIONS: Record<string, string> = {
  Microphone: 'Micrófono',
  Camera: 'Cámara',
  'Share screen': 'Compartir pantalla',
  'Stop screen share': 'Dejar de compartir',
  Chat: 'Chat',
  Leave: 'Salir',
  Messages: 'Mensajes',
  Send: 'Enviar',
  'Enter a message...': 'Escribe un mensaje...',
  'Type a message…': 'Escribe un mensaje...',
  'No participant': 'Sin participante',
}

function useLiveKitTranslations(ref: React.RefObject<HTMLDivElement | null>) {
  const translateNode = useCallback((root: HTMLElement) => {
    // Translate text nodes
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    )
    let node: Node | null
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim()
      if (text && TRANSLATIONS[text]) {
        node.textContent = node.textContent!.replace(text, TRANSLATIONS[text])
      }
    }

    // Translate placeholders
    root.querySelectorAll<HTMLInputElement>('input[placeholder]').forEach((input) => {
      if (TRANSLATIONS[input.placeholder]) {
        input.placeholder = TRANSLATIONS[input.placeholder]
      }
    })

    // Translate aria-labels and titles
    root.querySelectorAll<HTMLElement>('[aria-label]').forEach((el) => {
      const label = el.getAttribute('aria-label')
      if (label && TRANSLATIONS[label]) {
        el.setAttribute('aria-label', TRANSLATIONS[label])
      }
    })
  }, [])

  useEffect(() => {
    if (!ref.current) return

    // Initial translation
    translateNode(ref.current)

    // Observe for dynamically added elements (chat panel, etc.)
    const observer = new MutationObserver(() => {
      if (ref.current) translateNode(ref.current)
    })

    observer.observe(ref.current, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [ref, translateNode])
}

interface CallModalProps {
  callState: CallState
  onEndCall: () => void
}

export function CallModal({ callState, onEndCall }: CallModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useLiveKitTranslations(containerRef)

  const isActive =
    callState.estado === 'connecting' ||
    callState.estado === 'connected' ||
    (callState.estado === 'ringing' && !callState.isIncoming)

  if (!isActive) return null

  // Caller esperando respuesta
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
      <Box ref={containerRef} sx={{ height: '100%', width: '100%' }}>
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
