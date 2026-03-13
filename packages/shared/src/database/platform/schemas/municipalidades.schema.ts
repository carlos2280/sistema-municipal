import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const municipalidades = pgTable("municipalidades", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  slug: text("slug").notNull().unique(),
  rut: text("rut").unique(),
  direccion: text("direccion"),
  telefono: text("telefono"),
  emailContacto: text("email_contacto"),
  logoUrl: text("logo_url"),
  tema: jsonb("tema").default({}),
  dominioBase: text("dominio_base").notNull(),
  dominiosCustom: text("dominios_custom").array().default([]),
  dbName: text("db_name").notNull().unique(),
  activo: boolean("activo").default(true),
  maxUsuarios: integer("max_usuarios").default(50),
  mfaPolicy: text("mfa_policy")
    .$type<"required" | "optional" | "disabled">()
    .notNull()
    .default("optional"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type Municipalidad = typeof municipalidades.$inferSelect;
export type NewMunicipalidad = typeof municipalidades.$inferInsert;
export type MunicipalidadUpdate = Partial<NewMunicipalidad>;
