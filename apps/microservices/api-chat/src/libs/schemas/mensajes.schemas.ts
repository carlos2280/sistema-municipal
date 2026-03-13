import { z } from 'zod'

export const crearMensajeSchema = z.object({
  contenido: z.string().min(1, 'Contenido del mensaje requerido'),
  tipo: z.enum(['texto', 'imagen', 'archivo']).optional().default('texto'),
})

export const editarMensajeSchema = z.object({
  contenido: z.string().min(1, 'Contenido del mensaje requerido'),
})
