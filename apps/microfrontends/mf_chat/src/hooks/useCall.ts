import { useCallback, useEffect, useRef, useState } from 'react'
import { useSocket } from './useSocket'
import {
  type CallState,
  type IncomingCallEvent,
  type CallCreatedEvent,
  type CallAcceptedEvent,
  type CallEndedEvent,
  INITIAL_CALL_STATE,
} from '../types/videocall.types'

interface UseCallReturn {
  callState: CallState
  initiateCall: (conversacionId: number, tipo: 'voz' | 'video') => void
  acceptCall: () => void
  rejectCall: () => void
  endCall: () => void
  joinCall: (llamadaId: number) => void
}

export function useCall(): UseCallReturn {
  const { isConnected, emit, on, off } = useSocket()
  const [callState, setCallState] = useState<CallState>(INITIAL_CALL_STATE)
  const callStateRef = useRef(callState)
  callStateRef.current = callState

  useEffect(() => {
    if (!isConnected) return

    const handleCallCreated = (data: CallCreatedEvent) => {
      setCallState((prev) => ({
        ...prev,
        llamadaId: data.llamadaId,
        tipo: data.tipo,
        estado: 'ringing',
        token: data.token,
        livekitUrl: data.livekitUrl,
        roomName: data.roomName,
        isIncoming: false,
      }))
    }

    const handleIncomingCall = (data: IncomingCallEvent) => {
      if (callStateRef.current.estado !== 'idle') return

      setCallState({
        llamadaId: data.llamadaId,
        conversacionId: data.conversacionId,
        tipo: data.tipo,
        estado: 'ringing',
        token: null,
        livekitUrl: null,
        roomName: null,
        isIncoming: true,
        callerName: data.callerName,
        callerId: data.callerId,
      })
    }

    const handleCallAccepted = (data: CallAcceptedEvent) => {
      setCallState((prev) => ({
        ...prev,
        estado: 'connecting',
        token: data.token,
        livekitUrl: data.livekitUrl,
        roomName: data.roomName,
      }))
    }

    const handleCallEnded = (data: CallEndedEvent) => {
      setCallState((prev) => {
        if (prev.llamadaId === data.llamadaId) {
          return { ...INITIAL_CALL_STATE }
        }
        return prev
      })
    }

    const handleParticipantJoined = () => {
      setCallState((prev) => {
        if (prev.estado === 'ringing' && !prev.isIncoming) {
          return { ...prev, estado: 'connected' }
        }
        return prev
      })
    }

    const handleCallError = ({ message }: { message: string }) => {
      console.error('[Call] Error:', message)
      setCallState(INITIAL_CALL_STATE)
    }

    on('call:created', handleCallCreated)
    on('call:incoming', handleIncomingCall)
    on('call:accepted', handleCallAccepted)
    on('call:ended', handleCallEnded)
    on('call:participant-joined', handleParticipantJoined)
    on('call:error', handleCallError)

    return () => {
      off('call:created')
      off('call:incoming')
      off('call:accepted')
      off('call:ended')
      off('call:participant-joined')
      off('call:error')
    }
  }, [isConnected, on, off])

  const initiateCall = useCallback(
    (conversacionId: number, tipo: 'voz' | 'video') => {
      if (!isConnected) return
      setCallState((prev) => ({
        ...prev,
        conversacionId,
        tipo,
      }))
      emit('call:initiate', { conversacionId, tipo })
    },
    [isConnected, emit]
  )

  const acceptCall = useCallback(() => {
    if (!isConnected || !callState.llamadaId) return
    emit('call:response', {
      llamadaId: callState.llamadaId,
      accepted: true,
    })
  }, [isConnected, emit, callState.llamadaId])

  const rejectCall = useCallback(() => {
    if (!isConnected || !callState.llamadaId) return
    emit('call:response', {
      llamadaId: callState.llamadaId,
      accepted: false,
    })
    setCallState(INITIAL_CALL_STATE)
  }, [isConnected, emit, callState.llamadaId])

  const endCall = useCallback(() => {
    if (!isConnected || !callState.llamadaId) return
    emit('call:end', { llamadaId: callState.llamadaId })
    setCallState(INITIAL_CALL_STATE)
  }, [isConnected, emit, callState.llamadaId])

  const joinCall = useCallback(
    (llamadaId: number) => {
      if (!isConnected) return
      emit('call:join', { llamadaId })
    },
    [isConnected, emit]
  )

  return {
    callState,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    joinCall,
  }
}
