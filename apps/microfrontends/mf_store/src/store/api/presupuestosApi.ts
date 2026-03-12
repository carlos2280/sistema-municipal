import { baseApi } from "./baseApi";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CentrosCostoItem {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface CuentaPresupuestaria {
  id: number;
  codigo: string;
  nombre: string;
  tipoCuentaId: number;
  parentId: number | null;
  subgrupoId: number;
}

export interface DetalleItem {
  id: number;
  presupuestoId: number;
  cuentaId: number;
  centroCostoId: number | null;
  montoAnual: number;
  observacion: string | null;
  createdAt: string;
  updatedAt: string;
  cuenta: CuentaPresupuestaria;
  centroCosto: { id: number; codigo: string; nombre: string } | null;
}

export interface PresupuestoResumen {
  id: number;
  anoContable: number;
  numero: number;
  glosa: string;
  actaDecreto: string | null;
  usuarioCreacion: number;
  usuarioModificacion: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PresupuestoConDetalle extends PresupuestoResumen {
  detalle: DetalleItem[];
}

export interface DiscrepanciaItem {
  cuentaPadreId: number;
  codigoPadre: string;
  nombrePadre: string;
  montoPadre: number;
  sumaHijos: number;
  delta: number;
}

export interface EquilibrioResult {
  totalIngresos: number;
  totalGastos: number;
  diferencia: number;
  discrepancias: DiscrepanciaItem[];
}

// ─── Request types ────────────────────────────────────────────────────────────

export interface CrearPresupuestoRequest {
  anoContable: number;
  glosa: string;
  actaDecreto?: string;
  usuarioCreacion: number;
}

export interface ActualizarPresupuestoRequest {
  id: number;
  glosa?: string;
  actaDecreto?: string;
  usuarioModificacion?: number;
}

export interface AgregarLineaRequest {
  presupuestoId: number;
  cuentaId: number;
  centroCostoId?: number | null;
  montoAnual: number;
  observacion?: string;
}

export interface ActualizarLineaRequest {
  presupuestoId: number;
  detalleId: number;
  montoAnual?: number;
  centroCostoId?: number | null;
  observacion?: string;
}

// ─── API Endpoints ────────────────────────────────────────────────────────────

export const presupuestosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Centros de Costo ──
    obtenerCentrosCosto: builder.query<CentrosCostoItem[], void>({
      query: () => "contabilidad/centros-costo",
      providesTags: ["CentrosCosto"],
    }),

    // ── Presupuestos ──
    listarPresupuestos: builder.query<PresupuestoResumen[], number | void>({
      query: (ano) =>
        ano ? `contabilidad/presupuestos?ano=${ano}` : "contabilidad/presupuestos",
      providesTags: ["Presupuestos"],
    }),

    obtenerPresupuesto: builder.query<PresupuestoConDetalle, number>({
      query: (id) => `contabilidad/presupuestos/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Presupuestos", id }],
    }),

    crearPresupuesto: builder.mutation<PresupuestoResumen, CrearPresupuestoRequest>({
      query: (data) => ({
        url: "contabilidad/presupuestos",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Presupuestos"],
    }),

    actualizarPresupuesto: builder.mutation<PresupuestoResumen, ActualizarPresupuestoRequest>({
      query: ({ id, ...body }) => ({
        url: `contabilidad/presupuestos/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        "Presupuestos",
        { type: "Presupuestos", id },
      ],
    }),

    eliminarPresupuesto: builder.mutation<void, number>({
      query: (id) => ({
        url: `contabilidad/presupuestos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Presupuestos"],
    }),

    // ── Equilibrio ──
    obtenerEquilibrio: builder.query<EquilibrioResult, number>({
      query: (id) => `contabilidad/presupuestos/${id}/equilibrio`,
      providesTags: (_result, _err, id) => [{ type: "PresupuestosDetalle", id }],
    }),

    // ── Detalle ──
    agregarLinea: builder.mutation<DetalleItem, AgregarLineaRequest>({
      query: ({ presupuestoId, ...body }) => ({
        url: `contabilidad/presupuestos/${presupuestoId}/detalle`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { presupuestoId }) => [
        { type: "Presupuestos", id: presupuestoId },
        { type: "PresupuestosDetalle", id: presupuestoId },
      ],
    }),

    actualizarLinea: builder.mutation<DetalleItem, ActualizarLineaRequest>({
      query: ({ presupuestoId, detalleId, ...body }) => ({
        url: `contabilidad/presupuestos/${presupuestoId}/detalle/${detalleId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { presupuestoId }) => [
        { type: "Presupuestos", id: presupuestoId },
        { type: "PresupuestosDetalle", id: presupuestoId },
      ],
    }),

    eliminarLinea: builder.mutation<void, { presupuestoId: number; detalleId: number }>({
      query: ({ presupuestoId, detalleId }) => ({
        url: `contabilidad/presupuestos/${presupuestoId}/detalle/${detalleId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { presupuestoId }) => [
        { type: "Presupuestos", id: presupuestoId },
        { type: "PresupuestosDetalle", id: presupuestoId },
      ],
    }),

    // ── Cuentas Presupuestarias ──
    listarCuentasPresupuestarias: builder.query<
      CuentaPresupuestaria[],
      { tipo: "ingreso" | "gasto"; parent?: string; ano?: number }
    >({
      query: ({ tipo, parent, ano }) => {
        const params = new URLSearchParams({ tipo });
        if (parent) params.set("parent", parent);
        if (ano) params.set("ano", String(ano));
        return `contabilidad/presupuestos/cuentas-presupuestarias?${params}`;
      },
      providesTags: ["PlanCuentas"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useObtenerCentrosCostoQuery,
  useListarPresupuestosQuery,
  useObtenerPresupuestoQuery,
  useCrearPresupuestoMutation,
  useActualizarPresupuestoMutation,
  useEliminarPresupuestoMutation,
  useLazyObtenerEquilibrioQuery,
  useObtenerEquilibrioQuery,
  useAgregarLineaMutation,
  useActualizarLineaMutation,
  useEliminarLineaMutation,
  useListarCuentasPresupuestariasQuery,
  useLazyListarCuentasPresupuestariasQuery,
} = presupuestosApi;

export type {
  CentrosCostoItem,
  CuentaPresupuestaria,
  DetalleItem,
  PresupuestoResumen,
  PresupuestoConDetalle,
  EquilibrioResult,
  DiscrepanciaItem,
};
