import { db } from "@/app";
import { type NewPlanesCuentas, planesCuentas } from "@/db/schemas";
import { eq } from "drizzle-orm";
import * as csService from "./cuentasSubgrupos.service";

export const crearPlanesCuenta = async (data: NewPlanesCuentas) => {
  const [inserted] = await db.insert(planesCuentas).values(data).returning();
  return inserted;
};

export const obtenerPlanesCuentas = async () => {
  return await db.select().from(planesCuentas).orderBy(planesCuentas.codigo);
};

export const obtenerPlanesCuentaPorId = async (id: number) => {
  const [row] = await db
    .select()
    .from(planesCuentas)
    .where(eq(planesCuentas.id, id));
  return row ?? null;
};

export const actualizarPlanesCuenta = async (
  id: number,
  updates: Partial<{
    anoContable: number;
    codigo: string;
    nombre: string;
    subgrupoId: number;
    parentId?: number;
    codigoIni?: string;
  }>,
) => {
  const [row] = await db
    .update(planesCuentas)
    .set(updates)
    .where(eq(planesCuentas.id, id))
    .returning();
  return row ?? null;
};

export const eliminarPlanesCuenta = async (id: number) => {
  await db.delete(planesCuentas).where(eq(planesCuentas.id, id));
};

export const obtenerArbolPlanes = async () => {
  const items = await obtenerPlanesCuentas();
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

export const obtenerArbolCompleto = async () => {
  // 1. Obtener árbol de subgrupos
  const subgrTree = await csService.obtenerArbolSubgrupos();

  // 2. Obtener todas las cuentas y mapear
  const planes = await obtenerPlanesCuentas();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const planeMap = new Map<number, any>();
  for (const p of planes) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    planeMap.set(p.id, { ...p, hijos: [] as any[] });
  }

  // 3. Construir jerarquía interna de cuentas
  for (const node of planeMap.values()) {
    if (node.parentId && planeMap.has(node.parentId)) {
      planeMap.get(node.parentId)?.hijos.push(node);
    }
  }

  // 4. Asociar cuentas raíz a cada subgrupo en el árbol
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const attach = (subgr: any) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    subgr.cuentas = [] as any[];
    for (const node of planeMap.values()) {
      if (!node.parentId && node.subgrupoId === subgr.id) {
        subgr.cuentas.push(node);
      }
    }
    for (const child of subgr.hijos) {
      attach(child);
    }
  };

  for (const root of subgrTree) {
    attach(root);
  }

  return subgrTree;
};
