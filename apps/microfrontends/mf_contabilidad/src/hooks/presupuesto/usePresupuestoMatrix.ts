import type {
  FilaDetalle,
  FilaDisplay,
  FilaMatrix,
} from '@/types/presupuesto.types';
import {
  type DeleteInfo,
  buildTreeMaps,
  getDeleteInfo,
  recalcAncestors,
  removeWithDescendants,
} from '@/utils/presupuestoTree';
import type {
  CentrosCostoItem,
  CuentaPresupuestaria,
  DetalleItem,
  SubprogramaItem,
} from 'mf_store/store';
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';

/**
 * Hook que gestiona el estado de la Adaptive Financial Matrix.
 *
 * Agrupa múltiples registros de presupuestos_detalle (uno por cuenta × subprograma)
 * en una sola FilaMatrix por cuenta, con distribución Map<subprogramaId, monto>.
 *
 * Para guardar, "explota" cada FilaMatrix en N registros de detalle.
 */
export const usePresupuestoMatrix = (initialDetalle: DetalleItem[]) => {
  // Agrupar detalles iniciales por cuenta
  const [filas, setFilas] = useState<FilaDetalle[]>(() =>
    agruparDetallesInicial(initialDetalle),
  );
  // Distribución: Map<clientId, Map<subprogramaId, monto>>
  const [distribuciones, setDistribuciones] = useState<
    Map<string, Map<number, number>>
  >(() => buildDistribucionesDesdeDetalle(initialDetalle));
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const resetFromServer = useCallback((detalle: DetalleItem[]) => {
    setFilas(agruparDetallesInicial(detalle));
    setDistribuciones(buildDistribucionesDesdeDetalle(detalle));
  }, []);

  // ── Operaciones sobre distribución ──────────────────────────────────────

  const setMontoArea = useCallback(
    (clientId: string, subprogramaId: number, montoPesos: number) => {
      setDistribuciones((prev) => {
        const newMap = new Map(prev);
        const dist = new Map(newMap.get(clientId) ?? new Map());
        if (montoPesos > 0) {
          dist.set(subprogramaId, montoPesos);
        } else {
          dist.delete(subprogramaId);
        }
        newMap.set(clientId, dist);
        return newMap;
      });

      // Update total monto for this row
      setFilas((prev) => {
        const updated = prev.map((f) => {
          if (f._clientId !== clientId) return f;
          // Recalculate monto from distribution
          const dist = distribuciones.get(clientId) ?? new Map();
          const updatedDist = new Map(dist);
          if (montoPesos > 0) {
            updatedDist.set(subprogramaId, montoPesos);
          } else {
            updatedDist.delete(subprogramaId);
          }
          const totalDist = [...updatedDist.values()].reduce(
            (a, b) => a + b,
            0,
          );
          return { ...f, montoAnual: totalDist, isDirty: true };
        });

        // Propagate to ancestors
        const maps = buildTreeMaps(updated);
        return recalcAncestors(updated, clientId, maps);
      });
    },
    [distribuciones],
  );

  /** Recalcular Total fila = Σ áreas (fix discrepancia de distribución) */
  const recalcularDesdeDistribucion = useCallback(
    (clientId: string) => {
      const dist = distribuciones.get(clientId);
      if (!dist) return;
      const totalDist = [...dist.values()].reduce((a, b) => a + b, 0);
      setFilas((prev) => {
        const updated = prev.map((f) =>
          f._clientId === clientId
            ? { ...f, montoAnual: totalDist, isDirty: true }
            : f,
        );
        const maps = buildTreeMaps(updated);
        return recalcAncestors(updated, clientId, maps);
      });
    },
    [distribuciones],
  );

  // ── Operaciones compatibles con usePresupuestoDetalle ──────────────────

  const agregarCuentaConAncestros = useCallback(
    (
      leaf: CuentaPresupuestaria,
      monto: number,
      ancestors: CuentaPresupuestaria[],
      centroCostoId?: number | null,
    ): string => {
      const leafClientId = uuid();

      setFilas((prev) => {
        const existingCuentaIds = new Set(
          prev
            .filter(
              (f): f is typeof f & { cuentaId: number } =>
                f.cuentaId !== undefined,
            )
            .map((f) => f.cuentaId),
        );

        const newFilas: FilaDetalle[] = [];

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

  const setMonto = useCallback((clientId: string, monto: number) => {
    setFilas((prev) => {
      const updated = prev.map((f) =>
        f._clientId === clientId
          ? { ...f, montoAnual: monto, isDirty: true }
          : f,
      );
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

  const eliminarFila = useCallback((clientId: string) => {
    setFilas((prev) => {
      const filtered = prev.filter((f) => f._clientId !== clientId);
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
    setDistribuciones((prev) => {
      const newMap = new Map(prev);
      newMap.delete(clientId);
      return newMap;
    });
  }, []);

  const eliminarConDescendientes = useCallback((clientId: string): string[] => {
    let removedIds: string[] = [];
    setFilas((prev) => {
      const result = removeWithDescendants(prev, clientId);
      removedIds = result.removedIds;
      return result.updated;
    });
    setDistribuciones((prev) => {
      const newMap = new Map(prev);
      for (const id of removedIds) newMap.delete(id);
      return newMap;
    });
    return removedIds;
  }, []);

  const getInfoEliminar = useCallback(
    (clientId: string): DeleteInfo => getDeleteInfo(clientId, filas),
    [filas],
  );

  const importarFilas = useCallback(
    (
      nuevas: FilaDetalle[],
      nuevasDistribuciones?: Map<string, Map<number, number>>,
    ) => {
      setFilas(nuevas);
      if (nuevasDistribuciones) {
        setDistribuciones(nuevasDistribuciones);
      }
    },
    [],
  );

  const marcarGuardada = useCallback((clientId: string, id: number) => {
    setFilas((prev) =>
      prev.map((f) =>
        f._clientId === clientId
          ? { ...f, id, isNew: false, isDirty: false }
          : f,
      ),
    );
  }, []);

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
        const maps = buildTreeMaps(updated);
        updated = recalcAncestors(updated, clientId, maps);
        return updated;
      });
    },
    [],
  );

  const recalcularTodo = useCallback((displayFilas: FilaMatrix[]) => {
    setFilas((prev) => {
      const newFilas = [...prev];
      const idxMap = new Map<string, number>();
      for (let i = 0; i < newFilas.length; i++) {
        idxMap.set(newFilas[i]._clientId, i);
      }
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

  // ── Filas con jerarquía + distribución = FilaMatrix[] ────────────────

  const filasMatrix = useMemo<FilaMatrix[]>(() => {
    const display = buildDisplayOrder(filas);
    return display.map((f) => {
      const dist = distribuciones.get(f._clientId) ?? new Map();
      const totalDist = [...dist.values()].reduce((a, b) => a + b, 0);
      return { ...f, distribucion: dist, totalDistribucion: totalDist };
    });
  }, [filas, distribuciones]);

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

  /**
   * Explota FilaMatrix[] en registros planos para guardar al servidor.
   * Cada celda con monto > 0 genera un registro de detalle.
   */
  const matrixToDetalles = useCallback(
    (presupuestoId: number) => {
      const detalles: Array<{
        clientId: string;
        serverId?: number;
        cuentaId: number;
        centroCostoId: number | null;
        subprogramaId: number | null;
        montoAnual: number;
        observacion?: string;
        isNew: boolean;
      }> = [];

      for (const fila of filas) {
        if (!fila.cuentaId) continue;
        const dist = distribuciones.get(fila._clientId);

        if (dist && dist.size > 0) {
          // Explode: one record per subprograma with monto > 0
          for (const [subId, monto] of dist) {
            if (monto <= 0) continue;
            detalles.push({
              clientId: fila._clientId,
              serverId: fila.id,
              cuentaId: fila.cuentaId,
              centroCostoId: fila.centroCostoId ?? null,
              subprogramaId: subId,
              montoAnual: monto,
              observacion: fila.observacion,
              isNew: fila.isNew,
            });
          }
        } else if (fila.montoAnual > 0) {
          // No distribution yet — save as single record without subprograma
          detalles.push({
            clientId: fila._clientId,
            serverId: fila.id,
            cuentaId: fila.cuentaId,
            centroCostoId: fila.centroCostoId ?? null,
            subprogramaId: null,
            montoAnual: fila.montoAnual,
            observacion: fila.observacion,
            isNew: fila.isNew,
          });
        }
      }

      return detalles;
    },
    [filas, distribuciones],
  );

  return {
    filas,
    filasMatrix,
    /** Alias de filasMatrix para compatibilidad con useDiscrepancias y otros hooks */
    filasDisplay: filasMatrix,
    cuentasEnUso,
    filasDirty,
    distribuciones,
    pendingDelete,
    setPendingDelete,
    resetFromServer,
    agregarLinea,
    agregarCuentaConAncestros,
    setCuenta,
    setCentroCosto,
    setMonto,
    setObservacion,
    setMontoArea,
    recalcularDesdeDistribucion,
    eliminarFila,
    eliminarConDescendientes,
    getInfoEliminar,
    importarFilas,
    marcarGuardada,
    recalcularPadre,
    recalcularTodo,
    matrixToDetalles,
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Agrupa detalles del servidor por cuenta (toma la primera fila como base) */
function agruparDetallesInicial(detalles: DetalleItem[]): FilaDetalle[] {
  const porCuenta = new Map<number, DetalleItem[]>();
  for (const d of detalles) {
    const key = d.cuentaId;
    if (!porCuenta.has(key)) porCuenta.set(key, []);
    const bucket = porCuenta.get(key) as DetalleItem[];
    bucket.push(d);
  }

  return [...porCuenta.entries()].map(([, items]) => {
    const base = items[0];
    const totalMonto = items.reduce((sum, i) => sum + i.montoAnual, 0);
    return {
      _clientId: String(base.id),
      id: base.id,
      cuentaId: base.cuentaId,
      centroCostoId: base.centroCostoId,
      montoAnual: totalMonto,
      observacion: base.observacion ?? undefined,
      cuenta: base.cuenta,
      centroCosto: base.centroCosto
        ? { ...base.centroCosto, activo: true }
        : null,
      isNew: false,
      isDirty: false,
    };
  });
}

/** Construye distribuciones por clientId desde los detalles del servidor */
function buildDistribucionesDesdeDetalle(
  detalles: DetalleItem[],
): Map<string, Map<number, number>> {
  const result = new Map<string, Map<number, number>>();

  const porCuenta = new Map<number, DetalleItem[]>();
  for (const d of detalles) {
    if (!porCuenta.has(d.cuentaId)) porCuenta.set(d.cuentaId, []);
    const bucket = porCuenta.get(d.cuentaId) as DetalleItem[];
    bucket.push(d);
  }

  for (const [, items] of porCuenta) {
    const clientId = String(items[0].id);
    const dist = new Map<number, number>();
    for (const item of items) {
      if (item.subprogramaId && item.montoAnual > 0) {
        dist.set(item.subprogramaId, item.montoAnual);
      }
    }
    if (dist.size > 0) {
      result.set(clientId, dist);
    }
  }

  return result;
}

/** Build display order with hierarchy (same as usePresupuestoDetalle) */
function buildDisplayOrder(
  filas: FilaDetalle[],
): Array<FilaDetalle & { nivel: number; hijosIds: string[] }> {
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

  const result: Array<FilaDetalle & { nivel: number; hijosIds: string[] }> = [];
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
