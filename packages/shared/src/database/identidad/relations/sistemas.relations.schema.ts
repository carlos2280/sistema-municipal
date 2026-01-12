import { menus } from "@municipalidad/shared/database/identidad/schemas/menus.schema";
import { sistemaPerfil } from "@municipalidad/shared/database/identidad/schemas/sistemaPerfil.schema";
import { sistemas } from "@municipalidad/shared/database/identidad/schemas/sistemas.schema";
import { relations } from "drizzle-orm";

// Relaciones para la tabla sistemas
export const sistemasRelations = relations(sistemas, ({ many, one }) => ({
  perfiles: many(sistemaPerfil), // Relación muchos-a-muchos a través de la tabla puente
  menus: many(menus), // Relación uno-a-muchos con menus
}));