import { centrosCosto } from "@municipal/db-contabilidad";
import type { DbExecutor } from "../../types/db";

const CENTROS_INICIALES = [
  { codigo: "ALC",    nombre: "Alcaldía / Gabinete" },
  { codigo: "SECMU",  nombre: "Secretaría Municipal" },
  { codigo: "SECPLA", nombre: "Secretaría Comunal de Planificación" },
  { codigo: "DAF",    nombre: "Dirección de Administración y Finanzas" },
  { codigo: "DIDECO", nombre: "Dirección de Desarrollo Comunitario" },
  { codigo: "DOM",    nombre: "Dirección de Obras Municipales" },
  { codigo: "DASE",   nombre: "Dirección de Aseo y Ornato" },
  { codigo: "DTT",    nombre: "Dirección de Tránsito y Transporte" },
  { codigo: "AJ",     nombre: "Asesoría Jurídica" },
  { codigo: "CTRL",   nombre: "Dirección de Control" },
  { codigo: "CONC",   nombre: "Concejo Municipal" },
  { codigo: "DSEG",   nombre: "Dirección de Seguridad Pública" },
] as const;

/**
 * Catalogo base de centros de costo municipales.
 * Idempotente: onConflictDoNothing sobre codigo (campo unico).
 */
export async function seedCentrosCosto(db: DbExecutor): Promise<void> {
  process.stdout.write("  seedCentrosCosto: insertando centros de costo...\n");

  await db
    .insert(centrosCosto)
    .values(CENTROS_INICIALES.map((c) => ({ ...c, activo: true })))
    .onConflictDoNothing({ target: centrosCosto.codigo });

  process.stdout.write(`  seedCentrosCosto: ${CENTROS_INICIALES.length} registros (onConflictDoNothing)\n`);
}
