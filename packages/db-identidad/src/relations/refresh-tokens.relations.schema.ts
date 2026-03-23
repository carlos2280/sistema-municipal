import { relations } from "drizzle-orm";
import { refreshTokens } from "../schemas/refresh-tokens.schema";
import { usuarios } from "../schemas/usuarios.schema";

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [refreshTokens.usuarioId],
    references: [usuarios.id],
  }),
}));
