import { contabilidadSchema } from "../schemas";
import {
  type AnyPgColumn,
  bigint,
  index,
  integer,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { centrosCosto } from "./centrosCosto.schema";
import { planesCuentas } from "./planesCuentas.schema";
import { presupuestos } from "./presupuestos.schema";

export const presupuestosDetalle = contabilidadSchema.table(
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
    // Pesos chilenos enteros (sin decimales). bigint mode:"number" cabe en JS Number hasta 2^53
    montoAnual: bigint("monto_anual", { mode: "number" }).notNull(),
    observacion: text("observacion"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uqLinea: unique("uq_presupuesto_detalle").on(
      table.presupuestoId,
      table.cuentaId,
      table.centroCostoId,
    ),
    cuentaIdx: index("idx_presup_det_cuenta").on(table.cuentaId),
    centroCostoIdx: index("idx_presup_det_centro").on(table.centroCostoId),
  }),
);

export type PresupuestoDetalle = typeof presupuestosDetalle.$inferSelect;
export type NewPresupuestoDetalle = typeof presupuestosDetalle.$inferInsert;
export type PresupuestoDetalleUpdate = Partial<NewPresupuestoDetalle>;
