import { customSchemaContabilidad } from "@municipalidad/shared/config/schemaPG";
import { serial, text, timestamp } from "drizzle-orm/pg-core";

export const titulosCuentas = customSchemaContabilidad.table("titulos_cuentas", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull(),
  nombre: text("nombre").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos
export type TitulosCuentas = typeof titulosCuentas.$inferSelect;
export type NewTitulosCuentas = typeof titulosCuentas.$inferInsert;
export type TitulosCuentasUpdate = Partial<TitulosCuentas>;
