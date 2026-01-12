
import { perfilAreaUsuario } from "@municipalidad/shared/database/identidad/schemas/perfilAreaUsuario.schema";
import { perfiles } from "@municipalidad/shared/database/identidad/schemas/perfiles.schema";
import { sistemaPerfil } from "@municipalidad/shared/database/identidad/schemas/sistemaPerfil.schema";
import { relations } from "drizzle-orm";

export const perfilesRelations = relations(perfiles, ({ many }) => ({
  // usuarios: many(usuarioArea, { relationName: "perfil_usuarios" }),
  perfiles: many(perfilAreaUsuario),
  sistemas: many(sistemaPerfil),
}));
