/**
 * Runner de migraciones Drizzle para la DB platform.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { buildConnectionString, runMigrations } from "./lib/runMigrations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(__dirname, "../.env") });

await runMigrations({
  connectionString: buildConnectionString("platform", "PLATFORM_DB_NAME"),
  migrationsFolder: path.resolve(__dirname, "../drizzle/platform"),
  label: "platform",
});
