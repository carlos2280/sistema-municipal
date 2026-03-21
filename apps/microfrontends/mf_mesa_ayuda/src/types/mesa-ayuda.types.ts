// ─── Estados del ticket ───────────────────────────────────────────
export type EstadoTicket =
  | 'abierto'
  | 'en_progreso'
  | 'en_espera'
  | 'resuelto'
  | 'cerrado';

// ─── Entidades principales ────────────────────────────────────────
export interface Ticket {
  id: number;
  numero: string;
  titulo: string;
  descripcion: string;
  estado: EstadoTicket;
  categoriaId: number;
  categoriaNombre: string | null;
  categoriaColor: string | null;
  prioridadId: number;
  prioridadNombre: string | null;
  prioridadColor: string | null;
  prioridadNivel: number | null;
  solicitanteId: number;
  solicitanteNombre: string;
  solicitanteEmail: string | null;
  asignadoId: number | null;
  asignadoNombre: string | null;
  departamento: string | null;
  fechaLimite: string | null;
  fechaResolucion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetalle extends Ticket {
  categoriaIcono: string | null;
  comentarios: Comentario[];
  historial: HistorialEstado[];
}

export interface Comentario {
  id: number;
  ticketId: number;
  autorId: number;
  autorNombre: string;
  contenido: string;
  esInterno: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Categoria {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  icono: string;
  color: string;
  orden: number;
  activo: boolean;
}

export interface Prioridad {
  id: number;
  codigo: string;
  nombre: string;
  color: string;
  nivel: number;
  slaHoras: number;
}

export interface TicketStats {
  total: number;
  abiertos: number;
  enProgreso: number;
  enEspera: number;
  resueltos: number;
  cerrados: number;
  vencidosSla: number;
}

export interface HistorialEstado {
  id: number;
  ticketId: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  motivo: string | null;
  ejecutadoPor: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketFilters {
  estado?: string;
  categoriaId?: number;
  prioridadId?: number;
  asignadoId?: number;
  q?: string;
  page?: number;
  limit?: number;
}
