import { useMemo } from "react";
import type { FilaDetalle, FilaDisplay, EquilibrioState } from "../../types/presupuesto.types";

/**
 * Hook de responsabilidad única: detección de discrepancias padre/hijo
 * y cálculo del estado de equilibrio presupuestario.
 *
 * SOLID - SRP: solo se encarga del cálculo de discrepancias y equilibrio.
 */
export const useDiscrepancias = (
  filasIngresos: FilaDisplay[],
  filasGastos: FilaDisplay[],
) => {
  /**
   * Construye un mapa clientId → delta de discrepancia (null si no es padre con hijos).
   * delta = suma_hijos - monto_padre
   * - delta === null → no es padre con hijos
   * - delta === 0 → OK
   * - delta !== 0 → discrepancia
   */
  const discrepanciasIngresosMap = useMemo(
    () => buildDiscrepanciasMap(filasIngresos),
    [filasIngresos],
  );

  const discrepanciasGastosMap = useMemo(
    () => buildDiscrepanciasMap(filasGastos),
    [filasGastos],
  );

  const totalDiscrepancias = useMemo(() => {
    let count = 0;
    for (const delta of discrepanciasIngresosMap.values()) {
      if (delta !== null && delta !== 0) count++;
    }
    for (const delta of discrepanciasGastosMap.values()) {
      if (delta !== null && delta !== 0) count++;
    }
    return count;
  }, [discrepanciasIngresosMap, discrepanciasGastosMap]);

  const equilibrio = useMemo<EquilibrioState>(() => {
    // Suma solo filas raíz para evitar doble conteo
    const totalIngresos = sumarRaices(filasIngresos);
    const totalGastos = sumarRaices(filasGastos);
    const diferencia = totalIngresos - totalGastos;

    let estado: EquilibrioState["estado"];
    if (totalDiscrepancias > 0) {
      estado = "warning";
    } else if (diferencia !== 0) {
      estado = "error";
    } else {
      estado = "ok";
    }

    return {
      totalIngresos,
      totalGastos,
      diferencia,
      estado,
      discrepanciasPendientes: totalDiscrepancias,
      discrepancias: [],
    };
  }, [filasIngresos, filasGastos, totalDiscrepancias]);

  return {
    discrepanciasIngresosMap,
    discrepanciasGastosMap,
    totalDiscrepancias,
    equilibrio,
  };
};

// ─── Helpers internos ─────────────────────────────────────────────────────────

function buildDiscrepanciasMap(filas: FilaDisplay[]): Map<string, number | null> {
  const map = new Map<string, number | null>();

  // Index: cuentaId → clientId
  const cuentaIdToClientId = new Map<number, string>();
  for (const f of filas) {
    if (f.cuentaId) cuentaIdToClientId.set(f.cuentaId, f._clientId);
  }

  for (const fila of filas) {
    if (!fila.cuenta) {
      map.set(fila._clientId, null);
      continue;
    }

    // Detectar si esta fila tiene hijos en el grid
    const hijosIds = fila.hijosIds;
    if (hijosIds.length === 0) {
      // No es padre → no mostrar indicador
      map.set(fila._clientId, null);
      continue;
    }

    // Calcular suma de hijos
    const sumaHijos = filas
      .filter((f) => hijosIds.includes(f._clientId))
      .reduce((sum, f) => sum + f.montoAnual, 0);

    const delta = sumaHijos - fila.montoAnual;
    map.set(fila._clientId, delta);
  }

  return map;
}

function sumarRaices(filas: FilaDetalle[]): number {
  return filas
    .filter((f) => f.cuenta?.parentId === null && f.cuentaId)
    .reduce((sum, f) => sum + f.montoAnual, 0);
}
