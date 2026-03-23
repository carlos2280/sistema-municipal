import { identidadSchema } from "../schemas";
import {
  boolean,
  integer,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { usuarios } from "./usuarios.schema";

export const refreshTokens = identidadSchema.table("refresh_tokens", {
  id: serial("id").primaryKey(),
  jti: text("jti").unique().notNull(),
  usuarioId: integer("usuario_id")
    .references(() => usuarios.id, { onDelete: "cascade" })
    .notNull(),
  revocado: boolean("revocado").default(false).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  creadoEn: timestamp("creado_en", { withTimezone: true }).defaultNow().notNull(),
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
