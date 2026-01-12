import { customSchemaContabilidad } from "@/config/schemaPG";
import {
  type AnyPgColumn,
  integer,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { tiposCuentas } from "./tiposCuentas.schema";

export const cuentasSubgrupos = customSchemaContabilidad.table(
  "cuentas_subgrupos",
  {
    id: serial("id").primaryKey(),
    codigo: text("codigo").notNull(),
    nombre: text("nombre").notNull(),
    tipoCuentaId: integer("tipo_cuenta_id")
      .notNull()
      .references((): AnyPgColumn => tiposCuentas.id),
    parentId: integer("parent_id").references(
      (): AnyPgColumn => cuentasSubgrupos.id,
    ),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
);

export type CuentasSubgrupos = typeof cuentasSubgrupos.$inferSelect;
export type NewCuentasSubgrupos = typeof cuentasSubgrupos.$inferInsert;
export type CuentasSubgrupoUpdates = Partial<NewCuentasSubgrupos>;
