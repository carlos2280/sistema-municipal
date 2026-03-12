import CalculateIcon from "@mui/icons-material/Calculate";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  IconButton,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { keyframes } from "@mui/system";
import { memo, useCallback } from "react";
import type { CentrosCostoItem, CuentaPresupuestaria } from "mf_store/store";
import type { FilaDisplay } from "../../../types/presupuesto.types";
import CentroCostoAutocomplete from "../atoms/CentroCostoAutocomplete";
import CuentaAutocomplete from "../atoms/CuentaAutocomplete";
import DiscrepanciaChip from "../atoms/DiscrepanciaChip";
import MontoInput from "../atoms/MontoInput";

interface PresupuestoDetalleRowProps {
  fila: FilaDisplay;
  cuentasDisponibles: CuentaPresupuestaria[];
  centrosCosto: CentrosCostoItem[];
  cuentasEnUso: number[];
  discrepanciaDelta: number | null;
  tipoTab: "ingresos" | "gastos";
  onCuentaChange: (clientId: string, cuenta: CuentaPresupuestaria | null) => void;
  onCentroCostoChange: (clientId: string, cc: CentrosCostoItem | null) => void;
  onMontoConfirm: (clientId: string, monto: number) => void;
  onObservacionChange: (clientId: string, obs: string) => void;
  onRecalcular: (clientId: string) => void;
  onEliminar: (clientId: string) => void;
  onTab: (clientId: string, shiftKey: boolean) => void;
  loading?: boolean;
}

const NIVEL_INDENT = 20; // px por nivel

const pulseRecalc = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.3); }
  50% { box-shadow: 0 0 0 4px rgba(220, 38, 38, 0); }
