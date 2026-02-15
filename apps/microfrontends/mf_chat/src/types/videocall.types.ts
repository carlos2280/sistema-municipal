export interface CallState {
  llamadaId: number | null
  conversacionId: number | null
  tipo: 'voz' | 'video' | null
  estado: 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended'
  token: string | null
  livekitUrl: string | null
  roomName: string | null
  isIncoming: boolean
  callerName?: string
  callerId?: number
}

export interface IncomingCallEvent {
  llamadaId: number
  conversacionId: number
  callerId: number
  callerName: string
  tipo: 'voz' | 'video'
}

export interface CallCreatedEvent {
  llamadaId: number
  token: string
  livekitUrl: string
  roomName: string
  tipo: 'voz' | 'video'
}

export interface CallAcceptedEvent {
  llamadaId: number
  token: string
  livekitUrl: string
  roomName: string
  tipo: 'voz' | 'video'
}

export interface CallEndedEvent {
  llamadaId: number
  reason: 'finalizada' | 'rechazada' | 'sin_respuesta' | 'error'
}

export const INITIAL_CALL_STATE: CallState = {
  llamadaId: null,
  conversacionId: null,
  tipo: null,
  estado: 'idle',
  token: null,
  livekitUrl: null,
  roomName: null,
  isIncoming: false,
}
