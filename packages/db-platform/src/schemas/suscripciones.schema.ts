import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { modulos } from './modulos.schema'
import { municipalidades } from './municipalidades.schema'

export const suscripcionEstadoEnum = pgEnum('suscripcion_estado', [
  'activa',
  'suspendida',
  'cancelada',
  'trial',
])

export const suscripciones = pgTable(
  'suscripciones',
  {
    id: serial('id').primaryKey(),
    municipalidadId: integer('municipalidad_id')
      .notNull()
      .references(() => municipalidades.id),
    moduloId: integer('modulo_id')
      .notNull()
      .references(() => modulos.id),
    estado: suscripcionEstadoEnum('estado').notNull().default('activa'),
    fechaInicio: timestamp('fecha_inicio', { withTimezone: true })
      .notNull()
      .defaultNow(),
    fechaFin: timestamp('fecha_fin', { withTimezone: true }),
    precioMensual: decimal('precio_mensual', { precision: 10, scale: 2 }),
    notas: text('notas'),
    activadoPor: text('activado_por'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique('uq_muni_modulo').on(table.municipalidadId, table.moduloId),
  ],
)

export type Suscripcion = typeof suscripciones.$inferSelect
export type NewSuscripcion = typeof suscripciones.$inferInsert
export type SuscripcionUpdate = Partial<NewSuscripcion>
