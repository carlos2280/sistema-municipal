import type { DbClient } from "@/db/client";
import { subprogramasPresupuestarios } from "@municipal/db-contabilidad";
import { eq } from "drizzle-orm";

export const listarSubprogramasActivos = async (db: DbClient) => {
  return db
    .select({
      id: subprogramasPresupuestarios.id,
      codigo: subprogramasPresupuestarios.codigo,
      nombre: subprogramasPresupuestarios.nombre,
      abreviatura: subprogramasPresupuestarios.abreviatura,
      color: subprogramasPresupuestarios.color,
      orden: subprogramasPresupuestarios.orden,
    })
    .from(subprogramasPresupuestarios)
    .where(eq(subprogramasPresupuestarios.activo, true))
    .orderBy(subprogramasPresupuestarios.orden);
};
