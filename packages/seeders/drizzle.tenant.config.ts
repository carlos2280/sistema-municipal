import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, ".env") });

const {
  DB_USER = "postgres",
  DB_PASSWORD = "postgres",
  DB_HOST = "localhost",
  DB_PORT = "5432",
  TENANT_DB_NAME = "muni_default",
  DB_SSL = "false",
} = process.env;

export default defineConfig({
  schema: [
    "../db-identidad/src/schemas.ts",
    "../db-identidad/src/schemas/*.schema.ts",
    "../db-contabilidad/src/schemas.ts",
    "../db-contabilidad/src/schemas/*.schema.ts",
    "../db-mensajeria/src/schemas.ts",
    "../db-mensajeria/src/schemas/*.schema.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  migrations: {
    prefix: "timestamp",
    table: "__drizzle_migrations__",
    schema: "public",
  },
  dbCredentials: {
    url: `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${TENANT_DB_NAME}${DB_SSL === "true" ? "?sslmode=require" : ""}`,
  },
});
