import { db } from "@/app";
import { cuentasSubgrupos } from "@/db/schemas";
import { eq } from "drizzle-orm";

export const crearCuentasSubgrupo = async (data: {
  codigo: string;
  nombre: string;
  tipoCuentaId: number;
  parentId?: number;
}) => {
  const [inserted] = await db.insert(cuentasSubgrupos).values(data).returning();
  return inserted;
};

export const obtenerCuentasSubgrupos = async () => {
  return await db
    .select()
    .from(cuentasSubgrupos)
    .orderBy(cuentasSubgrupos.codigo);
};

export const obtenerCuentasSubgrupoPorId = async (id: number) => {
  const [row] = await db
    .select()
    .from(cuentasSubgrupos)
    .where(eq(cuentasSubgrupos.id, id));
  return row ?? null;
};

export const actualizarCuentasSubgrupo = async (
  id: number,
  updates: Partial<{
    codigo: string;
    nombre: string;
    tipoCuentaId: number;
    parentId?: number;
  }>,
) => {
  const [row] = await db
    .update(cuentasSubgrupos)
    .set(updates)
    .where(eq(cuentasSubgrupos.id, id))
    .returning();
  return row ?? null;
};

export const eliminarCuentasSubgrupo = async (id: number) => {
  await db.delete(cuentasSubgrupos).where(eq(cuentasSubgrupos.id, id));
};

export const obtenerArbolSubgrupos = async () => {
  const items = await obtenerCuentasSubgrupos();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const map = new Map<number, any>();

  // Inicializar nodos con array de hijos
  for (const item of items) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    map.set(item.id, { ...item, hijos: [] as any[] });
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const roots: any[] = [];

  // Enlazar hijos
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)?.hijos.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};
