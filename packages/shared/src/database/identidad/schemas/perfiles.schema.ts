import { identidadSchema } from "../../schemas";
import { serial, text, timestamp } from "drizzle-orm/pg-core";

export const perfiles = identidadSchema.table("perfiles", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos
export type Perfil = typeof perfiles.$inferSelect;
export type NewPerfil = typeof perfiles.$inferInsert;
export type PerfilUpdate = Partial<NewPerfil>;
