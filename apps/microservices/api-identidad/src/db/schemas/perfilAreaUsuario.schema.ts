import { customSchemaItentidad } from "@/config/schemaPG";
import { integer, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { areas } from "./areas.schema";
import { perfiles } from "./perfiles.schema";
import { usuarios } from "./usuarios.schema";

export const perfilAreaUsuario = customSchemaItentidad.table(
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
  (table) => {
    return {
      unq: unique().on(table.perfilId, table.areaId, table.usuarioId),
    };
  },
);

export type PerfilAreaUsuario = typeof perfilAreaUsuario.$inferSelect;
export type NewPerfilAreaUsuario = typeof perfilAreaUsuario.$inferInsert;
export type PerfilAreaUsuarioUpdate = Partial<NewPerfilAreaUsuario>;
