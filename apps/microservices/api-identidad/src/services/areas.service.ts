import { db } from "@/app";
import { type Area, type AreaUpdate, type NewArea, areas } from "@/db/schemas";
import { eq } from "drizzle-orm";

export const createArea = async (data: NewArea): Promise<Area> => {
  try {
    const [createdArea] = await db.insert(areas).values(data).returning();
    return createdArea;
  } catch (error) {
    throw new Error(
      `Error al crear el área: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getAllAreas = async (): Promise<Area[]> => {
  try {
    return await db.select().from(areas);
  } catch (error) {
    throw new Error(
      `Error al obtener las áreas: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getAreaById = async (id: number): Promise<Area | undefined> => {
  try {
    const [area] = await db.select().from(areas).where(eq(areas.id, id));
    return area;
  } catch (error) {
    throw new Error(
      `Error al obtener el área: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const updateArea = async (
  id: number,
  data: AreaUpdate,
): Promise<Area | undefined> => {
  try {
    const [updatedArea] = await db
      .update(areas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(areas.id, id))
      .returning();
    return updatedArea;
  } catch (error) {
    throw new Error(
      `Error al actualizar el área: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const deleteArea = async (id: number): Promise<Area | null> => {
  try {
    const [deletedArea] = await db
      .delete(areas)
      .where(eq(areas.id, id))
      .returning();
    return deletedArea ?? null;
  } catch (error) {
    throw new Error(
      `Error al eliminar el área: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
