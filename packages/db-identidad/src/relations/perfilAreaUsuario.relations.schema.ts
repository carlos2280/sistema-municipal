import { relations } from "drizzle-orm";
import { areas } from "../schemas/areas.schema";
import { perfilAreaUsuario } from "../schemas/perfilAreaUsuario.schema";
import { perfiles } from "../schemas/perfiles.schema";
import { usuarios } from "../schemas/usuarios.schema";

export const perfilAreaUsuarioRelations = relations(perfilAreaUsuario, ({ one }) => ({
  perfil: one(perfiles, {
    fields: [perfilAreaUsuario.perfilId],
    references: [perfiles.id],
  }),
  area: one(areas, {
    fields: [perfilAreaUsuario.areaId],
    references: [areas.id],
  }),
  usuario: one(usuarios, {
    fields: [perfilAreaUsuario.usuarioId],
    references: [usuarios.id],
  }),
}));
