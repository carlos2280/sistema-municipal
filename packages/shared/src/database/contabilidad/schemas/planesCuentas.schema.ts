import { contabilidadSchema } from "../../schemas";
import {
  type AnyPgColumn,
  index,
  integer,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { cuentasSubgrupos } from "./cuentasSubgrupos.schema";
import { tiposCuentas } from "./tiposCuentas.schema";

export const planesCuentas = contabilidadSchema.table(
  "planes_cuentas",
  {
    id: serial("id").primaryKey(),
    anoContable: integer("ano_contable").notNull(),
    codigo: text("codigo").notNull(),
    contraCuenta: text("contracuenta"),
    nombre: text("nombre").notNull(),
    tipoCuentaId: integer("tipo_cuenta_id")
      .notNull()
      .references((): AnyPgColumn => tiposCuentas.id),
    subgrupoId: integer("subgrupo_id")
      .notNull()
      .references((): AnyPgColumn => cuentasSubgrupos.id),
    parentId: integer("parent_id").references(
      (): AnyPgColumn => planesCuentas.id,
    ),
    codigoIni: text("codigo_ini"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Índice único: código de cuenta es único por año contable
    codigoAnoIdx: unique("uq_cuenta_ano_codigo").on(
      table.anoContable,
      table.codigo,
    ),
    // Índice para búsquedas por código
    codigoIdx: index("idx_planes_codigo").on(table.codigo),
    // Índice para filtros por año
    anoIdx: index("idx_planes_ano").on(table.anoContable),
    // Índice para FK tipo_cuenta
    tipoCuentaIdx: index("idx_planes_tipo_cuenta").on(table.tipoCuentaId),
  }),
);

export type PlanesCuentas = typeof planesCuentas.$inferSelect;
export type NewPlanesCuentas = typeof planesCuentas.$inferInsert;
export type PlanesCuentasUpdates = Partial<NewPlanesCuentas>;