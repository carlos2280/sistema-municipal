export interface Tenant {
  id: number;
  nombre: string;
  slug: string;
  rut: string | null;
  direccion: string | null;
  telefono: string | null;
  emailContacto: string | null;
  logoUrl: string | null;
  tema: Record<string, unknown> | null;
  dominioBase: string;
  dominiosCustom: string[] | null;
  dbName: string;
  activo: boolean | null;
  maxUsuarios: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantInput {
  nombre: string;
  slug: string;
  dominioBase: string;
  rut?: string;
  direccion?: string;
  telefono?: string;
  emailContacto?: string;
  maxUsuarios?: number;
}

export interface UpdateTenantInput {
  nombre?: string;
  dominioBase?: string;
  rut?: string;
  direccion?: string;
  telefono?: string;
  emailContacto?: string;
  logoUrl?: string;
  tema?: Record<string, unknown>;
  dominiosCustom?: string[];
  activo?: boolean;
  maxUsuarios?: number;
}

export type EstadoSuscripcion =
  | "activa"
  | "trial"
  | "suspendida"
  | "cancelada";

export interface Subscription {
  id: number;
  estado: EstadoSuscripcion;
  fechaInicio: string;
  fechaFin: string | null;
  precioMensual: string | null;
  notas: string | null;
  activadoPor: string | null;
  createdAt: string;
  modulo: {
    id: number;
    codigo: string;
    nombre: string;
  };
}

export interface CreateSubscriptionInput {
  tenantId: number;
  moduloId: number;
  estado?: EstadoSuscripcion;
  fechaFin?: string;
  precioMensual?: string;
  notas?: string;
  activadoPor: string;
}

export interface UpdateEstadoInput {
  estado: EstadoSuscripcion;
  motivo?: string;
  ejecutadoPor: string;
}

export interface Module {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  apiPrefix: string;
  mfName: string | null;
  mfManifestUrlTpl: string | null;
  requiere: string[] | null;
  activo: boolean | null;
  orden: number | null;
  createdAt: string;
  updatedAt: string;
}
