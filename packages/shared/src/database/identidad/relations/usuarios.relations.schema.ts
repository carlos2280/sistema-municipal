import { perfilAreaUsuario } from "@municipalidad/shared/database/identidad/schemas/perfilAreaUsuario.schema";
import { usuarios } from "@municipalidad/shared/database/identidad/schemas/usuarios.schema";
import { relations } from "drizzle-orm";

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  areas: many(perfilAreaUsuario),
}));
