import { defineConfig } from "drizzle-kit";
import type { Config } from "drizzle-kit";
import { loadEnv } from "./src/config/env";
// Cargar y validar variables de entorno
const env = loadEnv();
export default defineConfig({
  schema: "./src/database",
  out: "./drizzle",
  dialect: "postgresql",

  migrations: {
    prefix: "timestamp",
    table: "__drizzle_migrations__",
    schema: "public",
  },

  dbCredentials: {
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    ssl: env.DB_SSL,
  },
} satisfies Config);
