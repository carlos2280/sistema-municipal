import { relations } from "drizzle-orm";
import { perfilAreaUsuario } from "../schemas/perfilAreaUsuario.schema";
import { perfiles } from "../schemas/perfiles.schema";
import { sistemaPerfil } from "../schemas/sistemaPerfil.schema";

export const perfilesRelations = relations(perfiles, ({ many }) => ({
  perfiles: many(perfilAreaUsuario),
  sistemas: many(sistemaPerfil),
}));
