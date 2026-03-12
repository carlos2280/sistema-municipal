import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Typography } from "@mui/material";
import { formatCLP } from "./MontoInput";

interface DiscrepanciaChipProps {
  /** null = sin hijos (no mostrar nada) | 0 = OK | !=0 = discrepancia */
  delta: number | null;
}

/**
 * Atom: indicador inline de discrepancia para la celda de monto.
 * El botón recalcular es independiente (columna aparte en la fila).
 */
const DiscrepanciaChip = ({ delta }: DiscrepanciaChipProps) => {
  if (delta === null) return null;

  if (delta === 0) {
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", color: "success.main" }}>
        <CheckCircleOutlineIcon sx={{ fontSize: "0.875rem" }} />
      </Box>
    );
  }

  const signo = delta > 0 ? "+" : "";
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}>
      <WarningAmberIcon sx={{ fontSize: "0.875rem", color: "error.main" }} />
      <Typography
        variant="caption"
        sx={{
          fontFamily: "monospace",
          fontWeight: 700,
          color: "error.main",
          fontSize: "0.6875rem",
          whiteSpace: "nowrap",
        }}
      >
        {signo}{formatCLP(delta)}
      </Typography>
    </Box>
  );
};

export default DiscrepanciaChip;
