import { areas } from "@municipalidad/shared/database/identidad/schemas/areas.schema";
import { perfilAreaUsuario } from "@municipalidad/shared/database/identidad/schemas/perfilAreaUsuario.schema";
import { relations } from "drizzle-orm";

export const areasRelations = relations(areas, ({ many }) => ({
  perfiles: many(perfilAreaUsuario),
}));
