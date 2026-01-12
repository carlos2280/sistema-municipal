import { customSchemaItentidad } from "@/config/schemaPG";
import { boolean, integer, serial, text, timestamp } from "drizzle-orm/pg-core";
import { usuarios } from "./usuarios.schema";

export const tokensContrasenaTemporal = customSchemaItentidad.table(
  "tokens_contrasena_temporal",
  {
    id: serial("id").primaryKey(),
    token: text("token").notNull().unique(),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id, {
        onDelete: "cascade",
      }),
    usado: boolean("usado").default(false),
    expiraEn: timestamp("expira_en").notNull(),
    creadoEn: timestamp("creado_en").defaultNow(),
  },
);

// Tipos útiles
export type TokenContrasenaTemporal =
  typeof tokensContrasenaTemporal.$inferSelect;
export type NewTokenContrasenaTemporal =
  typeof tokensContrasenaTemporal.$inferInsert;
