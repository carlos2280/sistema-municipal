import { sistemas } from "@municipal/db-identidad";
import type { DbExecutor } from "../../types/db";

/**
 * Catalogo base de sistemas del tenant.
 * Idempotente: onConflictDoNothing sobre codigo (campo unico).
 */
export async function seedSistemas(db: DbExecutor): Promise<void> {
  const datos = [
    { codigo: "contabilidad", nombre: "Sistema Contabilidad", icono: "calculator" },
    { codigo: "configuracion", nombre: "Sistema Configuración", icono: "settings-2" },
    { codigo: "mesa_ayuda", nombre: "Mesa de Ayuda", icono: "headphones" },
  ];

  process.stdout.write("  seedSistemas: insertando sistemas base...\n");
  await db
    .insert(sistemas)
    .values(datos)
    .onConflictDoNothing({ target: sistemas.codigo });
  process.stdout.write(`  seedSistemas: ${datos.length} registros (onConflictDoNothing)\n`);
}
