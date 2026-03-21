import type { DbClient } from "@/db/client";
import { AppError } from "@/libs/middleware/AppError";
import type {
  ActualizarCategoriaInput,
  CrearCategoriaInput,
} from "@/libs/schemas/categorias.schemas";
import { categorias } from "@municipal/db-mesa-ayuda";
import { eq } from "drizzle-orm";

export async function listarCategorias(db: DbClient) {
  return db
    .select()
    .from(categorias)
    .where(eq(categorias.activo, true))
    .orderBy(categorias.orden);
}

export async function crearCategoria(
  db: DbClient,
  input: CrearCategoriaInput,
) {
  const [categoria] = await db
    .insert(categorias)
    .values(input)
    .returning();

  return categoria;
}

export async function actualizarCategoria(
  db: DbClient,
  id: number,
  input: ActualizarCategoriaInput,
) {
  const [existing] = await db
    .select({ id: categorias.id })
    .from(categorias)
    .where(eq(categorias.id, id));

  if (!existing) {
    throw new AppError("Categoria no encontrada", 404);
  }

  const [updated] = await db
    .update(categorias)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(categorias.id, id))
    .returning();

  return updated;
}

export async function desactivarCategoria(db: DbClient, id: number) {
  const [existing] = await db
    .select({ id: categorias.id })
    .from(categorias)
    .where(eq(categorias.id, id));

  if (!existing) {
    throw new AppError("Categoria no encontrada", 404);
  }

  await db
    .update(categorias)
    .set({ activo: false, updatedAt: new Date() })
    .where(eq(categorias.id, id));
}
