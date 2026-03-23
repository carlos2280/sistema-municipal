import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { DbExecutor } from "../types/db";
import { seedSistemas } from "./identidad/seedSistemas";
import { seedMenusContabilidad } from "./identidad/seedMenusContabilidad";
import { seedMenusConfiguracion } from "./identidad/seedMenusConfiguracion";
import { seedMenusMesaAyuda } from "./identidad/seedMenusMesaAyuda";
import { seedTiposCuentas } from "./contabilidad/seedTiposCuentas";
import { seedSubgrupos } from "./contabilidad/seedSubgrupos";
import { seedPlanesCuentas } from "./contabilidad/seedPlanesCuentas";
import { seedCentrosCosto } from "./contabilidad/seedCentrosCosto";
import { seedSubprogramas } from "./contabilidad/seedSubprogramas";
import { seedCategorias } from "./transversal/seedCategorias";
import { seedPrioridades } from "./transversal/seedPrioridades";

/**
 * Seed de catalogos base del sistema.
 * SIEMPRE se ejecuta en todos los ambientes (dev, staging, production).
 * Todos los seeders incluidos son 100% idempotentes.
 *
 * @param tenantDb - Instancia Drizzle conectada a la DB del tenant
 * @param transversalDb - Instancia Drizzle conectada a la DB transversal (opcional)
 */
export async function seedBase(
  tenantDb: DbExecutor,
  transversalDb?: NodePgDatabase<Record<string, never>>,
): Promise<void> {
  process.stdout.write("\n--- Seed base: catalogos del sistema ---\n");

  // Identidad: sistemas y menus
  await seedSistemas(tenantDb);
  await seedMenusContabilidad(tenantDb);
  await seedMenusConfiguracion(tenantDb);
  await seedMenusMesaAyuda(tenantDb);

  // Contabilidad: catalogo contable
  await seedTiposCuentas(tenantDb);
  await seedSubgrupos(tenantDb);
  await seedPlanesCuentas(tenantDb);
  await seedCentrosCosto(tenantDb);
  await seedSubprogramas(tenantDb);

  // Transversal: catalogos globales de mesa_ayuda
  if (transversalDb) {
    await seedCategorias(transversalDb);
    await seedPrioridades(transversalDb);
  }

  process.stdout.write("--- Seed base completado ---\n");
}
