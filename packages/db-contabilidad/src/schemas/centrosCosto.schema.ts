import { boolean, integer, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { contabilidadSchema } from '../schemas'

export const centrosCosto = contabilidadSchema.table('centros_costo', {
  id: serial('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  nombre: text('nombre').notNull(),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  // Soft delete
  deletedAt: timestamp('deleted_at'),
  deletedBy: integer('deleted_by'),
})

export type CentrosCosto = typeof centrosCosto.$inferSelect
export type NewCentrosCosto = typeof centrosCosto.$inferInsert
export type CentrosCostoUpdate = Partial<NewCentrosCosto>
