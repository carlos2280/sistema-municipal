import type { DbExecutor } from "../types/db";

/**
 * Seed de datos realistas para demos.
 * Placeholder — a implementar cuando se requiera ambiente demo.
 */
export async function seedDemo(tenantDb: DbExecutor): Promise<void> {
  process.stdout.write("\n--- Seed demo: datos realistas (placeholder) ---\n");
  // TODO: implementar datos de demo realistas
  void tenantDb;
  process.stdout.write("--- Seed demo completado ---\n");
}
