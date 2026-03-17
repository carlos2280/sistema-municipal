import type { FilaDetalle } from "../types/presupuesto.types";

// ─── Tipos ──────────────────────────────────────────────────────────────────

/** Mapas de relación padre ↔ hijo construidos desde FilaDetalle[] */
export interface TreeMaps {
  /** clientId hijo → clientId padre */
  childToParent: Map<string, string>;
  /** clientId padre → clientId[] hijos directos */
  parentToChildren: Map<string, string[]>;
}

/** Info para mostrar en la confirmación de eliminación */
export interface DeleteInfo {
  /** IDs de todos los descendientes (sin incluir el nodo raíz) */
  descendantIds: string[];
  /** Cantidad de descendientes */
  count: number;
  /** clientId del padre del nodo a eliminar (si existe en el grid) */
  parentClientId: string | undefined;
}

// ─── Funciones Puras ────────────────────────────────────────────────────────

/**
 * Construye mapas de relación padre ↔ hijo a partir de FilaDetalle[].
 * Usa cuenta.parentId para resolver la jerarquía.
 *
 * Complejidad: O(n) donde n = cantidad de filas.
 */
export function buildTreeMaps(filas: FilaDetalle[]): TreeMaps {
  const cuentaIdToClientId = new Map<number, string>();
  for (const f of filas) {
    if (f.cuentaId) cuentaIdToClientId.set(f.cuentaId, f._clientId);
  }

  const childToParent = new Map<string, string>();
  const parentToChildren = new Map<string, string[]>();

  for (const f of filas) {
    if (!f.cuenta?.parentId) continue;
    const parentClientId = cuentaIdToClientId.get(f.cuenta.parentId);
    if (!parentClientId) continue;

    childToParent.set(f._clientId, parentClientId);
    const siblings = parentToChildren.get(parentClientId) ?? [];
    siblings.push(f._clientId);
    parentToChildren.set(parentClientId, siblings);
  }

  return { childToParent, parentToChildren };
}

/**
 * Obtiene todos los descendientes de un nodo (recursivo, DFS).
 * NO incluye el nodo raíz en el resultado.
 */
export function getDescendantIds(clientId: string, maps: TreeMaps): string[] {
  const result: string[] = [];
  const stack = [...(maps.parentToChildren.get(clientId) ?? [])];

  while (stack.length > 0) {
    const current = stack.pop()!;
    result.push(current);
    const children = maps.parentToChildren.get(current);
    if (children) stack.push(...children);
  }

  return result;
}

/**
 * Recalcula montos de todos los ancestros de `startId` bottom-up.
 * Cada padre = suma de sus hijos directos.
 *
 * Retorna un NUEVO array de filas con los montos actualizados y marcados isDirty.
 * No muta el array original.
 */
export function recalcAncestors(
  filas: FilaDetalle[],
  startId: string,
  maps: TreeMaps,
): FilaDetalle[] {
  let updated = filas;
  let current = startId;

  while (maps.childToParent.has(current)) {
    const parentId = maps.childToParent.get(current)!;
    const childrenIds = maps.parentToChildren.get(parentId) ?? [];

    const sumaHijos = updated
      .filter((f) => childrenIds.includes(f._clientId))
      .reduce((sum, f) => sum + f.montoAnual, 0);

    updated = updated.map((f) =>
      f._clientId === parentId && f.montoAnual !== sumaHijos
        ? { ...f, montoAnual: sumaHijos, isDirty: true }
        : f,
    );

    current = parentId;
  }

  return updated;
}

/**
 * Obtiene la información necesaria para mostrar la confirmación de eliminación:
 * cuántos descendientes tiene y quién es su padre.
 */
export function getDeleteInfo(
  clientId: string,
  filas: FilaDetalle[],
): DeleteInfo {
  const maps = buildTreeMaps(filas);
  const descendantIds = getDescendantIds(clientId, maps);
  const parentClientId = maps.childToParent.get(clientId);

  return {
    descendantIds,
    count: descendantIds.length,
    parentClientId,
  };
}

/**
 * Elimina un nodo y todos sus descendientes, luego recalcula los ancestros
 * del nodo eliminado.
 *
 * Retorna un NUEVO array de filas sin los nodos eliminados y con montos
 * de ancestros recalculados.
 */
export function removeWithDescendants(
  filas: FilaDetalle[],
  clientId: string,
): { updated: FilaDetalle[]; removedIds: string[] } {
  const maps = buildTreeMaps(filas);
  const descendantIds = getDescendantIds(clientId, maps);
  const removedIds = [clientId, ...descendantIds];
  const removedSet = new Set(removedIds);

  // Filtrar filas eliminadas
  let updated = filas.filter((f) => !removedSet.has(f._clientId));

  // Recalcular ancestros del nodo eliminado (con el nuevo set de filas)
  const parentClientId = maps.childToParent.get(clientId);
  if (parentClientId && !removedSet.has(parentClientId)) {
    const newMaps = buildTreeMaps(updated);
    updated = recalcAncestors(updated, parentClientId, newMaps);

    // El padre directo también necesita recalcular su propio monto
    const remainingChildren = newMaps.parentToChildren.get(parentClientId) ?? [];
    const sumaHijos = updated
      .filter((f) => remainingChildren.includes(f._clientId))
      .reduce((sum, f) => sum + f.montoAnual, 0);

    updated = updated.map((f) =>
      f._clientId === parentClientId
        ? { ...f, montoAnual: sumaHijos, isDirty: true }
        : f,
    );
  }

  return { updated, removedIds };
}
