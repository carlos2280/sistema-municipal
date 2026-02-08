export interface Usuario {
  id: number
  nombreCompleto: string
  email: string
  avatarUrl?: string
}

export interface Conversacion {
  id: number
  tipo: 'directa' | 'grupo'
  nombre?: string
  descripcion?: string
  avatarUrl?: string
  participantes: Participante[]
  ultimoMensaje?: Mensaje
  mensajesNoLeidos: number
  createdAt: string
  updatedAt: string
}

export interface Participante {
  id: number
  usuarioId: number
  conversacionId: number
  rol: 'admin' | 'miembro'
  silenciado: boolean
  ultimaLectura?: string
  usuario: Usuario
}

export interface Mensaje {
  id: number
  conversacionId: number
  remitenteId: number
  contenido: string
  tipo: 'texto' | 'archivo' | 'imagen' | 'sistema'
  replyToId?: number
  editado: boolean
  eliminado: boolean
  archivos?: Archivo[]
  remitente: Usuario
  createdAt: string
  updatedAt: string
}

export interface Archivo {
  id: number
  mensajeId: number
  nombre: string
  tipo: string
  tamanio: number
  url: string
  thumbnailUrl?: string
}

export type EstadoUsuario = 'online' | 'away' | 'busy' | 'offline'

export interface UsuarioConEstado extends Usuario {
  estado: EstadoUsuario
  ultimaConexion?: string
}

// Socket Events
export interface ChatMessageEvent {
  conversacionId: number
  contenido: string
  tipo: Mensaje['tipo']
  archivoIds?: number[]
}

export interface TypingEvent {
  conversacionId: number
  isTyping: boolean
}

export interface UserStatusEvent {
  userId: number
  status: EstadoUsuario
}
