import type { DetalleItem } from 'mf_store/store';
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type {
  CentrosCostoItem,
  CuentaPresupuestaria,
  FilaDetalle,
  FilaDisplay,
} from '../../types/presupuesto.types';
import {
  type DeleteInfo,
  buildTreeMaps,
  getDeleteInfo,
  recalcAncestors,
  removeWithDescendants,
} from '../../utils/presupuestoTree';

/**
 * Hook de responsabilidad única: gestión del estado local del grid de detalle.
 * Convierte DetalleItem[] (del servidor) en FilaDetalle[] (estado local) y
 * expone operaciones CRUD sobre la grilla de forma optimista.
 *
 * Las operaciones de monto y eliminación propagan cambios en cascada
 * (bottom-up para montos, top-down para eliminación).
 *
 * SOLID - SRP: solo se encarga del estado local del grid (no del servidor).
 * SOLID - OCP: la lógica de árbol se delega a utils/presupuestoTree.ts.
 */
export const usePresupuestoDetalle = (initialDetalle: DetalleItem[]) => {
  const [filas, setFilas] = useState<FilaDetalle[]>(() =>
    initialDetalle.map(detalleToFila),
  );
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  /** Reconstruir filas cuando cambia el detalle del servidor */
  const resetFromServer = useCallback((detalle: DetalleItem[]) => {
    setFilas(detalle.map(detalleToFila));
  }, []);

  // ── Operaciones ─────────────────────────────────────────────────────────────

  const agregarLinea = useCallback(() => {
    const nueva: FilaDetalle = {
      _clientId: uuid(),
      montoAnual: 0,
      isNew: true,
      isDirty: false,
    };
    setFilas((prev) => [...prev, nueva]);
    return nueva._clientId;
  }, []);

  /**
   * Agrega una cuenta hoja al grid junto con todos sus ancestros faltantes.
   * Replica el flujo del prototipo: piConfirmAdd() → insertar padres + hoja → recalc.
   *
   * @param leaf - La cuenta hoja seleccionada
   * @param monto - Monto anual de la hoja
   * @param ancestors - Cadena completa de ancestros (raíz → padre directo)
   * @param centroCostoId - Centro de costo opcional
   * @returns clientId de la fila hoja insertada
   */
  const agregarCuentaConAncestros = useCallback(
    (
      leaf: CuentaPresupuestaria,
      monto: number,
      ancestors: CuentaPresupuestaria[],
      centroCostoId?: number | null,
    ): string => {
      const leafClientId = uuid();

      setFilas((prev) => {
        // Detectar qué cuentas ya existen en el grid
        const existingCuentaIds = new Set(
          prev.filter((f) => f.cuentaId !== undefined).map((f) => f.cuentaId!),
        );

        const newFilas: FilaDetalle[] = [];

        // Insertar ancestros faltantes (monto = 0, se recalculará)
        for (const anc of ancestors) {
          if (!existingCuentaIds.has(anc.id)) {
            newFilas.push({
              _clientId: uuid(),
              cuentaId: anc.id,
              cuenta: anc,
              centroCostoId: centroCostoId ?? null,
              montoAnual: 0,
              isNew: true,
              isDirty: true,
            });
          }
        }

        // Insertar la hoja
        newFilas.push({
          _clientId: leafClientId,
          cuentaId: leaf.id,
          cuenta: leaf,
          centroCostoId: centroCostoId ?? null,
          montoAnual: monto,
          isNew: true,
          isDirty: true,
        });

        const merged = [...prev, ...newFilas];

        // Recalcular ancestros bottom-up
        const maps = buildTreeMaps(merged);
        return recalcAncestors(merged, leafClientId, maps);
      });

      return leafClientId;
    },
    [],
  );

  const setCuenta = useCallback(
    (clientId: string, cuenta: CuentaPresupuestaria | null) => {
      setFilas((prev) =>
        prev.map((f) =>
          f._clientId === clientId
            ? {
                ...f,
                cuentaId: cuenta?.id,
                cuenta: cuenta ?? undefined,
                isDirty: true,
              }
            : f,
        ),
      );
    },
    [],
  );

  const setCentroCosto = useCallback(
    (clientId: string, cc: CentrosCostoItem | null) => {
      setFilas((prev) =>
        prev.map((f) =>
          f._clientId === clientId
            ? {
                ...f,
                centroCostoId: cc?.id ?? null,
                centroCosto: cc,
                isDirty: true,
              }
            : f,
        ),
      );
    },
    [],
  );

  /**
   * Actualiza el monto de una fila y propaga la suma en cascada
   * hacia todos los ancestros (bottom-up), igual que el prototipo:
   *   _piRecalcParentMontos() → recalcula cada padre como Σ hijos directos.
   */
  const setMonto = useCallback((clientId: string, monto: number) => {
    setFilas((prev) => {
      // 1. Actualizar la fila objetivo
      const updated = prev.map((f) =>
        f._clientId === clientId
          ? { ...f, montoAnual: monto, isDirty: true }
          : f,
      );

      // 2. Propagar suma hacia ancestros
      const maps = buildTreeMaps(updated);
      return recalcAncestors(updated, clientId, maps);
    });
  }, []);

  const setObservacion = useCallback((clientId: string, obs: string) => {
    setFilas((prev) =>
      prev.map((f) =>
        f._clientId === clientId
          ? { ...f, observacion: obs, isDirty: true }
          : f,
      ),
    );
  }, []);

  /**
   * Elimina solo una fila individual (sin descendientes).
   * Para eliminación con cascade, usar eliminarConDescendientes.
   */
  const eliminarFila = useCallback((clientId: string) => {
    setFilas((prev) => {
      const filtered = prev.filter((f) => f._clientId !== clientId);
      // Recalcular ancestros del nodo eliminado
      const maps = buildTreeMaps(prev);
      const parentId = maps.childToParent.get(clientId);
      if (parentId) {
        const newMaps = buildTreeMaps(filtered);
        const childrenOfParent = newMaps.parentToChildren.get(parentId) ?? [];
        const sumaHijos = filtered
          .filter((f) => childrenOfParent.includes(f._clientId))
          .reduce((sum, f) => sum + f.montoAnual, 0);
        let recalced = filtered.map((f) =>
          f._clientId === parentId
            ? { ...f, montoAnual: sumaHijos, isDirty: true }
            : f,
        );
        recalced = recalcAncestors(recalced, parentId, newMaps);
        return recalced;
      }
      return filtered;
    });
  }, []);

  /**
   * Elimina un nodo y TODOS sus descendientes en cascada,
   * luego recalcula los montos de los ancestros del nodo eliminado.
   *
   * Equivale al flujo del prototipo:
   *   piConfirmDelete() → remove rows → _piRecalcParentMontos() → _piValidateTree()
   *
   * @returns IDs de todas las filas eliminadas (incluyendo descendientes)
   */
  const eliminarConDescendientes = useCallback((clientId: string): string[] => {
    let removedIds: string[] = [];
    setFilas((prev) => {
      const result = removeWithDescendants(prev, clientId);
      removedIds = result.removedIds;
      return result.updated;
    });
    return removedIds;
  }, []);

  /**
   * Obtiene información sobre los descendientes de una fila para mostrar
   * en la UI de confirmación de eliminación.
   */
  const getInfoEliminar = useCallback(
    (clientId: string): DeleteInfo => getDeleteInfo(clientId, filas),
    [filas],
  );

  /** Importar filas en bloque (reemplaza todas las filas actuales) */
  const importarFilas = useCallback((nuevas: FilaDetalle[]) => {
    setFilas(nuevas);
  }, []);

  const marcarGuardada = useCallback((clientId: string, id: number) => {
    setFilas((prev) =>
      prev.map((f) =>
        f._clientId === clientId
          ? { ...f, id, isNew: false, isDirty: false }
          : f,
      ),
    );
  }, []);

  /** Recalcular monto de fila padre = suma de sus hijos */
  const recalcularPadre = useCallback(
    (clientId: string, hijosIds: string[]) => {
      setFilas((prev) => {
        const sumaHijos = prev
          .filter((f) => hijosIds.includes(f._clientId))
          .reduce((sum, f) => sum + f.montoAnual, 0);
        let updated = prev.map((f) =>
          f._clientId === clientId
            ? { ...f, montoAnual: sumaHijos, isDirty: true }
            : f,
        );
        // Propagar hacia ancestros superiores
        const maps = buildTreeMaps(updated);
        updated = recalcAncestors(updated, clientId, maps);
        return updated;
      });
    },
    [],
  );

  /** Recalcular TODOS los padres con discrepancia */
  const recalcularTodo = useCallback((displayFilas: FilaDisplay[]) => {
    setFilas((prev) => {
      const newFilas = [...prev];
      // Índice clientId → index para O(1) lookup
      const idxMap = new Map<string, number>();
      for (let i = 0; i < newFilas.length; i++) {
        idxMap.set(newFilas[i]._clientId, i);
      }
      // Bottom-up: procesar desde los niveles más profundos hacia la raíz
      const sorted = [...displayFilas].sort((a, b) => b.nivel - a.nivel);
      for (const display of sorted) {
        if (display.hijosIds.length === 0) continue;
        let sumaHijos = 0;
        for (const hijoId of display.hijosIds) {
          const idx = idxMap.get(hijoId);
          if (idx !== undefined) sumaHijos += newFilas[idx].montoAnual;
        }
        const idx = idxMap.get(display._clientId);
        if (idx !== undefined && newFilas[idx].montoAnual !== sumaHijos) {
          newFilas[idx] = {
            ...newFilas[idx],
            montoAnual: sumaHijos,
            isDirty: true,
          };
        }
      }
      return newFilas;
    });
  }, []);

  // ── Filas con jerarquía computada ───────────────────────────────────────────

  const filasDisplay = useMemo<FilaDisplay[]>(() => {
    return buildDisplayOrder(filas);
  }, [filas]);

  // ── Accesores ────────────────────────────────────────────────────────────────

  const cuentasEnUso = useMemo(
    () =>
      filas
        .map((f) => f.cuentaId)
        .filter((id): id is number => id !== undefined),
    [filas],
  );

  const filasDirty = useMemo(
    () => filas.filter((f) => f.isDirty || f.isNew),
    [filas],
  );

  return {
    filas,
    filasDisplay,
    cuentasEnUso,
    filasDirty,
    pendingDelete,
    setPendingDelete,
    resetFromServer,
    agregarLinea,
    agregarCuentaConAncestros,
    setCuenta,
    setCentroCosto,
    setMonto,
    setObservacion,
    eliminarFila,
    eliminarConDescendientes,
    getInfoEliminar,
    importarFilas,
    marcarGuardada,
    recalcularPadre,
    recalcularTodo,
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detalleToFila(d: DetalleItem): FilaDetalle {
  return {
    _clientId: String(d.id),
    id: d.id,
    cuentaId: d.cuentaId,
    centroCostoId: d.centroCostoId,
    montoAnual: d.montoAnual,
    observacion: d.observacion ?? undefined,
    cuenta: d.cuenta,
    centroCosto: d.centroCosto ? { ...d.centroCosto, activo: true } : null,
    isNew: false,
    isDirty: false,
  };
}

/**
 * Construye el orden de display en pre-order y calcula nivel e hijosIds.
 * Soporta jerarquía de N niveles basada en cuenta.parentId.
 */
function buildDisplayOrder(filas: FilaDetalle[]): FilaDisplay[] {
  const cuentaIdToClientId = new Map<number, string>();
  for (const f of filas) {
    if (f.cuentaId) cuentaIdToClientId.set(f.cuentaId, f._clientId);
  }

  const childrenMap = new Map<string, string[]>();
  const rootClientIds: string[] = [];

  for (const f of filas) {
    if (!f.cuenta) {
      rootClientIds.push(f._clientId);
      continue;
    }
    const parentClientId =
      f.cuenta.parentId !== null
        ? cuentaIdToClientId.get(f.cuenta.parentId)
        : undefined;

    if (parentClientId) {
      const existing = childrenMap.get(parentClientId) ?? [];
      childrenMap.set(parentClientId, [...existing, f._clientId]);
    } else {
      rootClientIds.push(f._clientId);
    }
  }

  const result: FilaDisplay[] = [];
  const filaMap = new Map(filas.map((f) => [f._clientId, f]));

  const visit = (clientId: string, nivel: number) => {
    const fila = filaMap.get(clientId);
    if (!fila) return;
    const hijosIds = childrenMap.get(clientId) ?? [];
    result.push({ ...fila, nivel, hijosIds });
    for (const hijoId of hijosIds) {
      visit(hijoId, nivel + 1);
    }
  };

  for (const rootId of rootClientIds) {
    visit(rootId, 0);
  }

  return result;
}
