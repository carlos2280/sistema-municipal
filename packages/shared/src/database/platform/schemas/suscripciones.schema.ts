import {
  decimal,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { municipalidades } from "./municipalidades.schema";
import { modulos } from "./modulos.schema";

export const suscripciones = pgTable(
  "suscripciones",
  {
    id: serial("id").primaryKey(),
    municipalidadId: integer("municipalidad_id")
      .notNull()
      .references(() => municipalidades.id),
    moduloId: integer("modulo_id")
      .notNull()
      .references(() => modulos.id),
    estado: text("estado").notNull().default("activa"),
    fechaInicio: timestamp("fecha_inicio").notNull().defaultNow(),
    fechaFin: timestamp("fecha_fin"),
    precioMensual: decimal("precio_mensual", { precision: 10, scale: 2 }),
    notas: text("notas"),
    activadoPor: text("activado_por"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [unique("uq_muni_modulo").on(table.municipalidadId, table.moduloId)],
);

export type Suscripcion = typeof suscripciones.$inferSelect;
export type NewSuscripcion = typeof suscripciones.$inferInsert;
export type SuscripcionUpdate = Partial<NewSuscripcion>;
