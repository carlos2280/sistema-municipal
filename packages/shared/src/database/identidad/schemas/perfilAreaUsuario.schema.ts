import { customSchemaItentidad } from "@municipalidad/shared/config/schemaPG";
import { areas } from "@municipalidad/shared/database/identidad/schemas/areas.schema";
import { perfiles } from "@municipalidad/shared/database/identidad/schemas/perfiles.schema";
import { usuarios } from "@municipalidad/shared/database/identidad/schemas/usuarios.schema";
import { integer, serial, timestamp, unique } from "drizzle-orm/pg-core";

export const perfilAreaUsuario = customSchemaItentidad.table(
  "perfil_area_usuario", // Cambiado el nombre de la tabla
  {
    id: serial("id").primaryKey(),
    perfilId: integer("perfil_id")
      .notNull()
      .references(() => perfiles.id),
    areaId: integer("area_id")
      .notNull()
      .references(() => areas.id),
    usuarioId: integer("usuario_id") // Nuevo campo
      .notNull()
      .references(() => usuarios.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      unq: unique().on(table.perfilId, table.areaId, table.usuarioId), // ✅ Restricción única compuesta con usuario
    };
  },
);

export type PerfilAreaUsuario = typeof perfilAreaUsuario.$inferSelect;
export type NewPerfilAreaUsuario = typeof perfilAreaUsuario.$inferInsert;
export type PerfilAreaUsuarioUpdate = Partial<NewPerfilAreaUsuario>;