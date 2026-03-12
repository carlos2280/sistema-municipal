export type TipoReunion = 'video' | 'voz' | 'presencial'
export type EstadoReunion = 'programada' | 'activa' | 'completada' | 'cancelada'
export type EstadoInvitacion = 'pendiente' | 'aceptada' | 'rechazada' | 'tentativa'

export interface Reunion {
  id: number
  conversacionId: number
  organizadorId: number
  titulo: string
  descripcion?: string
  tipo: TipoReunion
  estado: EstadoReunion
  fechaInicio: string
  fechaFin: string
  llamadaId?: number
  mensajeId?: number
  ubicacion?: string
  notas?: string
  createdAt: string
  updatedAt: string
}

export interface ReunionConInvitaciones extends Reunion {
  invitaciones: InvitacionReunion[]
}

export interface InvitacionReunion {
  id: number
  reunionId: number
  usuarioId: number
  estado: EstadoInvitacion
  respondidoEn?: string
  createdAt: string
  updatedAt: string
}

export interface CreateReunionInput {
  titulo: string
  descripcion?: string
  tipo: TipoReunion
  fechaInicio: string
  fechaFin: string
  ubicacion?: string
  notas?: string
  participantesIds?: number[]
}

export interface UpdateReunionInput {
  titulo?: string
  descripcion?: string
  tipo?: TipoReunion
  fechaInicio?: string
  fechaFin?: string
  ubicacion?: string
  notas?: string
}

export interface IniciarReunionResponse {
  reunion: Reunion
  llamada: {
    id: number
    token: string
    livekitUrl: string
    roomName: string
  }
}

// Payloads de Socket.IO
export interface MeetingCreatedPayload {
  reunion: ReunionConInvitaciones
  conversacionId: number
}

export interface MeetingUpdatedPayload {
  reunion: Reunion
  conversacionId: number
}

export interface MeetingCancelledPayload {
  reunionId: number
  conversacionId: number
}

export interface MeetingReminderPayload {
  reunion: Reunion
  minutosRestantes: number
}

export interface MeetingStartingPayload {
  reunion: Reunion
  llamadaId: number
}

export interface MeetingRsvpPayload {
  reunionId: number
  userId: number
  estado: EstadoInvitacion
}
