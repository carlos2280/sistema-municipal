import { db } from "@/app";
import {
  type NewPerfil,
  type Perfil,
  type PerfilUpdate,
  perfiles,
} from "@/db/schemas";
import { eq } from "drizzle-orm";

export const createPerfil = async (data: NewPerfil): Promise<Perfil> => {
  try {
    const [createdPerfil] = await db.insert(perfiles).values(data).returning();
    return createdPerfil;
  } catch (error) {
    throw new Error(
      `Error al crear el perfil: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getAllPerfiles = async (): Promise<Perfil[]> => {
  try {
    return await db.select().from(perfiles);
  } catch (error) {
    throw new Error(
      `Error al obtener los perfiles: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getPerfilById = async (
  id: number,
): Promise<Perfil | undefined> => {
  try {
    const [perfil] = await db
      .select()
      .from(perfiles)
      .where(eq(perfiles.id, id));
    return perfil;
  } catch (error) {
    throw new Error(
      `Error al obtener el perfil: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const updatePerfil = async (
  id: number,
  data: PerfilUpdate,
): Promise<Perfil | undefined> => {
  try {
    const [updatedPerfil] = await db
      .update(perfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(perfiles.id, id))
      .returning();
    return updatedPerfil;
  } catch (error) {
    throw new Error(
      `Error al actualizar el perfil: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const deletePerfil = async (id: number): Promise<Perfil | null> => {
  try {
    const [deletedPerfil] = await db
      .delete(perfiles)
      .where(eq(perfiles.id, id))
      .returning();
    return deletedPerfil ?? null;
  } catch (error) {
    throw new Error(
      `Error al eliminar el perfil: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
