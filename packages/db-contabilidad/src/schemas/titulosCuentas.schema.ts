import { serial, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { contabilidadSchema } from '../schemas'

export const titulosCuentas = contabilidadSchema.table(
  'titulos_cuentas',
  {
    id: serial('id').primaryKey(),
    codigo: text('codigo').notNull(),
    nombre: text('nombre').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [unique('uq_titulos_cuentas_codigo').on(table.codigo)],
)

// Tipos
export type TitulosCuentas = typeof titulosCuentas.$inferSelect
export type NewTitulosCuentas = typeof titulosCuentas.$inferInsert
export type TitulosCuentasUpdate = Partial<TitulosCuentas>
