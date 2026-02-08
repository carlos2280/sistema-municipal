export interface VideoCallState {
  callId: string
  isActive: boolean
  isMuted: boolean
  isVideoOn: boolean
  isScreenSharing: boolean
  participants: VideoParticipant[]
}

export interface VideoParticipant {
  id: number
  nombre: string
  avatarUrl?: string
  isMuted: boolean
  isVideoOn: boolean
  stream?: MediaStream
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate'
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit
  fromUserId: number
  toUserId: number
}

export interface IncomingCallEvent {
  callId: string
  callerId: number
  callerName: string
  callerAvatar?: string
}

export interface CallEndedEvent {
  callId: string
  reason: 'declined' | 'ended' | 'no-answer' | 'error'
}
