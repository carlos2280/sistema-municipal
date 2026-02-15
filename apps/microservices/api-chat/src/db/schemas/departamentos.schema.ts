import { integer, serial, text } from 'drizzle-orm/pg-core'
import { identidadSchema } from '../../config/schemaPG.js'

// Solo lectura - tabla pertenece al schema 'identidad'
export const departamentos = identidadSchema.table('departamentos', {
  id: serial('id').primaryKey(),
  nombreDepartamento: text('nombre_departamento').notNull(),
  idDireccion: integer('id_direccion').notNull(),
})

export type Departamento = typeof departamentos.$inferSelect
