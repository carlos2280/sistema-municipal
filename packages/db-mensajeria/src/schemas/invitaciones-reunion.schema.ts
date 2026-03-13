import { integer, serial, timestamp, varchar } from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../schemas'
import { reuniones } from './reuniones.schema'

export const invitacionesReunion = mensajeriaSchema.table('invitaciones_reunion', {
  id: serial('id').primaryKey(),
  reunionId: integer('reunion_id')
    .references(() => reuniones.id, { onDelete: 'cascade' })
    .notNull(),
  usuarioId: integer('usuario_id').notNull(),
  estado: varchar('estado', { length: 20 })
    .notNull()
    .default('pendiente')
    .$type<'pendiente' | 'aceptada' | 'rechazada' | 'tentativa'>(),
  respondidoEn: timestamp('respondido_en', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type InvitacionReunion = typeof invitacionesReunion.$inferSelect
export type NewInvitacionReunion = typeof invitacionesReunion.$inferInsert
