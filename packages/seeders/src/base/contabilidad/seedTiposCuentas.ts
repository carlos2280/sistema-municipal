import { sql } from "drizzle-orm";
import { tiposCuentas } from "@municipal/db-contabilidad";
import type { DbExecutor } from "../../types/db";

/**
 * Catalogo de tipos de cuenta (8 tipos fijos con IDs 1-8).
 * Idempotente: onConflictDoNothing sobre id (PK).
 *
 * IMPORTANTE: este seeder ya no hace DELETE — es seguro correr en cualquier ambiente.
 * La secuencia se ajusta solo si la tabla estaba vacia (primera ejecucion).
 */
export async function seedTiposCuentas(db: DbExecutor): Promise<void> {
  const datos = [
    { id: 1, codigo: "CT",  nombre: "Cuenta titulo" },
    { id: 2, codigo: "CG",  nombre: "Cuenta grupo" },
    { id: 3, codigo: "CN1", nombre: "Nivel 1 (Subgrupo)" },
    { id: 4, codigo: "CN2", nombre: "Nivel 2" },
    { id: 5, codigo: "CN3", nombre: "Nivel 3" },
    { id: 6, codigo: "CN4", nombre: "Nivel 4" },
    { id: 7, codigo: "CN5", nombre: "Nivel 5" },
    { id: 8, codigo: "CN6", nombre: "Nivel 6" },
  ];

  process.stdout.write("  seedTiposCuentas: insertando tipos de cuenta...\n");

  await db.insert(tiposCuentas).values(datos).onConflictDoNothing();

  // Ajustar la secuencia para que el proximo ID sea >= 9
  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('contabilidad.tipos_cuentas', 'id'), GREATEST(8, (SELECT MAX(id) FROM contabilidad.tipos_cuentas)))`,
  );

  process.stdout.write(`  seedTiposCuentas: ${datos.length} registros (onConflictDoNothing)\n`);
}