`;

/**
 * Molecule: fila de detalle presupuestario.
 * 7 columnas: código | nombre | C.Costo | monto+disc | recalc | observación | delete
 */
const PresupuestoDetalleRow = ({
  fila,
  cuentasDisponibles,
  centrosCosto,
  cuentasEnUso,
  discrepanciaDelta,
  tipoTab,
  onCuentaChange,
  onCentroCostoChange,
  onMontoConfirm,
  onObservacionChange,
  onRecalcular,
  onEliminar,
  onTab,
  loading = false,
}: PresupuestoDetalleRowProps) => {
  const handleMontoConfirm = useCallback(
    (monto: number) => onMontoConfirm(fila._clientId, monto),
    [fila._clientId, onMontoConfirm],
  );

  const handleTab = useCallback(
    (shiftKey: boolean) => onTab(fila._clientId, shiftKey),
    [fila._clientId, onTab],
  );

  const showPicker = !fila.cuentaId;
  const hasDiscrepancia = discrepanciaDelta !== null && discrepanciaDelta !== 0;
  const isParent = discrepanciaDelta !== null; // tiene hijos → es padre

  // Estilos según nivel y discrepancia
  const isChild = fila.nivel > 0;
  const leftPad = 1 + fila.nivel * (NIVEL_INDENT / 8); // en unidades MUI spacing

  return (
    <TableRow
      sx={{
        bgcolor: hasDiscrepancia ? "rgba(220, 38, 38, 0.03)" : isChild ? "transparent" : "background.paper",
        fontWeight: isChild ? 400 : 600,
        borderLeft: hasDiscrepancia ? "3px solid" : "3px solid transparent",
        borderLeftColor: hasDiscrepancia ? "error.main" : "transparent",
        "& td": {
          borderBottomColor: isChild ? "divider" : "rgba(0,0,0,0.15)",
          color: isChild ? "text.secondary" : "text.primary",
        },
        "&:hover": { bgcolor: hasDiscrepancia ? "rgba(220, 38, 38, 0.05)" : "rgba(13, 107, 94, 0.03)" },
        "& .delete-btn": { opacity: 0 },
        "&:hover .delete-btn": { opacity: 1 },
        transition: "background-color 0.1s",
      }}
    >
      {/* Col 1: Código */}
      <TableCell sx={{ py: 0.75, pl: leftPad, pr: 1, width: 100 }}>
        {showPicker ? (
          <CuentaAutocomplete
            value={fila.cuenta ?? null}
            options={cuentasDisponibles}
            excludeIds={cuentasEnUso}
            tipo={tipoTab === "ingresos" ? "ingreso" : "gasto"}
            onChange={(c) => onCuentaChange(fila._clientId, c)}
            autoFocus
            size="small"
          />
        ) : (
          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              fontWeight: 600,
              color: isChild ? "text.disabled" : "primary.dark",
              fontSize: "0.75rem",
              letterSpacing: "0.02em",
            }}
          >
            {fila.cuenta?.codigo}
          </Typography>
        )}
      </TableCell>

      {/* Col 2: Nombre */}
      <TableCell sx={{ py: 0.75, px: 1 }}>
        {showPicker ? (
          <Typography variant="caption" sx={{ color: "text.disabled", fontStyle: "italic" }}>
            {fila.cuenta?.nombre ?? ""}
          </Typography>
        ) : (
          <Typography
            variant="caption"
            sx={{
              color: isChild ? "text.secondary" : "text.primary",
              fontWeight: isChild ? 400 : 600,
              fontSize: "0.8125rem",
            }}
          >
            {fila.cuenta?.nombre}
          </Typography>
        )}
      </TableCell>

      {/* Col 3: Centro de Costo */}
      <TableCell sx={{ py: 0.75, px: 1, textAlign: "center", width: 80 }}>
        {fila.isNew ? (
          <CentroCostoAutocomplete
            value={fila.centroCosto ?? null}
            options={centrosCosto}
            onChange={(cc) => onCentroCostoChange(fila._clientId, cc)}
            size="small"
          />
        ) : fila.centroCosto?.codigo ? (
          <Box
            component="span"
            sx={{
              display: "inline-block",
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: "grey.100",
              fontFamily: "monospace",
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "text.secondary",
              letterSpacing: "0.02em",
            }}
          >
            {fila.centroCosto.codigo}
          </Box>
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        )}
      </TableCell>

      {/* Col 4: Monto + indicador discrepancia inline */}
      <TableCell sx={{ py: 0.75, px: 1, textAlign: "right", width: 180 }}>
        <Box
          data-monto-id={fila._clientId}
          sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.75 }}
        >
          <MontoInput
            value={fila.montoAnual}
            onConfirm={handleMontoConfirm}
            onTab={handleTab}
            readOnly={showPicker}
            hasError={hasDiscrepancia}
          />
          {isParent && (
            <Box sx={{ flexShrink: 0 }}>
              <DiscrepanciaChip delta={discrepanciaDelta} />
            </Box>
          )}
        </Box>
      </TableCell>

      {/* Col 5: Botón recalcular (solo filas padre) */}
      <TableCell sx={{ py: 0.75, px: 0.5, textAlign: "center", width: 50 }}>
        {isParent && (
          <Tooltip title="Recalcular desde subcuentas" arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => onRecalcular(fila._clientId)}
                disabled={loading}
                sx={{
                  width: 28,
                  height: 28,
                  border: "1px solid",
                  borderColor: hasDiscrepancia ? "error.main" : "divider",
                  color: hasDiscrepancia ? "error.main" : "text.disabled",
                  borderRadius: "6px",
                  bgcolor: "background.paper",
                  animation: hasDiscrepancia ? `${pulseRecalc} 2s infinite` : "none",
                  "&:hover": {
                    borderColor: "primary.main",
                    color: "primary.main",
                    bgcolor: "rgba(13, 107, 94, 0.06)",
                    animation: "none",
                  },
                }}
              >
                <CalculateIcon sx={{ fontSize: "0.8125rem" }} />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </TableCell>

      {/* Col 6: Observación */}
      <TableCell sx={{ py: 0.5, px: 1, width: 140 }}>
        <TextField
          value={fila.observacion ?? ""}
          onChange={(e) => onObservacionChange(fila._clientId, e.target.value)}
          placeholder="Obs..."
          size="small"
          variant="standard"
          slotProps={{
            input: { disableUnderline: true },
            htmlInput: { maxLength: 200, style: { fontSize: "0.75rem" } },
          }}
          sx={{ width: "100%" }}
        />
      </TableCell>

      {/* Col 7: Eliminar */}
      <TableCell sx={{ py: 0.75, px: 0.5, textAlign: "center", width: 60 }}>
        <Tooltip title="Eliminar línea" arrow>
          <IconButton
            size="small"
            className="delete-btn"
            onClick={() => onEliminar(fila._clientId)}
            disabled={loading}
            sx={{
              width: 26,
              height: 26,
              color: "error.light",
              borderRadius: "4px",
              transition: "all 0.1s",
              "&:hover": { bgcolor: "rgba(220, 38, 38, 0.08)" },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: "0.8125rem" }} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default memo(PresupuestoDetalleRow);
