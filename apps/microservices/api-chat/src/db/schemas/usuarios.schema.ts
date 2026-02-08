import { boolean, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { identidadSchema } from '../../config/schemaPG.js'

// Schema de usuarios (solo lectura desde api-chat)
// La tabla pertenece al schema 'identidad' pero api-chat la consulta
export const usuarios = identidadSchema.table('usuarios', {
  id: serial('id').primaryKey(),
  nombreCompleto: text('nombre_completo').notNull(),
  email: text('email').notNull(),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type Usuario = typeof usuarios.$inferSelect
