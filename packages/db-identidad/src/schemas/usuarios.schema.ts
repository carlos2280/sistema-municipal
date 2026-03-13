import { identidadSchema } from "../schemas";
import {
  boolean,
  index,
  integer,
  jsonb,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";
import { oficinas } from "./oficinas.schema";

export const usuarios = identidadSchema.table("usuarios", {
  id: serial("id").primaryKey(),
  nombreCompleto: text("nombre_completo").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  idOficina: integer("id_oficina").references(() => oficinas.id).notNull(),
  activo: boolean("activo").default(true),
  passwordTemp: boolean("password_temp").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  // MFA fields
  mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
  mfaSecret: text("mfa_secret"),
  mfaVerified: boolean("mfa_verified").default(false).notNull(),
  mfaBackupCodes: jsonb("mfa_backup_codes").$type<string[]>(),
}, (table) => ({
  oficinaIdx: index("idx_usuarios_oficina").on(table.idOficina),
}));

// Tipos basados en convenciones comunes
export type Usuario = typeof usuarios.$inferSelect; // SELECT
export type NewUsuario = typeof usuarios.$inferInsert; // INSERT
export type UsuarioUpdate = Partial<NewUsuario>; // UPDATE
