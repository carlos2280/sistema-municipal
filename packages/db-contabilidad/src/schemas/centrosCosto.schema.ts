import { contabilidadSchema } from "../schemas";
import { boolean, serial, text, timestamp } from "drizzle-orm/pg-core";

export const centrosCosto = contabilidadSchema.table("centros_costo", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  nombre: text("nombre").notNull(),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CentrosCosto = typeof centrosCosto.$inferSelect;
export type NewCentrosCosto = typeof centrosCosto.$inferInsert;
export type CentrosCostoUpdate = Partial<NewCentrosCosto>;
