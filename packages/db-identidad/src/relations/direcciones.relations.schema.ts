import { relations } from 'drizzle-orm'
import { departamentos } from '../schemas/departamentos.schema'
import { direcciones } from '../schemas/direcciones.schema'

export const direccionesRelations = relations(direcciones, ({ many }) => ({
  departamentos: many(departamentos),
}))
