import { relations } from "drizzle-orm";
import { areas } from "../schemas/areas.schema";
import { perfilAreaUsuario } from "../schemas/perfilAreaUsuario.schema";

export const areasRelations = relations(areas, ({ many }) => ({
  perfiles: many(perfilAreaUsuario),
}));
