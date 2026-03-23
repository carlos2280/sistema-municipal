import type { DbClient } from "@/db/client";
import { type NewCentrosCosto, centrosCosto } from "@municipal/db-contabilidad";
import { and, eq, isNull } from "drizzle-orm";

export const obtenerCentrosCosto = async (db: DbClient, soloActivos = true) => {
  if (soloActivos) {
    return db
      .select()
      .from(centrosCosto)
      .where(and(eq(centrosCosto.activo, true), isNull(centrosCosto.deletedAt)))
      .orderBy(centrosCosto.codigo);
  }
  return db
    .select()
    .from(centrosCosto)
    .where(isNull(centrosCosto.deletedAt))
    .orderBy(centrosCosto.codigo);
};

export const obtenerCentroCostoPorId = async (db: DbClient, id: number) => {
  const [row] = await db
    .select()
    .from(centrosCosto)
    .where(and(eq(centrosCosto.id, id), isNull(centrosCosto.deletedAt)));
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

export const eliminarCentroCosto = async (
  db: DbClient,
  id: number,
  deletedBy?: number,
) => {
  // Soft delete: marcar como eliminado en vez de borrar físicamente
  // TODO: pasar deletedBy desde el controller cuando se implemente el contexto de usuario
  await db
    .update(centrosCosto)
    .set({ deletedAt: new Date(), deletedBy: deletedBy ?? null })
    .where(and(eq(centrosCosto.id, id), isNull(centrosCosto.deletedAt)));
};
