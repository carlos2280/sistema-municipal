import { menus } from "@municipalidad/shared/database/identidad/schemas/menus.schema";
import { sistemas } from "@municipalidad/shared/database/identidad/schemas/sistemas.schema";
import { relations } from "drizzle-orm";

export const menusRelations = relations(menus, ({ one, many }) => ({
  sistema: one(sistemas, {
    fields: [menus.idSistema],
    references: [sistemas.id],
  }),
  padre: one(menus, {
    fields: [menus.idPadre],
    references: [menus.id],
    relationName: "menu_padre", // Nombre para la autoreferencia
  }),
}));
