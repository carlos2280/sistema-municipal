import { customSchemaItentidad } from "@/config/schemaPG";
import { relations } from "drizzle-orm";
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

  // MFA — espejo de api-identidad (misma tabla, misma DB del tenant)
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  mfaSecret: text("mfa_secret"),
  mfaVerified: boolean("mfa_verified").notNull().default(false),
  mfaBackupCodes: jsonb("mfa_backup_codes").$type<string[]>(),
});

// Relaciones
export const usuariosRelations = relations(usuarios, ({ one }) => ({
  oficina: one(oficinas, {
    fields: [usuarios.idOficina],
    references: [oficinas.id],
  }),
}));

// Tipos basados en convenciones comunes
export type Usuario = typeof usuarios.$inferSelect; // SELECT
export type NewUsuario = typeof usuarios.$inferInsert; // INSERT
export type UsuarioUpdate = Partial<NewUsuario>; // UPDATE
