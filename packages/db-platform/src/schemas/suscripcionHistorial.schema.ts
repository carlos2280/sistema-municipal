import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { suscripciones } from "./suscripciones.schema";

export const suscripcionHistorial = pgTable("suscripcion_historial", {
  id: serial("id").primaryKey(),
  suscripcionId: integer("suscripcion_id")
    .notNull()
    .references(() => suscripciones.id),
  accion: text("accion").notNull(),
  estadoAnterior: text("estado_anterior"),
  estadoNuevo: text("estado_nuevo").notNull(),
  motivo: text("motivo"),
  ejecutadoPor: text("ejecutado_por").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SuscripcionHistorialRecord =
  typeof suscripcionHistorial.$inferSelect;
export type NewSuscripcionHistorial =
  typeof suscripcionHistorial.$inferInsert;
