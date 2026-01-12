import { pgSchema } from "drizzle-orm/pg-core";
import { loadEnv } from "./env";

const { DB_SCHEMA_IDENTIDAD } = loadEnv();

export const customSchemaItentidad = pgSchema(DB_SCHEMA_IDENTIDAD);
