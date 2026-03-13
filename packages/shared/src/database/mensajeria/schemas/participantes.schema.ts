import {
  boolean,
  index,
  integer,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../../schemas'
import { conversaciones } from './conversaciones.schema'

export const participantes = mensajeriaSchema.table('participantes', {
  id: serial('id').primaryKey(),
  conversacionId: integer('conversacion_id')
    .references(() => conversaciones.id)
    .notNull(),
  usuarioId: integer('usuario_id').notNull(),
  rol: text('rol').default('miembro').$type<'admin' | 'miembro'>(),
  silenciado: boolean('silenciado').default(false),
  ultimaLectura: timestamp('ultima_lectura', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  conversacionIdx: index('idx_participantes_conv').on(table.conversacionId),
  usuarioIdx: index('idx_participantes_usuario').on(table.usuarioId),
}))

export type Participante = typeof participantes.$inferSelect
export type NewParticipante = typeof participantes.$inferInsert
