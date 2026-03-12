import CalculateIcon from "@mui/icons-material/Calculate";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Button, Typography } from "@mui/material";

interface DiscrepanciaBannerProps {
  count: number;
  onRecalcularTodo: () => void;
  loading?: boolean;
}

/**
 * Molecule: banner de advertencia de discrepancias padre/hijo.
 * Diseño idéntico al prototipo: fondo amarillo suave, texto naranja, botón "Recalcular todo".
 */
const DiscrepanciaBanner = ({ count, onRecalcularTodo, loading = false }: DiscrepanciaBannerProps) => {
  if (count === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        py: 1,
        bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(245, 158, 11, 0.08)" : "rgba(234, 179, 8, 0.08)",
        borderBottom: "1px solid",
        borderColor: "warning.main",
        gap: 2,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <WarningAmberIcon sx={{ fontSize: "1rem", color: "warning.dark" }} />
        <Typography variant="body2" sx={{ color: "warning.dark", fontWeight: 500 }}>
          <strong>{count}</strong> discrepancia{count > 1 ? "s" : ""} detectada{count > 1 ? "s" : ""}{" "}
          — la suma de subcuentas no coincide con la cuenta padre
        </Typography>
      </Box>
      <Button
        size="small"
        startIcon={<CalculateIcon sx={{ fontSize: "0.875rem" }} />}
        onClick={onRecalcularTodo}
        disabled={loading}
        sx={{
          flexShrink: 0,
          bgcolor: "action.selected",
          color: "warning.dark",
          border: "1px solid",
          borderColor: "warning.main",
          fontWeight: 600,
          whiteSpace: "nowrap",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        Recalcular todo
      </Button>
    </Box>
  );
};

export default DiscrepanciaBanner;
