import { db } from "@/app";
import { type Menu, type MenuUpdate, type NewMenu, menus } from "@/db/schemas";
import { eq } from "drizzle-orm";

export const createMenu = async (data: NewMenu): Promise<Menu> => {
  try {
    const [createdMenu] = await db.insert(menus).values(data).returning();
    return createdMenu;
  } catch (error) {
    throw new Error(
      `Error al crear el menú: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getAllMenus = async (): Promise<Menu[]> => {
  try {
    return await db.select().from(menus);
  } catch (error) {
    throw new Error(
      `Error al obtener los menús: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getMenuById = async (id: number): Promise<Menu | undefined> => {
  try {
    const [menu] = await db.select().from(menus).where(eq(menus.id, id));
    return menu;
  } catch (error) {
    throw new Error(
      `Error al obtener el menú: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const updateMenu = async (
  id: number,
  data: MenuUpdate,
): Promise<Menu | undefined> => {
  try {
    const [updatedMenu] = await db
      .update(menus)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(menus.id, id))
      .returning();
    return updatedMenu;
  } catch (error) {
    throw new Error(
      `Error al actualizar el menú: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const deleteMenu = async (id: number): Promise<Menu | null> => {
  try {
    const [deletedMenu] = await db
      .delete(menus)
      .where(eq(menus.id, id))
      .returning();
    return deletedMenu ?? null;
  } catch (error) {
    throw new Error(
      `Error al eliminar el menú: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

// Funciones adicionales específicas para menús
// Obtiene todos los menús asociados a un sistema específico
export const getMenusBySistema = async (sistemaId: number): Promise<Menu[]> => {
  try {
    return await db.select().from(menus).where(eq(menus.idSistema, sistemaId));
  } catch (error) {
    throw new Error(
      `Error al obtener los menús del sistema: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

// Obtiene todos los submenús (menús hijos) de un menú padre
export const getSubmenus = async (idPadre: number): Promise<Menu[]> => {
  try {
    return await db.select().from(menus).where(eq(menus.idPadre, idPadre));
  } catch (error) {
    throw new Error(
      `Error al obtener los submenús: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
