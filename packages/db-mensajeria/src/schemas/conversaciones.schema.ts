import {
  boolean,
  index,
  integer,
  pgEnum,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../schemas'

export const conversacionTipoEnum = pgEnum('conversacion_tipo', [
  'directa',
  'grupo',
  'departamento',
  'canal',
])

export const conversaciones = mensajeriaSchema.table(
  'conversaciones',
  {
    id: serial('id').primaryKey(),
    tipo: conversacionTipoEnum('tipo').notNull(),
    nombre: text('nombre'),
    descripcion: text('descripcion'),
    avatarUrl: text('avatar_url'),
    creadorId: integer('creador_id').notNull(),
    activo: boolean('activo').default(true),
    sistema: boolean('sistema').default(false),
    departamentoId: integer('departamento_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    departamentoIdx: index('idx_conversaciones_departamento_id').on(
      table.departamentoId,
    ),
  }),
)

export type Conversacion = typeof conversaciones.$inferSelect
export type NewConversacion = typeof conversaciones.$inferInsert
export type ConversacionUpdate = Partial<NewConversacion>
