import type { DbExecutor } from "../types/db";
import { centrosCosto } from "@municipal/db-contabilidad";

const CENTROS_INICIALES = [
  { codigo: "ALC", nombre: "Alcaldía / Gabinete" },
  { codigo: "SECMU", nombre: "Secretaría Municipal" },
  { codigo: "SECPLA", nombre: "Secretaría Comunal de Planificación" },
  { codigo: "DAF", nombre: "Dirección de Administración y Finanzas" },
  { codigo: "DIDECO", nombre: "Dirección de Desarrollo Comunitario" },
  { codigo: "DOM", nombre: "Dirección de Obras Municipales" },
  { codigo: "DASE", nombre: "Dirección de Aseo y Ornato" },
  { codigo: "DTT", nombre: "Dirección de Tránsito y Transporte" },
  { codigo: "AJ", nombre: "Asesoría Jurídica" },
  { codigo: "CTRL", nombre: "Dirección de Control" },
  { codigo: "CONC", nombre: "Concejo Municipal" },
  { codigo: "DSEG", nombre: "Dirección de Seguridad Pública" },
] as const;

export async function seedCentrosCosto(db: DbExecutor) {
  console.log("🌱 Insertando centros de costo...");

  await db.delete(centrosCosto);

  await db.insert(centrosCosto).values(
    CENTROS_INICIALES.map((c) => ({ ...c, activo: true })),
  );

  console.log(`✅ ${CENTROS_INICIALES.length} centros de costo insertados`);
}
