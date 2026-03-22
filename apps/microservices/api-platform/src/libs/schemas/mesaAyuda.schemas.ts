import { z } from "zod";

export const ESTADO_TICKET_VALUES = [
  "abierto",
  "en_progreso",
  "en_espera",
  "resuelto",
  "cerrado",
] as const;

export type EstadoTicket = (typeof ESTADO_TICKET_VALUES)[number];

export const ticketFiltersSchema = z.object({
  tenantSlug: z.string().optional(),
  estado: z.enum(ESTADO_TICKET_VALUES).optional(),
  prioridad: z.string().optional(),
  categoria: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
  sortBy: z
    .enum(["createdAt", "updatedAt", "estado", "prioridad", "fechaLimite"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type TicketFilters = z.infer<typeof ticketFiltersSchema>;

export const cambiarEstadoSchema = z.object({
  estado: z.enum(ESTADO_TICKET_VALUES),
  motivo: z.string().optional(),
});

export type CambiarEstadoInput = z.infer<typeof cambiarEstadoSchema>;

export const asignarTicketSchema = z.object({
  asignadoId: z.number().int().positive(),
  asignadoNombre: z.string().min(1),
});

export type AsignarTicketInput = z.infer<typeof asignarTicketSchema>;

export const cambiarPrioridadSchema = z.object({
  prioridadId: z.number().int().positive(),
  recalcularSla: z.boolean().default(true),
});

export type CambiarPrioridadInput = z.infer<typeof cambiarPrioridadSchema>;

export const cambiarCategoriaSchema = z.object({
  categoriaId: z.number().int().positive(),
});

export type CambiarCategoriaInput = z.infer<typeof cambiarCategoriaSchema>;

export const agregarComentarioSchema = z.object({
  contenido: z.string().min(1, "El contenido no puede estar vacío"),
  esInterno: z.boolean(),
});

export type AgregarComentarioInput = z.infer<typeof agregarComentarioSchema>;

const COLOR_VALUES = [
  "primary",
  "secondary",
  "error",
  "warning",
  "info",
  "success",
] as const;

export const createCategoriaSchema = z.object({
  codigo: z
    .string()
    .min(1)
    .regex(/^[a-z0-9_]+$/, "Código solo puede contener letras, números y _"),
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  icono: z.string().min(1, "Icono requerido"),
  color: z.enum(COLOR_VALUES),
  orden: z.number().int().nonnegative().default(0),
});

export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>;

export const updateCategoriaSchema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  icono: z.string().min(1).optional(),
  color: z.enum(COLOR_VALUES).optional(),
  orden: z.number().int().nonnegative().optional(),
  activo: z.boolean().optional(),
});

export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>;

export const updatePrioridadSchema = z.object({
  nombre: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  slaHoras: z.number().int().positive().optional(),
});

export type UpdatePrioridadInput = z.infer<typeof updatePrioridadSchema>;
