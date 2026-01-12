import { pgSchema } from "drizzle-orm/pg-core";
import { loadEnv } from "./env";

const { DB_SCHEMA_CONTABILIDAD } = loadEnv();

export const customSchemaContabilidad = pgSchema(DB_SCHEMA_CONTABILIDAD);
