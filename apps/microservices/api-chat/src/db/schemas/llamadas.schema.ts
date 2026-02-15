import {
  integer,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../../config/schemaPG.js'
import { conversaciones } from './conversaciones.schema.js'

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
  iniciadaEn: timestamp('iniciada_en').defaultNow(),
  finalizadaEn: timestamp('finalizada_en'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type Llamada = typeof llamadas.$inferSelect
export type NewLlamada = typeof llamadas.$inferInsert
