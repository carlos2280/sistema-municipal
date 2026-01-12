import { customSchemaItentidad } from "@municipalidad/shared/config/schemaPG";
import { serial, text, timestamp } from "drizzle-orm/pg-core";

export const sistemas = customSchemaItentidad.table("sistemas", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  icono: text("icono"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos
export type Sistema = typeof sistemas.$inferSelect;
export type NewSistema = typeof sistemas.$inferInsert;
export type SistemaUpdate = Partial<NewSistema>;
