import { customSchemaItentidad } from "@/config/schemaPG";
import {
  boolean,
  integer,
  jsonb,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { oficinas } from "./oficinas.schema";

export const usuarios = customSchemaItentidad.table("usuarios", {
  id: serial("id").primaryKey(),
  nombreCompleto: text("nombre_completo").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  idOficina: integer("id_oficina")
    .references(() => oficinas.id)
    .notNull(),
  activo: boolean("activo").default(true),
  passwordTemp: boolean("password_temp").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),

  // MFA — Multi-Factor Authentication
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  // Secreto TOTP cifrado con AES-256-GCM. null hasta que el usuario active MFA.
  mfaSecret: text("mfa_secret"),
  // true tras validar el primer código TOTP exitosamente (previene activaciones a medias).
  mfaVerified: boolean("mfa_verified").notNull().default(false),
  // Array de hashes bcrypt de los 8 códigos de respaldo de un solo uso.
  mfaBackupCodes: jsonb("mfa_backup_codes").$type<string[]>(),
});

// Tipos basados en convenciones comunes
export type Usuario = typeof usuarios.$inferSelect; // SELECT
export type NewUsuario = typeof usuarios.$inferInsert; // INSERT
export type UsuarioUpdate = Partial<NewUsuario>; // UPDATE
