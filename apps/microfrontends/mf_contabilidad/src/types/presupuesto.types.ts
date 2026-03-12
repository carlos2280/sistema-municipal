import type {
  CentrosCostoItem,
  CuentaPresupuestaria,
  DiscrepanciaItem,
} from "mf_store/store";

// Re-exportar tipos del store para uso en componentes
export type { CentrosCostoItem, CuentaPresupuestaria, DiscrepanciaItem };

// ─── Tab activo ───────────────────────────────────────────────────────────────

export type TipoTab = "ingresos" | "gastos" | "resumen";

// ─── Fila del grid (estado interno del cliente) ───────────────────────────────

/**
 * Representación de una línea de detalle en el grid.
 * Combina datos del servidor con estado local de UI.
 */
export interface FilaDetalle {
  /** Clave única para React (UUID para nuevas filas, string(id) para existentes) */
  _clientId: string;
  /** ID del servidor. undefined = fila nueva no guardada */
  id?: number;
  cuentaId?: number;
  centroCostoId?: number | null;
  montoAnual: number;
  observacion?: string;
  // Datos enriquecidos (join del servidor)
  cuenta?: CuentaPresupuestaria;
  centroCosto?: CentrosCostoItem | null;
  // Estado de UI
  isNew: boolean;
  isDirty: boolean;
}

// ─── Fila del grid con jerarquía computada ────────────────────────────────────

/**
 * FilaDetalle enriquecida con información de nivel para renderizado jerárquico.
 * Construida en usePresupuestoDetalle a partir de FilaDetalle[] y la jerarquía de cuentas.
 */
export interface FilaDisplay extends FilaDetalle {
  /** Profundidad en la jerarquía (0 = raíz 115xx/215xx, 1 = hijo, etc.) */
  nivel: number;
  /** IDs de hijos directos en el detalle actual */
  hijosIds: string[];
}

// ─── Encabezado del presupuesto (formulario) ──────────────────────────────────

export interface PresupuestoHeaderForm {
  anoContable: number;
  glosa: string;
  actaDecreto: string;
}

// ─── Estado del equilibrio presupuestario ─────────────────────────────────────

export type EstadoEquilibrio = "ok" | "error" | "warning";

export interface EquilibrioState {
  totalIngresos: number;
  totalGastos: number;
  diferencia: number;
  estado: EstadoEquilibrio;
  discrepanciasPendientes: number;
  discrepancias: DiscrepanciaItem[];
}

// ─── Resultado de guardar (batch) ────────────────────────────────────────────

export interface GuardarResult {
  ok: boolean;
  advertencias: string[];
  errores: string[];
}
