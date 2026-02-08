import {
  integer,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../../config/schemaPG.js'
import { mensajes } from './mensajes.schema.js'

export const archivos = mensajeriaSchema.table('archivos', {
  id: serial('id').primaryKey(),
  mensajeId: integer('mensaje_id')
    .references(() => mensajes.id)
    .notNull(),
  nombre: text('nombre').notNull(),
  tipo: text('tipo').notNull(),
  tamanio: integer('tamanio').notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type Archivo = typeof archivos.$inferSelect
export type NewArchivo = typeof archivos.$inferInsert
