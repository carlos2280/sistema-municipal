import { customSchemaContabilidad } from "@/config/schemaPG";
import { boolean, serial, text, timestamp } from "drizzle-orm/pg-core";

export const centrosCosto = customSchemaContabilidad.table("centros_costo", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  nombre: text("nombre").notNull(),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CentrosCosto = typeof centrosCosto.$inferSelect;
export type NewCentrosCosto = typeof centrosCosto.$inferInsert;
export type CentrosCostoUpdate = Partial<NewCentrosCosto>;
