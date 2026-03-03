import type { DbClient } from "@/db/client";
import {
  type NewSistema,
  type Sistema,
  type SistemaUpdate,
  sistemas,
} from "@/db/schemas";
import { eq } from "drizzle-orm";

export const createSistema = async (db: DbClient, data: NewSistema): Promise<Sistema> => {
  try {
    const [createdSistema] = await db.insert(sistemas).values(data).returning();
    return createdSistema;
  } catch (error) {
    throw new Error(
      `Error al crear el sistema: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getAllSistemas = async (db: DbClient): Promise<Sistema[]> => {
  try {
    return await db.select().from(sistemas);
  } catch (error) {
    throw new Error(
      `Error al obtener los sistemas: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getSistemaById = async (
  db: DbClient,
  id: number,
): Promise<Sistema | undefined> => {
  try {
    const [sistema] = await db
      .select()
      .from(sistemas)
      .where(eq(sistemas.id, id));
    return sistema;
  } catch (error) {
    throw new Error(
      `Error al obtener el sistema: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const updateSistema = async (
  db: DbClient,
  id: number,
  data: SistemaUpdate,
): Promise<Sistema | undefined> => {
  try {
    const [updatedSistema] = await db
      .update(sistemas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sistemas.id, id))
      .returning();
    return updatedSistema;
  } catch (error) {
    throw new Error(
      `Error al actualizar el sistema: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const deleteSistema = async (db: DbClient, id: number): Promise<Sistema | null> => {
  try {
    const [deletedSistema] = await db
      .delete(sistemas)
      .where(eq(sistemas.id, id))
      .returning();
    return deletedSistema ?? null;
  } catch (error) {
    throw new Error(
      `Error al eliminar el sistema: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
