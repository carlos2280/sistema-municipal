import {
  integer,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { mesaAyudaSchema } from "../schemas";

export const prioridades = mesaAyudaSchema.table("prioridades", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  nombre: text("nombre").notNull(),
  color: text("color").notNull(),
  nivel: integer("nivel").notNull().unique(),
  slaHoras: integer("sla_horas").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Prioridad = typeof prioridades.$inferSelect;
export type NewPrioridad = typeof prioridades.$inferInsert;
export type PrioridadUpdate = Partial<NewPrioridad>;
