import { pgSchema } from "drizzle-orm/pg-core";

// Schema fijo - ya no usamos variables de entorno para esto
export const customSchemaContabilidad = pgSchema("contabilidad");
