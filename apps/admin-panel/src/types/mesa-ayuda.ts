// ─── Enums / Union Types ───────────────────────────────────────────────────

export type EstadoTicket =
  | 'abierto'
  | 'en_progreso'
  | 'en_espera'
  | 'resuelto'
  | 'cerrado'

export type PrioridadCodigo = 'baja' | 'media' | 'alta' | 'critica'

export type CategoriaColor =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'

// Alias mantenida para retrocompatibilidad con páginas existentes que usan PrioridadTicket
export type PrioridadTicket = PrioridadCodigo

// ─── Dashboard ────────────────────────────────────────────────────────────

export interface TendenciaDia {
  fecha: string
  creados: number
  resueltos: number
}

export interface TenantResumen {
  tenantId: number
  tenantSlug: string
  tenantNombre: string
  totalTickets: number
  abiertos: number
  vencidosSla: number
  slaCompliance: number
}

/** @deprecated usar TenantResumen */
export interface MunicipalidadResumen {
  tenantSlug: string
  nombre: string
  totalTickets: number
  abiertos: number
  slaCompliance: number
}

export interface CategoriaResumen {
  categoriaId: number
  categoriaNombre: string
  categoriaColor: string
  totalTickets: number
  // Alias para retrocompatibilidad
  categoria?: string
  cantidad?: number
}

export interface PrioridadResumen {
  prioridadCodigo: PrioridadCodigo
  prioridadNombre: string
  prioridadColor: string
  totalTickets: number
  vencidos: number
  // Alias para retrocompatibilidad
  prioridad?: string
  cantidad?: number
}

export interface GlobalDashboard {
  totalTickets: number
  abiertos: number
  enProgreso: number
  enEspera: number
  resueltos: number
  cerrados: number
  vencidosSla: number
  slaCompliance: number
  tiempoPromedioHoras: number
}

export interface AdminMesaAyudaDashboard {
  global: GlobalDashboard
  porTenant: TenantResumen[]
  porCategoria: CategoriaResumen[]
  porPrioridad: PrioridadResumen[]
  tendencia: TendenciaDia[]
  // Alias retrocompatibilidad con dashboard actual
  totalTickets?: number
  abiertos?: number
  enProgreso?: number
  enEspera?: number
  vencidosSla?: number
  slaCompliance?: number
  tiempoPromedioHoras?: number
  tendencia30Dias?: TendenciaDia[]
  porMunicipalidad?: MunicipalidadResumen[]
}

// ─── Tickets ──────────────────────────────────────────────────────────────

export interface AdminTicket {
  id: number
  tenantId: number
  tenantSlug: string
  tenantNombre: string
  numero: string
  titulo: string
  estado: EstadoTicket
  prioridadId: number
  prioridadNombre: string
  prioridadColor: string
  prioridadCodigo: string
  categoriaId: number
  categoriaNombre: string
  categoriaColor: string
  solicitante: string
  asignado: string | null
  slaVencido: boolean
  fechaLimite: string | null
  createdAt: string
}

export interface AdminTicketListResponse {
  tickets: AdminTicket[]
  total: number
  page: number
  pageSize: number
}

