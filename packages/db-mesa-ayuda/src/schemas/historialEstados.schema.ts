import { index, integer, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { mesaAyudaSchema } from '../schemas'
import { tickets } from './tickets.schema'

export const historialEstados = mesaAyudaSchema.table(
  'historial_estados',
  {
    id: serial('id').primaryKey(),
    ticketId: integer('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    estadoAnterior: text('estado_anterior'),
    estadoNuevo: text('estado_nuevo').notNull(),
    motivo: text('motivo'),
    ejecutadoPor: integer('ejecutado_por').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ticketIdx: index('idx_historial_ticket').on(table.ticketId),
  }),
)

export type HistorialEstado = typeof historialEstados.$inferSelect
export type NewHistorialEstado = typeof historialEstados.$inferInsert
