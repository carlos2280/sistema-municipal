import type { DbClient } from "@/db/client";
import { centrosCosto, type NewCentrosCosto } from "@municipal/db-contabilidad";
import { eq } from "drizzle-orm";

export const obtenerCentrosCosto = async (db: DbClient, soloActivos = true) => {
  const query = db.select().from(centrosCosto);
  if (soloActivos) {
    return query.where(eq(centrosCosto.activo, true)).orderBy(centrosCosto.codigo);
  }
  return query.orderBy(centrosCosto.codigo);
};

export const obtenerCentroCostoPorId = async (db: DbClient, id: number) => {
  const [row] = await db
    .select()
    .from(centrosCosto)
    .where(eq(centrosCosto.id, id));
  return row ?? null;
};

export const crearCentroCosto = async (db: DbClient, data: NewCentrosCosto) => {
  const [inserted] = await db.insert(centrosCosto).values(data).returning();
  return inserted;
};

export const actualizarCentroCosto = async (
  db: DbClient,
  id: number,
  updates: Partial<{ codigo: string; nombre: string; activo: boolean }>,
) => {
  const [row] = await db
    .update(centrosCosto)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(centrosCosto.id, id))
    .returning();
  return row ?? null;
};

export const eliminarCentroCosto = async (db: DbClient, id: number) => {
  await db.delete(centrosCosto).where(eq(centrosCosto.id, id));
};
