import { index, integer, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { mesaAyudaSchema } from '../schemas'
import { comentarios } from './comentarios.schema'
import { tickets } from './tickets.schema'

export const adjuntos = mesaAyudaSchema.table(
  'adjuntos',
  {
    id: serial('id').primaryKey(),
    ticketId: integer('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    comentarioId: integer('comentario_id').references(() => comentarios.id, {
      onDelete: 'set null',
    }),
    nombreArchivo: text('nombre_archivo').notNull(),
    tipoMime: text('tipo_mime').notNull(),
    tamanoBytes: integer('tamano_bytes').notNull(),
    rutaStorage: text('ruta_storage').notNull(),
    subidoPor: integer('subido_por').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ticketIdx: index('idx_adjuntos_ticket').on(table.ticketId),
  }),
)

export type Adjunto = typeof adjuntos.$inferSelect
export type NewAdjunto = typeof adjuntos.$inferInsert
