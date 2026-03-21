import {
  boolean,
  integer,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { mesaAyudaSchema } from "../schemas";

export const categorias = mesaAyudaSchema.table("categorias", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  icono: text("icono").notNull().default("tag"),
  color: text("color").notNull().default("primary"),
  orden: integer("orden").notNull().default(0),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Categoria = typeof categorias.$inferSelect;
export type NewCategoria = typeof categorias.$inferInsert;
export type CategoriaUpdate = Partial<NewCategoria>;
