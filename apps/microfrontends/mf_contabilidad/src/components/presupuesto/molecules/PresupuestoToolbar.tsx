import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, CircularProgress, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";

interface PresupuestoToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAgregarLinea: () => void;
  onImportar?: () => void;
  onExportar?: () => void;
  disabled?: boolean;
  loadingCuentas?: boolean;
}

/**
 * Molecule: barra de herramientas.
 * Orden: Search | sep | Agregar línea | Importar | Exportar
 */
const PresupuestoToolbar = ({
  searchValue,
  onSearchChange,
  onAgregarLinea,
  onImportar,
  onExportar,
  disabled = false,
  loadingCuentas = false,
}: PresupuestoToolbarProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 3,
      py: 1.5,
      bgcolor: "background.paper",
      borderBottom: "1px solid",
      borderColor: "divider",
    }}
  >
    {/* Búsqueda */}
    <Box sx={{ position: "relative", flex: "0 1 320px" }}>
      <TextField
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar cuenta o nombre..."
        size="small"
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: "0.9375rem", color: "text.disabled" }} />
              </InputAdornment>
            ),
          },
          htmlInput: { "aria-label": "Buscar en detalle" },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            fontSize: "0.8125rem",
            "&:hover fieldset": { borderColor: "primary.main" },
            "&.Mui-focused fieldset": { borderColor: "primary.main", boxShadow: "0 0 0 3px rgba(13,107,94,0.1)" },
          },
        }}
      />
    </Box>

    {/* Separador */}
    <Box sx={{ width: "1px", height: 20, bgcolor: "divider", flexShrink: 0 }} />

    {/* Agregar línea — primero y con color primario */}
    <Button
      size="small"
      variant="contained"
      startIcon={<AddIcon sx={{ fontSize: "0.875rem" }} />}
      onClick={onAgregarLinea}
      disabled={disabled}
      sx={{ whiteSpace: "nowrap", fontWeight: 600 }}
    >
      Agregar línea
    </Button>

    {/* Importar */}
    <Tooltip
      title={
        loadingCuentas
          ? "Cargando cuentas presupuestarias..."
          : onImportar
            ? "Importar desde Excel (.xlsx)"
            : "Importar desde Excel (próximamente)"
      }
      arrow
    >
      <span>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={
            loadingCuentas
              ? <CircularProgress size={14} color="inherit" />
              : <FileUploadIcon sx={{ fontSize: "0.875rem" }} />
          }
          onClick={onImportar}
          disabled={disabled || !onImportar || loadingCuentas}
          sx={{ whiteSpace: "nowrap", color: "text.secondary", borderColor: "divider" }}
        >
          Importar
        </Button>
      </span>
    </Tooltip>

    {loadingCuentas && (
      <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: "nowrap" }}>
        Cargando cuentas...
      </Typography>
    )}

    {/* Exportar */}
    <Tooltip title="Exportar a Excel (próximamente)" arrow>
      <span>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<FileDownloadIcon sx={{ fontSize: "0.875rem" }} />}
          onClick={onExportar}
          disabled={disabled || !onExportar}
          sx={{ whiteSpace: "nowrap", color: "text.secondary", borderColor: "divider" }}
        >
          Exportar
        </Button>
      </span>
    </Tooltip>
  </Box>
);

export default PresupuestoToolbar;
