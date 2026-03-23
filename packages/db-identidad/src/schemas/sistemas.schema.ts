import { identidadSchema } from "../schemas";
import { integer, serial, text, timestamp } from "drizzle-orm/pg-core";

export const sistemas = identidadSchema.table("sistemas", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  nombre: text("nombre").notNull(),
  icono: text("icono"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  // Soft delete
  deletedAt: timestamp("deleted_at"),
  deletedBy: integer("deleted_by"),
});

// Tipos
export type Sistema = typeof sistemas.$inferSelect;
export type NewSistema = typeof sistemas.$inferInsert;
export type SistemaUpdate = Partial<NewSistema>;
