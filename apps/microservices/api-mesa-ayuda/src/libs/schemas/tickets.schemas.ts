import { z } from 'zod'

export const crearTicketSchema = z.object({
  titulo: z
    .string()
    .min(5, 'El titulo debe tener al menos 5 caracteres')
    .max(200),
  descripcion: z
    .string()
    .min(10, 'La descripcion debe tener al menos 10 caracteres'),
  categoriaId: z.number().int().positive(),
  prioridadId: z.number().int().positive(),
  departamento: z.string().optional(),
})

export const actualizarTicketSchema = z.object({
  titulo: z.string().min(5).max(200).optional(),
  descripcion: z.string().min(10).optional(),
  categoriaId: z.number().int().positive().optional(),
  prioridadId: z.number().int().positive().optional(),
  departamento: z.string().nullable().optional(),
})

export const cambiarEstadoSchema = z.object({
  estado: z.enum([
    'abierto',
    'en_progreso',
    'en_espera',
    'resuelto',
    'cerrado',
  ]),
  motivo: z.string().optional(),
})

export const asignarTicketSchema = z.object({
  asignadoId: z.number().int().positive(),
  asignadoNombre: z.string().min(1),
})

export const ticketFiltersSchema = z.object({
  estado: z.string().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  prioridadId: z.coerce.number().int().positive().optional(),
  asignadoId: z.coerce.number().int().positive().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
})

export type CrearTicketInput = z.infer<typeof crearTicketSchema>
export type ActualizarTicketInput = z.infer<typeof actualizarTicketSchema>
export type CambiarEstadoInput = z.infer<typeof cambiarEstadoSchema>
export type AsignarTicketInput = z.infer<typeof asignarTicketSchema>
export type TicketFiltersInput = z.infer<typeof ticketFiltersSchema>
