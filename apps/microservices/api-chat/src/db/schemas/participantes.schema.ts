import {
  boolean,
  integer,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../../config/schemaPG.js'
import { conversaciones } from './conversaciones.schema.js'

export const participantes = mensajeriaSchema.table('participantes', {
  id: serial('id').primaryKey(),
  conversacionId: integer('conversacion_id')
    .references(() => conversaciones.id)
    .notNull(),
  usuarioId: integer('usuario_id').notNull(),
  rol: text('rol').default('miembro').$type<'admin' | 'miembro'>(),
  silenciado: boolean('silenciado').default(false),
  ultimaLectura: timestamp('ultima_lectura'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type Participante = typeof participantes.$inferSelect
export type NewParticipante = typeof participantes.$inferInsert
