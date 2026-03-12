import { integer, serial, timestamp, varchar } from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../../schemas'
import { reuniones } from './reuniones.schema'

export const recordatoriosReunion = mensajeriaSchema.table('recordatorios_reunion', {
  id: serial('id').primaryKey(),
  reunionId: integer('reunion_id')
    .references(() => reuniones.id, { onDelete: 'cascade' })
    .notNull(),
  usuarioId: integer('usuario_id').notNull(),
  minutosAntes: integer('minutos_antes').notNull().default(15),
  estado: varchar('estado', { length: 20 })
    .notNull()
    .default('pendiente')
    .$type<'pendiente' | 'enviado' | 'cancelado'>(),
  enviarEn: timestamp('enviar_en', { withTimezone: true }).notNull(),
  enviadoEn: timestamp('enviado_en', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type RecordatorioReunion = typeof recordatoriosReunion.$inferSelect
export type NewRecordatorioReunion = typeof recordatoriosReunion.$inferInsert
