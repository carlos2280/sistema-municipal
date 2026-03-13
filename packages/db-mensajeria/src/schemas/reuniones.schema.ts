import { integer, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../schemas'
import { conversaciones } from './conversaciones.schema'
import { llamadas } from './llamadas.schema'
import { mensajes } from './mensajes.schema'

export const reuniones = mensajeriaSchema.table('reuniones', {
  id: serial('id').primaryKey(),
  conversacionId: integer('conversacion_id')
    .references(() => conversaciones.id)
    .notNull(),
  organizadorId: integer('organizador_id').notNull(),
  titulo: varchar('titulo', { length: 200 }).notNull(),
  descripcion: text('descripcion'),
  tipo: varchar('tipo', { length: 20 })
    .notNull()
    .default('video')
    .$type<'video' | 'voz' | 'presencial'>(),
  estado: varchar('estado', { length: 20 })
    .notNull()
    .default('programada')
    .$type<'programada' | 'activa' | 'completada' | 'cancelada'>(),
  fechaInicio: timestamp('fecha_inicio', { withTimezone: true }).notNull(),
  fechaFin: timestamp('fecha_fin', { withTimezone: true }).notNull(),
  llamadaId: integer('llamada_id').references(() => llamadas.id),
  mensajeId: integer('mensaje_id').references(() => mensajes.id),
  ubicacion: varchar('ubicacion', { length: 500 }),
  notas: text('notas'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Reunion = typeof reuniones.$inferSelect
export type NewReunion = typeof reuniones.$inferInsert
export type ReunionUpdate = Partial<NewReunion>
