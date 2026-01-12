import { relations } from "drizzle-orm";
import { perfiles, sistemas } from "../schemas";
import { sistemaPerfil } from "../schemas/sistemaPerfil.schema";
// Relaciones para la tabla puente sistemas_perfiles
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