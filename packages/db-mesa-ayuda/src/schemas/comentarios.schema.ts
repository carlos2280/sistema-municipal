import {
  boolean,
  index,
  integer,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { mesaAyudaSchema } from '../schemas'
import { tickets } from './tickets.schema'

export const comentarios = mesaAyudaSchema.table(
  'comentarios',
  {
    id: serial('id').primaryKey(),
    ticketId: integer('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    autorId: integer('autor_id').notNull(),
    autorNombre: text('autor_nombre').notNull(),
    contenido: text('contenido').notNull(),
    esInterno: boolean('es_interno').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ticketIdx: index('idx_comentarios_ticket').on(table.ticketId),
  }),
)

export type Comentario = typeof comentarios.$inferSelect
export type NewComentario = typeof comentarios.$inferInsert
export type ComentarioUpdate = Partial<NewComentario>
