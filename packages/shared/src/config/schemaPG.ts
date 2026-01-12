import { loadEnv } from "@municipalidad/shared/config/env";
import { pgSchema } from "drizzle-orm/pg-core";

const { DB_SCHEMA_IDENTIDAD, DB_SCHEMA_CONTABILIDAD } = loadEnv();
export const customSchemaItentidad = pgSchema(DB_SCHEMA_IDENTIDAD);
export const customSchemaContabilidad = pgSchema(DB_SCHEMA_CONTABILIDAD);