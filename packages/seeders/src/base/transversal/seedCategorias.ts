import { categorias } from "@municipal/db-mesa-ayuda";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

interface CategoriaData {
  codigo: string;
  nombre: string;
  icono: string;
  color: string;
  orden: number;
}

const CATEGORIAS: CategoriaData[] = [
  { codigo: "infraestructura", nombre: "Infraestructura y Obras",  icono: "hard-hat",       color: "warning",   orden: 1 },
  { codigo: "tramites",        nombre: "Tramites y Documentos",    icono: "file-text",       color: "info",      orden: 2 },
  { codigo: "reclamos",        nombre: "Reclamos Ciudadanos",      icono: "alert-triangle",  color: "error",     orden: 3 },
  { codigo: "consultas",       nombre: "Consultas Generales",      icono: "help-circle",     color: "primary",   orden: 4 },
  { codigo: "servicios",       nombre: "Servicios Municipales",    icono: "building-2",      color: "secondary", orden: 5 },
  { codigo: "medioambiente",   nombre: "Medio Ambiente y Aseo",    icono: "leaf",            color: "success",   orden: 6 },
  { codigo: "seguridad",       nombre: "Seguridad Ciudadana",      icono: "shield",          color: "error",     orden: 7 },
  { codigo: "social",          nombre: "Asistencia Social",        icono: "heart",           color: "secondary", orden: 8 },
];

/**
 * Catalogo global de categorias de mesa_ayuda en la DB transversal.
 * Idempotente: onConflictDoNothing sobre codigo (campo unico).
 */
export async function seedCategorias(
  db: NodePgDatabase<Record<string, never>>,
): Promise<void> {
  await db
    .insert(categorias)
    .values(
      CATEGORIAS.map((c) => ({
        codigo: c.codigo,
        nombre: c.nombre,
        icono: c.icono,
        color: c.color,
        orden: c.orden,
        activo: true,
      })),
    )
    .onConflictDoNothing({ target: categorias.codigo });

  process.stdout.write(
    `  seedCategorias: ${CATEGORIAS.length} registros (onConflictDoNothing)\n`,
  );
}
