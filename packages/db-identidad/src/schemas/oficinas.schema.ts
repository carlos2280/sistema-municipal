import { index, integer, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { identidadSchema } from '../schemas'
import { departamentos } from './departamentos.schema'

export const oficinas = identidadSchema.table(
  'oficinas',
  {
    id: serial('id').primaryKey(),
    nombreOficina: text('nombre_oficina').notNull(),
    responsable: text('responsable').notNull(),
    idDepartamento: integer('id_departamento')
      .references(() => departamentos.id)
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    deptoIdx: index('idx_oficinas_depto').on(table.idDepartamento),
  }),
)
export type Oficina = typeof oficinas.$inferSelect
export type NewOficina = typeof oficinas.$inferInsert
