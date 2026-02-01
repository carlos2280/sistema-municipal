import { identidadSchema } from "../../schemas";
import { areas } from "@municipalidad/shared/database/identidad/schemas/areas.schema";
import { perfiles } from "@municipalidad/shared/database/identidad/schemas/perfiles.schema";
import { usuarios } from "@municipalidad/shared/database/identidad/schemas/usuarios.schema";
import { index, integer, serial, timestamp, unique } from "drizzle-orm/pg-core";

export const perfilAreaUsuario = identidadSchema.table(
  "perfil_area_usuario",
  {
    id: serial("id").primaryKey(),
    perfilId: integer("perfil_id")
      .notNull()
      .references(() => perfiles.id),
    areaId: integer("area_id")
      .notNull()
      .references(() => areas.id),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Constraint único compuesto
    unq: unique("uq_perfil_area_usuario").on(table.perfilId, table.areaId, table.usuarioId),
    // Índice para consultas de permisos por usuario
    usuarioIdx: index("idx_perfil_area_usuario_uid").on(table.usuarioId),
  }),
);

export type PerfilAreaUsuario = typeof perfilAreaUsuario.$inferSelect;
export type NewPerfilAreaUsuario = typeof perfilAreaUsuario.$inferInsert;
export type PerfilAreaUsuarioUpdate = Partial<NewPerfilAreaUsuario>;