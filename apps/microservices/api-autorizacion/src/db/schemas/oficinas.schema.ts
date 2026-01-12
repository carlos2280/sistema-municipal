import { customSchemaItentidad } from "@/config/schemaPG";
import { integer, serial, text } from "drizzle-orm/pg-core";
import { departamentos } from "./departamentos.schema";

export const oficinas = customSchemaItentidad.table("oficinas", {
  id: serial("id").primaryKey(),
  nombreOficina: text("nombre_oficina").notNull(),
  responsable: text("responsable").notNull(),
  idDepartamento: integer("id_departamento")
    .references(() => departamentos.id)
    .notNull(),
});

export type Oficina = typeof oficinas.$inferSelect;
export type NewOficina = typeof oficinas.$inferInsert;
