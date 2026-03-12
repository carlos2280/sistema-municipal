import { useCallback, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import type {
  CentrosCostoItem,
  CuentaPresupuestaria,
  FilaDetalle,
  FilaDisplay,
} from "../../types/presupuesto.types";
import type { DetalleItem } from "mf_store/store";

/**
 * Hook de responsabilidad única: gestión del estado local del grid de detalle.
 * Convierte DetalleItem[] (del servidor) en FilaDetalle[] (estado local) y
 * expone operaciones CRUD sobre la grilla de forma optimista.
 *
 * SOLID - SRP: solo se encarga del estado local del grid (no del servidor).
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

  const setCuenta = useCallback((clientId: string, cuenta: CuentaPresupuestaria | null) => {
    setFilas((prev) =>
      prev.map((f) =>
        f._clientId === clientId
          ? { ...f, cuentaId: cuenta?.id, cuenta: cuenta ?? undefined, isDirty: true }
          : f,
      ),
    );
  }, []);

  const setCentroCosto = useCallback((clientId: string, cc: CentrosCostoItem | null) => {
    setFilas((prev) =>
      prev.map((f) =>
        f._clientId === clientId
          ? { ...f, centroCostoId: cc?.id ?? null, centroCosto: cc, isDirty: true }
          : f,
      ),
    );
  }, []);

  const setMonto = useCallback((clientId: string, monto: number) => {
    setFilas((prev) =>
      prev.map((f) =>
        f._clientId === clientId ? { ...f, montoAnual: monto, isDirty: true } : f,
      ),
    );
  }, []);

  const setObservacion = useCallback((clientId: string, obs: string) => {
    setFilas((prev) =>
      prev.map((f) =>
        f._clientId === clientId ? { ...f, observacion: obs, isDirty: true } : f,
      ),
    );
  }, []);

  const eliminarFila = useCallback((clientId: string) => {
    setFilas((prev) => prev.filter((f) => f._clientId !== clientId));
  }, []);

  /** Importar filas en bloque (reemplaza todas las filas actuales) */
  const importarFilas = useCallback((nuevas: FilaDetalle[]) => {
    setFilas(nuevas);
  }, []);

  const marcarGuardada = useCallback((clientId: string, id: number) => {
    setFilas((prev) =>
      prev.map((f) =>
        f._clientId === clientId ? { ...f, id, isNew: false, isDirty: false } : f,
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
        return prev.map((f) =>
          f._clientId === clientId ? { ...f, montoAnual: sumaHijos, isDirty: true } : f,
        );
      });
    },
    [],
  );

  /** Recalcular TODOS los padres con discrepancia */
  const recalcularTodo = useCallback((displayFilas: FilaDisplay[]) => {
    setFilas((prev) => {
      const newFilas = [...prev];
      for (const display of displayFilas) {
        if (display.hijosIds.length === 0) continue;
        const sumaHijos = prev
          .filter((f) => display.hijosIds.includes(f._clientId))
          .reduce((sum, f) => sum + f.montoAnual, 0);
        const idx = newFilas.findIndex((f) => f._clientId === display._clientId);
        if (idx !== -1 && newFilas[idx].montoAnual !== sumaHijos) {
          newFilas[idx] = { ...newFilas[idx], montoAnual: sumaHijos, isDirty: true };
        }
      }
      return newFilas;
    });
  }, []);

  // ── Filas con jerarquía computada ───────────────────────────────────────────

  /**
   * Construye FilaDisplay[] desde FilaDetalle[]:
   * - Calcula nivel jerárquico (0 = raíz, 1 = hijo, etc.)
   * - Calcula hijosIds para cada fila padre
   * - Orden: pre-order (padre antes que hijos)
   */
  const filasDisplay = useMemo<FilaDisplay[]>(() => {
    return buildDisplayOrder(filas);
  }, [filas]);

  // ── Accesores ────────────────────────────────────────────────────────────────

  const cuentasEnUso = useMemo(
    () => filas.map((f) => f.cuentaId).filter((id): id is number => id !== undefined),
    [filas],
  );

  const filasDirty = useMemo(() => filas.filter((f) => f.isDirty || f.isNew), [filas]);

  return {
    filas,
    filasDisplay,
    cuentasEnUso,
    filasDirty,
    pendingDelete,
    setPendingDelete,
    resetFromServer,
    agregarLinea,
    setCuenta,
    setCentroCosto,
    setMonto,
    setObservacion,
    eliminarFila,
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
    centroCosto: d.centroCosto ?? null,
    isNew: false,
    isDirty: false,
  };
}

/**
 * Construye el orden de display en pre-order y calcula nivel e hijosIds.
 * Soporta jerarquía de N niveles basada en cuenta.parentId.
 */
function buildDisplayOrder(filas: FilaDetalle[]): FilaDisplay[] {
  // Mapa cuentaId → clientId (para resolver parentId → clientId)
  const cuentaIdToClientId = new Map<number, string>();
  for (const f of filas) {
    if (f.cuentaId) cuentaIdToClientId.set(f.cuentaId, f._clientId);
  }

  // Construir árbol de clientIds
  const childrenMap = new Map<string, string[]>();
  const rootClientIds: string[] = [];

  for (const f of filas) {
    if (!f.cuenta) {
      rootClientIds.push(f._clientId);
      continue;
    }
    const parentClientId =
      f.cuenta.parentId !== null ? cuentaIdToClientId.get(f.cuenta.parentId) : undefined;

    if (parentClientId) {
      const existing = childrenMap.get(parentClientId) ?? [];
      childrenMap.set(parentClientId, [...existing, f._clientId]);
    } else {
      rootClientIds.push(f._clientId);
    }
  }

  // Pre-order traversal
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
