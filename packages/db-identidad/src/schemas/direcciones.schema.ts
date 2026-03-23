import { serial, text, timestamp } from 'drizzle-orm/pg-core'
import { identidadSchema } from '../schemas'

// Tabla: direccion
export const direcciones = identidadSchema.table('direcciones', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  responsable: text('responsable').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
export type Direccion = typeof direcciones.$inferSelect
export type NewDireccion = typeof direcciones.$inferInsert
