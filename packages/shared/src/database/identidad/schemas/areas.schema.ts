import { customSchemaItentidad } from "@municipalidad/shared/config/schemaPG";
import { serial, text, timestamp } from "drizzle-orm/pg-core";

export const areas = customSchemaItentidad.table("areas", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos
export type Area = typeof areas.$inferSelect;
export type NewArea = typeof areas.$inferInsert;
export type AreaUpdate = Partial<NewArea>;
