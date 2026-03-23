import { relations } from 'drizzle-orm'
import { menus } from '../schemas/menus.schema'
import { sistemas } from '../schemas/sistemas.schema'

export const menusRelations = relations(menus, ({ one, many }) => ({
  sistema: one(sistemas, {
    fields: [menus.idSistema],
    references: [sistemas.id],
  }),
  menuPadre: one(menus, {
    fields: [menus.idPadre],
    references: [menus.id],
    relationName: 'menu_padre',
  }),
  menuHijos: many(menus, {
    relationName: 'menu_padre',
  }),
}))
