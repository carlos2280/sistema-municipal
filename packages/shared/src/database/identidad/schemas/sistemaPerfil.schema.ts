import { identidadSchema } from "../../schemas";
import { integer, serial, timestamp } from "drizzle-orm/pg-core";
import { perfiles } from "./perfiles.schema";
import { sistemas } from "./sistemas.schema";

export const sistemaPerfil = identidadSchema.table("sistema_perfil", {
    id: serial("id").primaryKey(),
    sistemaId: integer("sistema_id").references(() => sistemas.id),
    perfilId: integer("perfil_id").references(() => perfiles.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos
export type SistemaPerfil = typeof sistemaPerfil.$inferSelect;
export type NewSistemaPerfil = typeof sistemaPerfil.$inferInsert;
export type SistemaPerfilUpdate = Partial<NewSistemaPerfil>;