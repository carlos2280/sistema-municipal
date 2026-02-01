import { identidadSchema } from "../../schemas";
import { index, integer, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { perfiles } from "./perfiles.schema";
import { sistemas } from "./sistemas.schema";

export const sistemaPerfil = identidadSchema.table(
    "sistema_perfil",
    {
        id: serial("id").primaryKey(),
        sistemaId: integer("sistema_id")
            .notNull()
            .references(() => sistemas.id),
        perfilId: integer("perfil_id")
            .notNull()
            .references(() => perfiles.id),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
    },
    (table) => ({
        // Índice compuesto para consultas de acceso
        sistemaPerfilIdx: index("idx_sistema_perfil").on(table.sistemaId, table.perfilId),
        // Constraint único para evitar duplicados
        unq: unique("uq_sistema_perfil").on(table.sistemaId, table.perfilId),
    }),
);

// Tipos
export type SistemaPerfil = typeof sistemaPerfil.$inferSelect;
export type NewSistemaPerfil = typeof sistemaPerfil.$inferInsert;
export type SistemaPerfilUpdate = Partial<NewSistemaPerfil>;