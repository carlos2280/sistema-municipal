import { customSchemaContabilidad } from "@/config/schemaPG";
import {
  type AnyPgColumn,
  bigint,
  integer,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { centrosCosto } from "./centrosCosto.schema";
import { planesCuentas } from "./planesCuentas.schema";
import { presupuestos } from "./presupuestos.schema";

export const presupuestosDetalle = customSchemaContabilidad.table(
  "presupuestos_detalle",
  {
    id: serial("id").primaryKey(),
    presupuestoId: integer("presupuesto_id")
      .notNull()
      .references((): AnyPgColumn => presupuestos.id, { onDelete: "cascade" }),
    cuentaId: integer("cuenta_id")
      .notNull()
      .references((): AnyPgColumn => planesCuentas.id),
    centroCostoId: integer("centro_costo_id").references(
      (): AnyPgColumn => centrosCosto.id,
    ),
    montoAnual: bigint("monto_anual", { mode: "number" }).notNull(),
    observacion: text("observacion"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uqLinea: unique("uq_presupuesto_detalle").on(
      table.presupuestoId,
      table.cuentaId,
      table.centroCostoId,
    ),
  }),
);

export type PresupuestoDetalle = typeof presupuestosDetalle.$inferSelect;
export type NewPresupuestoDetalle = typeof presupuestosDetalle.$inferInsert;
export type PresupuestoDetalleUpdate = Partial<NewPresupuestoDetalle>;
