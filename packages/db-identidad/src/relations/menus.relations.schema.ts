import { relations } from "drizzle-orm";
import { menus } from "../schemas/menus.schema";
import { sistemas } from "../schemas/sistemas.schema";

export const menusRelations = relations(menus, ({ one }) => ({
  sistema: one(sistemas, {
    fields: [menus.idSistema],
    references: [sistemas.id],
  }),
  padre: one(menus, {
    fields: [menus.idPadre],
    references: [menus.id],
    relationName: "menu_padre",
  }),
}));
