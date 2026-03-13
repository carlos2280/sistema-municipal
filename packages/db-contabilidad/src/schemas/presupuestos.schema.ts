import { contabilidadSchema } from "../schemas";
import { integer, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export const presupuestos = contabilidadSchema.table(
  "presupuestos",
  {
    id: serial("id").primaryKey(),
    anoContable: integer("ano_contable").notNull(),
    numero: integer("numero").notNull(),
    glosa: text("glosa").notNull(),
    actaDecreto: text("acta_decreto"),
    // No FK cross-schema a identidad.usuarios — se usa integer simple
    usuarioCreacion: integer("usuario_creacion").notNull(),
    usuarioModificacion: integer("usuario_modificacion"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uqAnoContable: unique("uq_presupuesto_ano").on(table.anoContable),
  }),
);

export type Presupuesto = typeof presupuestos.$inferSelect;
export type NewPresupuesto = typeof presupuestos.$inferInsert;
export type PresupuestoUpdate = Partial<NewPresupuesto>;
