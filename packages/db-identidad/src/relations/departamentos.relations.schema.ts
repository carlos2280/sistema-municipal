import { relations } from 'drizzle-orm'
import { departamentos } from '../schemas/departamentos.schema'
import { direcciones } from '../schemas/direcciones.schema'
import { oficinas } from '../schemas/oficinas.schema'

export const departamentosRelations = relations(
  departamentos,
  ({ one, many }) => ({
    direccion: one(direcciones, {
      fields: [departamentos.idDireccion],
      references: [direcciones.id],
    }),
    oficinas: many(oficinas),
  }),
)
