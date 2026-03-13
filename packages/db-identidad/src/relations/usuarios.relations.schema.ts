import { relations } from "drizzle-orm";
import { oficinas } from "../schemas/oficinas.schema";
import { perfilAreaUsuario } from "../schemas/perfilAreaUsuario.schema";
import { usuarios } from "../schemas/usuarios.schema";

export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  oficina: one(oficinas, {
    fields: [usuarios.idOficina],
    references: [oficinas.id],
  }),
  areas: many(perfilAreaUsuario),
}));
