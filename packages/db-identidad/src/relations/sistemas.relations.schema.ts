import { relations } from "drizzle-orm";
import { menus } from "../schemas/menus.schema";
import { sistemaPerfil } from "../schemas/sistemaPerfil.schema";
import { sistemas } from "../schemas/sistemas.schema";

export const sistemasRelations = relations(sistemas, ({ many }) => ({
  perfiles: many(sistemaPerfil),
  menus: many(menus),
}));
