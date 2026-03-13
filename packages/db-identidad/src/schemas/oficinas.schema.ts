import { identidadSchema } from "../schemas";
import { index, integer, serial, text } from "drizzle-orm/pg-core";
import { departamentos } from "./departamentos.schema";

export const oficinas = identidadSchema.table("oficinas", {
    id: serial("id").primaryKey(),
    nombreOficina: text("nombre_oficina").notNull(),
    responsable: text("responsable").notNull(),
    idDepartamento: integer("id_departamento").references(() => departamentos.id).notNull(),
}, (table) => ({
    deptoIdx: index("idx_oficinas_depto").on(table.idDepartamento),
}));
export type Oficina = typeof oficinas.$inferSelect;
export type NewOficina = typeof oficinas.$inferInsert;
