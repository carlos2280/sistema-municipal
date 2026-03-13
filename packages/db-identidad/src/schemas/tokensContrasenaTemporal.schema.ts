import { identidadSchema } from "../schemas";
import {
    serial,
    text,
    integer,
    timestamp,
    boolean,
} from "drizzle-orm/pg-core";
import { usuarios } from "./usuarios.schema";

export const tokensContrasenaTemporal = identidadSchema.table("tokens_contrasena_temporal", {
    id: serial("id").primaryKey(),
    token: text("token").notNull().unique(),
    usuarioId: integer("usuario_id").notNull().references(() => usuarios.id, {
        onDelete: "cascade",
    }),
    usado: boolean("usado").default(false),
    expiraEn: timestamp("expira_en", { withTimezone: true }).notNull(),
    creadoEn: timestamp("creado_en", { withTimezone: true }).defaultNow(),
});

// Tipos útiles
export type TokenContrasenaTemporal = typeof tokensContrasenaTemporal.$inferSelect;
export type NewTokenContrasenaTemporal = typeof tokensContrasenaTemporal.$inferInsert;
