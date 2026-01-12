import { customSchemaItentidad } from "@municipalidad/shared/config/schemaPG";

import {
  boolean,
  integer,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";
import { oficinas } from "./oficinas.schema";

export const usuarios = customSchemaItentidad.table("usuarios", {
  id: serial("id").primaryKey(),
  nombreCompleto: text("nombre_completo").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  idOficina: integer("id_oficina").references(() => oficinas.id).notNull(), // Eliminar Default 1
  activo: boolean("activo").default(true),
  passwordTemp: boolean("password_temp").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos basados en convenciones comunes
export type Usuario = typeof usuarios.$inferSelect; // SELECT
export type NewUsuario = typeof usuarios.$inferInsert; // INSERT
export type UsuarioUpdate = Partial<NewUsuario>; // UPDATE