export interface AdminTicketFilters {
  tenantSlug?: string
  estado?: EstadoTicket
  prioridad?: PrioridadCodigo
  categoria?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface TicketComentario {
  id: number
  autorNombre: string
  contenido: string
  esInterno: boolean
  createdAt: string
  // Alias retrocompatibilidad
  autor?: string
  texto?: string
}

export interface TicketHistorial {
  id: number
  estadoAnterior: EstadoTicket | null
  estadoNuevo: EstadoTicket
  motivo: string | null
  ejecutadoPor: string
  createdAt: string
  // Alias retrocompatibilidad
  accion?: string
  usuario?: string
  detalle?: string
}

export interface AdminTicketDetail {
  id: number
  tenantId: number
  tenantSlug: string
  tenantNombre: string
  numero: string
  titulo: string
  descripcion: string
  estado: EstadoTicket
  prioridadId: number
  prioridadNombre: string
  prioridadColor: string
  prioridadCodigo: string
  categoriaId: number
  categoriaNombre: string
  categoriaColor: string
  solicitante: string
  emailSolicitante: string | null
  asignado: string | null
  slaVencido: boolean
  fechaLimite: string | null
  fechaResolucion: string | null
  createdAt: string
  updatedAt: string
  comentarios: TicketComentario[]
  historial: TicketHistorial[]
  fechaLimiteSla?: string
}

// ─── SLA ──────────────────────────────────────────────────────────────────

export interface SlaPrioridadResumen {
  prioridadCodigo: PrioridadCodigo
  prioridadNombre: string
  slaHoras: number
  totalTickets: number
  cumplidos: number
  vencidos: number
  compliance: number
}

export interface SlaTenantResumen {
  tenantId: number
  tenantSlug: string
  tenantNombre: string
  totalTickets: number
  compliance: number
  vencidos: number
}

export interface SlaTicketVencido {
  ticketId: number
  tenantSlug: string
  numero: string
  titulo: string
  prioridadNombre: string
  fechaLimite: string
  horasVencido: number
}

export interface SlaTicketEnRiesgo {
  ticketId: number
  tenantSlug: string
  numero: string
  titulo: string
  prioridadNombre: string
  fechaLimite: string
  horasRestantes: number
}

export interface SlaGlobal {
  totalTickets: number
  totalVencidos: number
  complianceGlobal: number
  tiempoPromedioResolucionHoras: number
}

export interface AdminSlaMonitoreo {
  global: SlaGlobal
  porPrioridad: SlaPrioridadResumen[]
  porTenant: SlaTenantResumen[]
  ticketsVencidos: SlaTicketVencido[]
  ticketsEnRiesgo: SlaTicketEnRiesgo[]
}

// ─── Categorías ───────────────────────────────────────────────────────────

export interface AdminCategoria {
  id: number
  codigo: string
  nombre: string
  descripcion: string | null
  icono: string | null
  color: CategoriaColor
  orden: number
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoriaInput {
  codigo: string
  nombre: string
  descripcion?: string
  icono?: string
  color: CategoriaColor
  orden?: number
}

export interface UpdateCategoriaInput {
  nombre?: string
  descripcion?: string
  icono?: string
  color?: CategoriaColor
  orden?: number
  activo?: boolean
}

// ─── Prioridades ──────────────────────────────────────────────────────────

export interface AdminPrioridad {
  id: number
  codigo: PrioridadCodigo
  nombre: string
  color: string
  nivel: number
  slaHoras: number
  createdAt: string
  updatedAt: string
}

export interface UpdatePrioridadInput {
  nombre?: string
  color?: string
  nivel?: number
  slaHoras?: number
}

// ─── Inputs de gestión ────────────────────────────────────────────────────

export interface CambiarEstadoInput {
  estado: EstadoTicket
  motivo?: string
}

export interface AsignarTicketInput {
  asignadoId: number
  asignadoNombre: string
}

export interface CambiarPrioridadInput {
  prioridadId: number
  recalcularSla?: boolean
}

export interface CambiarCategoriaInput {
  categoriaId: number
}

export interface AgregarComentarioInput {
  contenido: string
  esInterno: boolean
}

// ─── Transiciones de estado válidas ──────────────────────────────────────

export const TRANSICIONES_ESTADO: Record<EstadoTicket, EstadoTicket[]> = {
  abierto: ['en_progreso', 'en_espera', 'cerrado'],
  en_progreso: ['en_espera', 'resuelto', 'cerrado'],
  en_espera: ['en_progreso', 'resuelto', 'cerrado'],
  resuelto: ['cerrado', 'en_progreso'],
  cerrado: [],
}
