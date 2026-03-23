import { index, integer, serial, timestamp, unique } from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../schemas'
import { llamadas } from './llamadas.schema'

export const llamadaParticipantes = mensajeriaSchema.table(
  'llamada_participantes',
  {
    id: serial('id').primaryKey(),
    llamadaId: integer('llamada_id')
      .notNull()
      .references(() => llamadas.id, { onDelete: 'cascade' }),
    usuarioId: integer('usuario_id').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
    leftAt: timestamp('left_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_llamada_part_llamada').on(table.llamadaId),
    index('idx_llamada_part_usuario').on(table.usuarioId),
    unique('uq_llamada_participante').on(table.llamadaId, table.usuarioId),
  ],
)

export type LlamadaParticipante = typeof llamadaParticipantes.$inferSelect
export type NewLlamadaParticipante = typeof llamadaParticipantes.$inferInsert
