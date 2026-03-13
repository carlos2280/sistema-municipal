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

export const mensajes = mensajeriaSchema.table('mensajes', {
  id: serial('id').primaryKey(),
  conversacionId: integer('conversacion_id')
    .references(() => conversaciones.id)
    .notNull(),
  remitenteId: integer('remitente_id').notNull(),
  contenido: text('contenido'),
  tipo: text('tipo').default('texto').$type<'texto' | 'archivo' | 'imagen' | 'sistema' | 'reunion'>(),
  replyToId: integer('reply_to_id'),
  editado: boolean('editado').default(false),
  eliminado: boolean('eliminado').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  conversacionIdx: index('idx_mensajes_conversacion').on(table.conversacionId),
  remitenteIdx: index('idx_mensajes_remitente').on(table.remitenteId),
  convCreatedIdx: index('idx_mensajes_created').on(table.conversacionId, table.createdAt),
}))

export type Mensaje = typeof mensajes.$inferSelect
export type NewMensaje = typeof mensajes.$inferInsert
export type MensajeUpdate = Partial<NewMensaje>
