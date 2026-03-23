import { prioridades } from "@municipal/db-mesa-ayuda";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

interface PrioridadData {
  codigo: string;
  nombre: string;
  color: string;
  nivel: number;
  slaHoras: number;
}

const PRIORIDADES: PrioridadData[] = [
  { codigo: "baja",    nombre: "Baja",    color: "#34D399", nivel: 1, slaHoras: 72 },
  { codigo: "media",   nombre: "Media",   color: "#60A5FA", nivel: 2, slaHoras: 48 },
  { codigo: "alta",    nombre: "Alta",    color: "#FBBF24", nivel: 3, slaHoras: 24 },
  { codigo: "critica", nombre: "Critica", color: "#F87171", nivel: 4, slaHoras: 8  },
];

/**
 * Catalogo global de prioridades de mesa_ayuda en la DB transversal.
 * Idempotente: onConflictDoNothing sobre codigo (campo unico).
 *
 * NOTA: los colores son hardcoded porque no hay equivalente en el theme del backend.
 */
export async function seedPrioridades(
  db: NodePgDatabase<Record<string, never>>,
): Promise<void> {
  await db
    .insert(prioridades)
    .values(
      PRIORIDADES.map((p) => ({
        codigo: p.codigo,
        nombre: p.nombre,
        color: p.color,
        nivel: p.nivel,
        slaHoras: p.slaHoras,
      })),
    )
    .onConflictDoNothing({ target: prioridades.codigo });

  process.stdout.write(
    `  seedPrioridades: ${PRIORIDADES.length} registros (onConflictDoNothing)\n`,
  );
}
