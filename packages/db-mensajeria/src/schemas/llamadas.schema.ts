import {
  index,
  integer,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../schemas'
import { conversaciones } from './conversaciones.schema'

export const llamadas = mensajeriaSchema.table('llamadas', {
  id: serial('id').primaryKey(),
  conversacionId: integer('conversacion_id')
    .references(() => conversaciones.id)
    .notNull(),
  iniciadoPor: integer('iniciado_por').notNull(),
  tipo: text('tipo').notNull().$type<'voz' | 'video'>(),
  estado: text('estado')
    .notNull()
    .$type<'sonando' | 'activa' | 'finalizada' | 'rechazada' | 'sin_respuesta'>(),
  livekitRoom: text('livekit_room').notNull(),
  duracionSegundos: integer('duracion_segundos'),
  participantesIds: text('participantes_ids'),
  iniciadaEn: timestamp('iniciada_en', { withTimezone: true }).defaultNow(),
  finalizadaEn: timestamp('finalizada_en', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  conversacionIdx: index('idx_llamadas_conv').on(table.conversacionId),
}))

export type Llamada = typeof llamadas.$inferSelect
export type NewLlamada = typeof llamadas.$inferInsert
