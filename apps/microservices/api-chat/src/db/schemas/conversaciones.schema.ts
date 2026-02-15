import {
  boolean,
  integer,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../../config/schemaPG.js'

export const conversaciones = mensajeriaSchema.table('conversaciones', {
  id: serial('id').primaryKey(),
  tipo: text('tipo').notNull().$type<'directa' | 'grupo'>(),
  nombre: text('nombre'),
  descripcion: text('descripcion'),
  avatarUrl: text('avatar_url'),
  creadorId: integer('creador_id').notNull(),
  activo: boolean('activo').default(true),
  sistema: boolean('sistema').default(false),
  departamentoId: integer('departamento_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type Conversacion = typeof conversaciones.$inferSelect
export type NewConversacion = typeof conversaciones.$inferInsert
export type ConversacionUpdate = Partial<NewConversacion>
