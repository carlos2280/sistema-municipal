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
  DB_SSL = "false",
  TENANT_DB_NAME = "muni_default",
} = process.env;

export default defineConfig({
  schema: [
    "./src/database/schemas.ts",
    "./src/database/identidad/schemas/*.schema.ts",
    "./src/database/contabilidad/schemas/*.schema.ts",
    "./src/database/mensajeria/schemas/*.schema.ts",
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
