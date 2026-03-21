import type { DbExecutor } from "../types/db";
import { subprogramasPresupuestarios } from "@municipal/db-contabilidad";

const SUBPROGRAMAS = [
  { codigo: "GESTION", nombre: "Gestión", abreviatura: "GEST", color: "primary", orden: 1 },
  { codigo: "SERV_COM", nombre: "Servicios Comunitarios", abreviatura: "SERV", color: "info", orden: 2 },
  { codigo: "ACT_MUN", nombre: "Actividades Municipales", abreviatura: "ACT", color: "secondary", orden: 3 },
  { codigo: "PROG_SOC", nombre: "Programas Sociales", abreviatura: "SOC", color: "warning", orden: 4 },
  { codigo: "PROG_DEP", nombre: "Programas Deportivos", abreviatura: "DEP", color: "success", orden: 5 },
  { codigo: "PROG_CUL", nombre: "Programas Culturales", abreviatura: "CUL", color: "error", orden: 6 },
  { codigo: "SIN_ASIG", nombre: "Sin Asignar", abreviatura: "S/A", color: "default", orden: 99 },
] as const;

export async function seedSubprogramas(db: DbExecutor) {
  console.log("🌱 Insertando subprogramas presupuestarios...");

  await db.delete(subprogramasPresupuestarios);

  await db.insert(subprogramasPresupuestarios).values(
    SUBPROGRAMAS.map((s) => ({ ...s, activo: true })),
  );

  console.log(`✅ ${SUBPROGRAMAS.length} subprogramas insertados`);
}
