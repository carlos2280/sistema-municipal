import { customSchemaItentidad } from "@/config/schemaPG";
import { serial, text } from "drizzle-orm/pg-core";

// Tabla: direccion
export const direcciones = customSchemaItentidad.table("direcciones", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  responsable: text("responsable").notNull(),
});

export type Direccion = typeof direcciones.$inferSelect;
export type NewDireccion = typeof direcciones.$inferInsert;
