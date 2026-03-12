import { customSchemaContabilidad } from "@/config/schemaPG";
import { integer, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export const presupuestos = customSchemaContabilidad.table(
  "presupuestos",
  {
    id: serial("id").primaryKey(),
    anoContable: integer("ano_contable").notNull(),
    numero: integer("numero").notNull(),
    glosa: text("glosa").notNull(),
    actaDecreto: text("acta_decreto"),
    usuarioCreacion: integer("usuario_creacion").notNull(),
    usuarioModificacion: integer("usuario_modificacion"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uqAnoContable: unique("uq_presupuesto_ano").on(table.anoContable),
  }),
);

export type Presupuesto = typeof presupuestos.$inferSelect;
export type NewPresupuesto = typeof presupuestos.$inferInsert;
export type PresupuestoUpdate = Partial<NewPresupuesto>;
