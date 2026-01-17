import { identidadSchema } from "../../schemas";
import { serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { direcciones } from "./direcciones.schema";
export const departamentos = identidadSchema.table("departamentos", {
    id: serial("id").primaryKey(),
    nombreDepartamento: text("nombre_departamento").notNull(),
    responsable: text("responsable").notNull(),
    idDireccion: integer("id_direccion").references(() => direcciones.id).notNull(),
});
export type Departamento = typeof departamentos.$inferSelect;
export type NewDepartamento = typeof departamentos.$inferInsert;