import { contabilidadSchema } from "../../schemas";
import { serial, text, timestamp } from "drizzle-orm/pg-core";

export const tiposCuentas = contabilidadSchema.table("tipos_cuentas", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull(),
  nombre: text("nombre").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos
export type TiposCuentas = typeof tiposCuentas.$inferSelect;
export type NewTiposCuentas = typeof tiposCuentas.$inferInsert;
export type TiposCuentasUpdate = Partial<TiposCuentas>;
