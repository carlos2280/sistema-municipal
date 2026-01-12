import { areas } from "@municipalidad/shared/database/identidad/schemas/areas.schema";
import { perfilAreaUsuario } from "@municipalidad/shared/database/identidad/schemas/perfilAreaUsuario.schema"; // Cambiado el import
import { perfiles } from "@municipalidad/shared/database/identidad/schemas/perfiles.schema";
import { usuarios } from "@municipalidad/shared/database/identidad/schemas/usuarios.schema";
import { relations } from "drizzle-orm";

export const perfilAreaUsuarioRelations = relations(perfilAreaUsuario, ({ one }) => ({
  perfil: one(perfiles, {
    fields: [perfilAreaUsuario.perfilId],
    references: [perfiles.id],
  }),
  area: one(areas, {
    fields: [perfilAreaUsuario.areaId],
    references: [areas.id],
  }),
  usuario: one(usuarios, { // Nueva relación con usuarios
    fields: [perfilAreaUsuario.usuarioId],
    references: [usuarios.id],
  }),
}));