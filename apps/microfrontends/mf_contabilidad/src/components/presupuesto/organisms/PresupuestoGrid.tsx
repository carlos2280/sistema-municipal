import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useCallback, useMemo, useRef } from "react";
import type {
  CentrosCostoItem,
  CuentaPresupuestaria,
  EquilibrioState,
  FilaDisplay,
} from "../../../types/presupuesto.types";
import { formatCLP } from "../atoms/MontoInput";
import EquilibrioIndicator from "../atoms/EquilibrioIndicator";
import PresupuestoDetalleRow from "../molecules/PresupuestoDetalleRow";

interface PresupuestoGridProps {
  filas: FilaDisplay[];
  cuentasDisponibles: CuentaPresupuestaria[];
  centrosCosto: CentrosCostoItem[];
  cuentasEnUso: number[];
  discrepanciasMap: Map<string, number | null>;
  equilibrio: EquilibrioState;
  totalTab: number;
  tipoTab: "ingresos" | "gastos";
  searchFilter: string;
  onCuentaChange: (clientId: string, cuenta: CuentaPresupuestaria | null) => void;
  onCentroCostoChange: (clientId: string, cc: CentrosCostoItem | null) => void;
  onMontoConfirm: (clientId: string, monto: number) => void;
  onObservacionChange: (clientId: string, obs: string) => void;
  onRecalcular: (clientId: string) => void;
  onEliminar: (clientId: string) => void;
  onTab: (clientId: string, shiftKey: boolean) => void;
  loading?: boolean;
  isSaving?: boolean;
}

const ROW_HEIGHT = 40; // altura estimada por fila

/**
 * Organism: grilla virtualizada del detalle presupuestario.
 * Solo renderiza las filas visibles (~15-20) en lugar de todas (~250).
 */
const PresupuestoGrid = ({
  filas,
  cuentasDisponibles,
  centrosCosto,
  cuentasEnUso,
  discrepanciasMap,
  equilibrio,
  totalTab,
  tipoTab,
  searchFilter,
  onCuentaChange,
  onCentroCostoChange,
  onMontoConfirm,
  onObservacionChange,
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

  const etiquetaTotal = tipoTab === "ingresos" ? "Total Ingresos" : "Total Gastos";
  const colorTotal = tipoTab === "ingresos" ? "success.dark" : "error.dark";

  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filasFiltradas.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: useCallback(() => ROW_HEIGHT, []),
    overscan: 8,
  });

  if (filasFiltradas.length === 0 && !loading) {
    return (
      <Box
        sx={{
          py: 8,
          textAlign: "center",
          color: "text.disabled",
          bgcolor: "grey.50",
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

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <Box>
      <TableContainer
        ref={scrollRef}
        sx={{
          maxHeight: "clamp(320px, 55vh, 640px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
          overflow: "auto",
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 100, bgcolor: "background.paper", borderBottom: "2px solid", borderColor: "divider", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", py: 1 }}>
                Cuenta
              </TableCell>
              <TableCell sx={{ bgcolor: "background.paper", borderBottom: "2px solid", borderColor: "divider", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", py: 1 }}>
                Nombre Cuenta
              </TableCell>
              <TableCell sx={{ width: 80, textAlign: "center", bgcolor: "background.paper", borderBottom: "2px solid", borderColor: "divider", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", py: 1 }}>
                C. Costo
              </TableCell>
              <TableCell sx={{ width: 180, textAlign: "right", bgcolor: "background.paper", borderBottom: "2px solid", borderColor: "divider", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", py: 1 }}>
                Total Anual ($)
              </TableCell>
              <TableCell sx={{ width: 50, bgcolor: "background.paper", borderBottom: "2px solid", borderColor: "divider", py: 1 }} />
              <TableCell sx={{ width: 140, bgcolor: "background.paper", borderBottom: "2px solid", borderColor: "divider", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", py: 1 }}>
                Observación
              </TableCell>
              <TableCell sx={{ width: 60, bgcolor: "background.paper", borderBottom: "2px solid", borderColor: "divider", py: 1 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Spacer superior para virtualización */}
            {virtualItems.length > 0 && virtualItems[0].start > 0 && (
              <tr><td colSpan={7} style={{ height: virtualItems[0].start, padding: 0, border: 0 }} /></tr>
            )}

            {virtualItems.map((virtualRow) => {
              const fila = filasFiltradas[virtualRow.index];
              return (
                <PresupuestoDetalleRow
                  key={fila._clientId}
                  fila={fila}
                  cuentasDisponibles={cuentasDisponibles}
                  centrosCosto={centrosCosto}
                  cuentasEnUso={cuentasEnUso}
                  discrepanciaDelta={discrepanciasMap.get(fila._clientId) ?? null}
                  tipoTab={tipoTab}
                  onCuentaChange={onCuentaChange}
                  onCentroCostoChange={onCentroCostoChange}
                  onMontoConfirm={onMontoConfirm}
                  onObservacionChange={onObservacionChange}
                  onRecalcular={onRecalcular}
                  onEliminar={onEliminar}
                  onTab={onTab}
                  loading={isSaving}
                />
              );
            })}

            {/* Spacer inferior para virtualización */}
            {virtualItems.length > 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    height: totalSize - (virtualItems[virtualItems.length - 1].end),
                    padding: 0,
                    border: 0,
                  }}
                />
              </tr>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Barra de totales */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 1.5,
          bgcolor: "background.paper",
          borderTop: "2px solid",
          borderColor: "rgba(0,0,0,0.12)",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "text.secondary",
              }}
            >
              {etiquetaTotal}
            </Typography>
            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: "1rem",
                fontWeight: 700,
                color: colorTotal,
                letterSpacing: "-0.01em",
              }}
            >
              ${formatCLP(totalTab)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "text.secondary" }}
            >
              Líneas
            </Typography>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.875rem", fontWeight: 700 }}>
              {filasFiltradas.length}
            </Typography>
          </Box>
        </Box>

        <EquilibrioIndicator
          estado={equilibrio.estado}
          diferencia={equilibrio.diferencia}
          discrepanciasPendientes={equilibrio.discrepanciasPendientes}
          compact
        />
      </Box>
    </Box>
  );
};

export default memo(PresupuestoGrid);
