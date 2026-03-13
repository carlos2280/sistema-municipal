import { relations } from "drizzle-orm";
import { perfiles } from "../schemas/perfiles.schema";
import { sistemaPerfil } from "../schemas/sistemaPerfil.schema";
import { sistemas } from "../schemas/sistemas.schema";

export const sistemasPerfilesRelations = relations(sistemaPerfil, ({ one }) => ({
  sistema: one(sistemas, {
    fields: [sistemaPerfil.sistemaId],
    references: [sistemas.id],
  }),
  perfil: one(perfiles, {
    fields: [sistemaPerfil.perfilId],
    references: [perfiles.id],
  }),
}));
