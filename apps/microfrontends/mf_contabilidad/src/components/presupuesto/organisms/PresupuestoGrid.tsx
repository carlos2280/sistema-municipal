import { Box, Typography } from "@mui/material";
import { memo, useMemo } from "react";
import type {
  CentrosCostoItem,
  CuentaPresupuestaria,
  FilaDisplay,
} from "../../../types/presupuesto.types";
import PresupuestoDetalleRow from "../molecules/PresupuestoDetalleRow";

interface PresupuestoGridProps {
  filas: FilaDisplay[];
  cuentasDisponibles: CuentaPresupuestaria[];
  centrosCosto: CentrosCostoItem[];
  cuentasEnUso: number[];
  discrepanciasMap: Map<string, number | null>;
  deleteTargetIds: Set<string>;
  tipoTab: "ingresos" | "gastos";
  searchFilter: string;
  onCuentaChange: (clientId: string, cuenta: CuentaPresupuestaria | null) => void;
  onCentroCostoChange: (clientId: string, cc: CentrosCostoItem | null) => void;
  onMontoConfirm: (clientId: string, monto: number) => void;
  onRecalcular: (clientId: string) => void;
  onEliminar: (clientId: string) => void;
  onTab: (clientId: string, shiftKey: boolean) => void;
  loading?: boolean;
  isSaving?: boolean;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

// Anchos fijos por columna (table-layout: fixed)
const COL_WIDTHS = {
  cuenta: 180,
  nombre: undefined, // flex: toma el espacio restante
  areaGestion: 150,
  monto: 170,
  status: 36,
  actions: 70,
} as const;

const headerCellBase = {
  fontSize: "9.5px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "primary.main",
  py: "7px",
  px: "14px",
  whiteSpace: "nowrap" as const,
  borderBottom: "none",
};

const colgroup = (
  <colgroup>
    <col style={{ width: COL_WIDTHS.cuenta }} />
    <col />
    <col style={{ width: COL_WIDTHS.areaGestion }} />
    <col style={{ width: COL_WIDTHS.monto }} />
    <col style={{ width: COL_WIDTHS.status }} />
    <col style={{ width: COL_WIDTHS.actions }} />
  </colgroup>
);

/**
 * Organism: grilla del detalle presupuestario.
 *
 * Sin virtualización — ~250 filas con <td> nativo = ~1,500 DOM elements,
 * bien dentro de lo manejable. Elimina los problemas de:
 *   - Secciones negras al scroll rápido
 *   - Temblor por mount/unmount de filas
 *   - Complejidad de spacers + estimateSize
 *
 * table-layout: fixed + colgroup → anchos estables, sin recálculo.
 */
const PresupuestoGrid = ({
  filas,
  cuentasDisponibles,
  centrosCosto,
  cuentasEnUso,
  discrepanciasMap,
  deleteTargetIds,
  tipoTab,
  searchFilter,
  onCuentaChange,
  onCentroCostoChange,
  onMontoConfirm,
  onRecalcular,
  onEliminar,
  onTab,
  loading = false,
  isSaving = false,
}: PresupuestoGridProps) => {
  const filasFiltradas = useMemo(() => {
    if (!searchFilter.trim()) return filas;
    const q = searchFilter.toLowerCase();
    return filas.filter(
      (f) =>
        f.cuenta?.codigo?.toLowerCase().includes(q) ||
        f.cuenta?.nombre?.toLowerCase().includes(q),
    );
  }, [filas, searchFilter]);

  // Set de descendientes de padres con discrepancia
  const warnChildIds = useMemo(() => {
    const ids = new Set<string>();
    const warnParentCodes: string[] = [];
    for (const [clientId, delta] of discrepanciasMap) {
      if (delta !== null && delta !== 0) {
        const fila = filas.find((f) => f._clientId === clientId);
        if (fila?.cuenta?.codigo) warnParentCodes.push(fila.cuenta.codigo);
      }
    }
    if (warnParentCodes.length === 0) return ids;
    for (const f of filas) {
      if (!f.cuenta?.codigo) continue;
      for (const parentCode of warnParentCodes) {
        if (f.cuenta.codigo !== parentCode && f.cuenta.codigo.startsWith(parentCode)) {
          ids.add(f._clientId);
          break;
        }
      }
    }
    return ids;
  }, [filas, discrepanciasMap]);

  if (filasFiltradas.length === 0 && !loading) {
    return (
      <Box
        sx={{
          py: 8,
          textAlign: "center",
          color: "text.disabled",
          bgcolor: "background.default",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2">
          {searchFilter
            ? "Sin resultados para la búsqueda"
            : `Sin líneas de ${tipoTab}. Use "Agregar línea" para comenzar.`}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* ── Header fijo ── */}
      <Box
        component="table"
        sx={(t) => ({
          width: "100%",
          tableLayout: "fixed",
          borderCollapse: "collapse",
          flexShrink: 0,
          bgcolor: t.meridian.surfaces.s1,
          borderBottom: `2px solid ${t.palette.primary.main}`,
        })}
      >
        {colgroup}
        <thead>
          <tr>
            <Box component="th" sx={{ ...headerCellBase, textAlign: "left" }}>Cuenta</Box>
            <Box component="th" sx={{ ...headerCellBase, textAlign: "left" }}>Nombre Cuenta</Box>
            <Box component="th" sx={{ ...headerCellBase, textAlign: "center" }}>Área Gestión</Box>
            <Box component="th" sx={{ ...headerCellBase, textAlign: "right" }}>Total Anual ($)</Box>
            <th style={{ padding: 0 }} />
            <th style={{ padding: 0 }} />
          </tr>
        </thead>
      </Box>

      {/* ── Body scrollable ── */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflow: "auto",
          bgcolor: "background.default",
        }}
      >
        <table
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
          }}
        >
          {colgroup}
          <tbody>
            {filasFiltradas.map((fila) => (
              <PresupuestoDetalleRow
                key={fila._clientId}
                fila={fila}
                cuentasDisponibles={cuentasDisponibles}
                centrosCosto={centrosCosto}
                cuentasEnUso={cuentasEnUso}
                discrepanciaDelta={discrepanciasMap.get(fila._clientId) ?? null}
                isWarnChild={warnChildIds.has(fila._clientId)}
                isDeleteTarget={deleteTargetIds.has(fila._clientId)}
                tipoTab={tipoTab}
                onCuentaChange={onCuentaChange}
                onCentroCostoChange={onCentroCostoChange}
                onMontoConfirm={onMontoConfirm}
                onRecalcular={onRecalcular}
                onEliminar={onEliminar}
                onTab={onTab}
                loading={isSaving}
              />
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default memo(PresupuestoGrid);
