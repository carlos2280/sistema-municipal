import {
  boolean,
  index,
  integer,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { contabilidadSchema } from '../schemas'

export const subprogramasPresupuestarios = contabilidadSchema.table(
  'subprogramas_presupuestarios',
  {
    id: serial('id').primaryKey(),
    codigo: text('codigo').notNull().unique(),
    nombre: text('nombre').notNull(),
    abreviatura: text('abreviatura').notNull(),
    color: text('color').notNull(),
    orden: integer('orden').notNull().default(0),
    activo: boolean('activo').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    codigoIdx: index('idx_subprog_codigo').on(table.codigo),
    activoIdx: index('idx_subprog_activo').on(table.activo),
  }),
)

export type SubprogramaPresupuestario =
  typeof subprogramasPresupuestarios.$inferSelect
export type NewSubprogramaPresupuestario =
  typeof subprogramasPresupuestarios.$inferInsert
export type SubprogramaPresupuestarioUpdate =
  Partial<NewSubprogramaPresupuestario>
