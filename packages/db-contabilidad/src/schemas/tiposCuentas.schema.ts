import { serial, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { contabilidadSchema } from '../schemas'

export const tiposCuentas = contabilidadSchema.table(
  'tipos_cuentas',
  {
    id: serial('id').primaryKey(),
    codigo: text('codigo').notNull(),
    nombre: text('nombre').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [unique('uq_tipos_cuentas_codigo').on(table.codigo)],
)

// Tipos
export type TiposCuentas = typeof tiposCuentas.$inferSelect
export type NewTiposCuentas = typeof tiposCuentas.$inferInsert
export type TiposCuentasUpdate = Partial<TiposCuentas>
