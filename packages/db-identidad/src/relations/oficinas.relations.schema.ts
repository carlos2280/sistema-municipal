import { relations } from 'drizzle-orm'
import { departamentos } from '../schemas/departamentos.schema'
import { oficinas } from '../schemas/oficinas.schema'

export const oficinasRelations = relations(oficinas, ({ one }) => ({
  departamento: one(departamentos, {
    fields: [oficinas.idDepartamento],
    references: [departamentos.id],
  }),
}))
