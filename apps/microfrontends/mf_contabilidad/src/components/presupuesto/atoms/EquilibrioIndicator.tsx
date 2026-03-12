import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Tooltip, Typography } from "@mui/material";
import type { EstadoEquilibrio } from "../../../types/presupuesto.types";
import { formatCLP } from "./MontoInput";

interface EquilibrioIndicatorProps {
  estado: EstadoEquilibrio;
  diferencia: number;
  discrepanciasPendientes: number;
  compact?: boolean;
}

const CONFIG = {
  ok: {
    color: "success.main",
    Icon: CheckCircleOutlineIcon,
    label: "Equilibrio OK",
    tooltip: "Ingresos = Gastos y sin discrepancias",
  },
  error: {
    color: "error.main",
    Icon: ErrorOutlineIcon,
    label: "Desequilibrio",
    tooltip: "Los totales de Ingresos y Gastos no coinciden",
  },
  warning: {
    color: "warning.main",
    Icon: WarningAmberIcon,
    label: "Discrepancias",
    tooltip: "Hay discrepancias padre/hijo pendientes de resolver",
  },
};

/**
 * Atom: indicador visual del estado de equilibrio del presupuesto.
 * Tres estados: ok | error | warning
 */
const EquilibrioIndicator = ({
  estado,
  diferencia,
  discrepanciasPendientes,
  compact = false,
}: EquilibrioIndicatorProps) => {
  const { color, Icon, label, tooltip } = CONFIG[estado];

  const subtitle =
    estado === "warning"
      ? `${discrepanciasPendientes} discrepancia${discrepanciasPendientes > 1 ? "s" : ""} pendiente${discrepanciasPendientes > 1 ? "s" : ""}`
      : estado === "error"
        ? `Diferencia: ${diferencia > 0 ? "+" : ""}${formatCLP(diferencia)}`
        : "";

  return (
    <Tooltip title={tooltip} arrow>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          color,
          cursor: "default",
        }}
      >
        <Icon sx={{ fontSize: compact ? "1rem" : "1.25rem" }} />
        {!compact && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color, display: "block", lineHeight: 1.2 }}>
              {label}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color, display: "block", lineHeight: 1.2, opacity: 0.8 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default EquilibrioIndicator;
