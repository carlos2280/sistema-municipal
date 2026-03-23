import type { DbExecutor } from "../types/db";

export { seedAdminUser } from "./seedAdminUser";

/**
 * Seed de configuracion de produccion.
 * Solo se ejecuta en el ambiente production.
 *
 * No incluye datos mock ni catalogos (esos van en base/).
 * El usuario admin se crea via seedNewTenant() que llama a seedAdminUser directamente.
 */
export async function seedProduction(tenantDb: DbExecutor): Promise<void> {
  process.stdout.write("\n--- Seed production ---\n");
  // La creacion del admin se gestiona via seedNewTenant()
  void tenantDb;
  process.stdout.write("--- Seed production completado ---\n");
}
