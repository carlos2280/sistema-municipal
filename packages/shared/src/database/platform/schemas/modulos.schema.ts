import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const modulos = pgTable("modulos", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  icono: text("icono"),
  apiPrefix: text("api_prefix").notNull(),
  mfName: text("mf_name"),
  mfManifestUrlTpl: text("mf_manifest_url_tpl"),
  requiere: text("requiere").array().default([]),
  activo: boolean("activo").default(true),
  orden: integer("orden").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Modulo = typeof modulos.$inferSelect;
export type NewModulo = typeof modulos.$inferInsert;
export type ModuloUpdate = Partial<NewModulo>;
