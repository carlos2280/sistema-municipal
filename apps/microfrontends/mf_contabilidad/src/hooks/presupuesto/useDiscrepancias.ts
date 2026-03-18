import { useMemo } from 'react';
import type {
  EquilibrioState,
  FilaDetalle,
  FilaDisplay,
} from '../../types/presupuesto.types';

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

    let estado: EquilibrioState['estado'];
    if (totalDiscrepancias > 0) {
      estado = 'warning';
    } else if (diferencia !== 0) {
      estado = 'error';
    } else {
      estado = 'ok';
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

function buildDiscrepanciasMap(
  filas: FilaDisplay[],
): Map<string, number | null> {
  const map = new Map<string, number | null>();

  // Index O(n): clientId → fila para lookup rápido
  const filaMap = new Map<string, FilaDisplay>();
  for (const f of filas) {
    filaMap.set(f._clientId, f);
  }

  for (const fila of filas) {
    if (!fila.cuenta || fila.hijosIds.length === 0) {
      map.set(fila._clientId, null);
      continue;
    }

    // O(k) donde k = hijos directos, usando Map lookup en vez de filter O(n)
    let sumaHijos = 0;
    for (const hijoId of fila.hijosIds) {
      const hijo = filaMap.get(hijoId);
      if (hijo) sumaHijos += hijo.montoAnual;
    }

    map.set(fila._clientId, sumaHijos - fila.montoAnual);
  }

  return map;
}

function sumarRaices(filas: FilaDetalle[]): number {
  return filas
    .filter((f) => f.cuenta?.parentId === null && f.cuentaId)
    .reduce((sum, f) => sum + f.montoAnual, 0);
}
