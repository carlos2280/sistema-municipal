/**
 * Runner de migraciones Drizzle para muni_default.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { buildConnectionString, runMigrations } from "./lib/runMigrations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(__dirname, "../.env") });

await runMigrations({
  connectionString: buildConnectionString("muni_default", "DB_NAME"),
  migrationsFolder: path.resolve(__dirname, "../drizzle"),
  schemas: ["identidad", "contabilidad"],
  label: "muni_default",
});
