import { integer, serial, text } from 'drizzle-orm/pg-core'
import { identidadSchema } from '../../config/schemaPG.js'

// Solo lectura - tabla pertenece al schema 'identidad'
export const oficinas = identidadSchema.table('oficinas', {
  id: serial('id').primaryKey(),
  nombreOficina: text('nombre_oficina').notNull(),
  idDepartamento: integer('id_departamento').notNull(),
})

export type Oficina = typeof oficinas.$inferSelect
