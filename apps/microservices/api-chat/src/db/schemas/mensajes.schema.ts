import {
  boolean,
  integer,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../../config/schemaPG.js'
import { conversaciones } from './conversaciones.schema.js'

export const mensajes = mensajeriaSchema.table('mensajes', {
  id: serial('id').primaryKey(),
  conversacionId: integer('conversacion_id')
    .references(() => conversaciones.id)
    .notNull(),
  remitenteId: integer('remitente_id').notNull(),
  contenido: text('contenido'),
  tipo: text('tipo').default('texto').$type<'texto' | 'archivo' | 'imagen' | 'sistema'>(),
  replyToId: integer('reply_to_id'),
  editado: boolean('editado').default(false),
  eliminado: boolean('eliminado').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type Mensaje = typeof mensajes.$inferSelect
export type NewMensaje = typeof mensajes.$inferInsert
export type MensajeUpdate = Partial<NewMensaje>
