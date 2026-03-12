import TableChartIcon from "@mui/icons-material/TableChart";
import {
  Box,
  Collapse,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import type { SchemaPresupuestoHeader } from "../../../types/zod/presupuesto.zod";

interface PresupuestoHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  numero: number | null;
  anosDisponibles: number[];
  readonly?: boolean;
}

/**
 * Molecule: encabezado del documento presupuestario.
 * Muestra icono + título (glosa) + número en la parte superior,
 * y el formulario de campos debajo (colapsable desde el page header).
 */
const PresupuestoHeader = ({
  collapsed,
  numero,
  anosDisponibles,
  readonly = false,
}: PresupuestoHeaderProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<SchemaPresupuestoHeader>();

  const glosa = watch("glosa");

  return (
    <Collapse in={!collapsed} timeout="auto" sx={{ flexShrink: 0 }}>
      <Box
        sx={{
          mx: 3,
          my: 2,
          p: 2.5,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        {/* Top: icono + título + número */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: "rgba(13, 107, 94, 0.08)",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TableChartIcon sx={{ fontSize: "1.25rem" }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "-0.01em",
                color: "text.primary",
                lineHeight: 1.2,
              }}
            >
              {glosa || "Presupuesto Inicial"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: "monospace", fontWeight: 600, color: "text.secondary" }}
            >
              N.{" "}
              {numero !== null ? String(numero).padStart(3, "0") : "---"}
            </Typography>
          </Box>
        </Box>

        {/* Formulario — fila 1: Año / Número / N. Acta, fila 2: Glosa */}
        <Grid container spacing={2} alignItems="flex-start">
          {/* Año Contable */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}
            >
              Año Contable <span style={{ color: "#e53935" }}>*</span>
            </Typography>
            <Controller
              name="anoContable"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  size="small"
                  fullWidth
                  disabled={readonly}
                  error={!!errors.anoContable}
                  sx={{ fontSize: "0.8125rem", fontFamily: "monospace" }}
                >
                  {anosDisponibles.map((ano) => (
                    <MenuItem key={ano} value={ano}>
                      {ano}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Grid>

          {/* Número (readonly) */}
          <Grid size={{ xs: 6, md: 2.5 }}>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}
            >
              Número
            </Typography>
            <TextField
              value={numero !== null ? String(numero).padStart(3, "0") : "(nuevo)"}
              size="small"
              fullWidth
              disabled
              slotProps={{ htmlInput: { style: { fontFamily: "monospace", fontWeight: 600 } } }}
            />
          </Grid>

          {/* N° Acta/Decreto */}
          <Grid size={{ xs: 12, md: 6.5 }}>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}
            >
              N. Acta / Decreto
            </Typography>
            <Controller
              name="actaDecreto"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  placeholder="Referencia del acto administrativo"
                  disabled={readonly}
                  error={!!errors.actaDecreto}
                  helperText={errors.actaDecreto?.message}
                  slotProps={{ htmlInput: { maxLength: 100, style: { fontSize: "0.8125rem" } } }}
                />
              )}
            />
          </Grid>

          {/* Glosa — fila propia, ancho completo */}
          <Grid size={12}>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}
            >
              Glosa <span style={{ color: "#e53935" }}>*</span>
            </Typography>
            <Controller
              name="glosa"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  placeholder="Descripción del documento"
                  disabled={readonly}
                  error={!!errors.glosa}
                  helperText={errors.glosa?.message}
                  slotProps={{ htmlInput: { maxLength: 255, style: { fontSize: "0.8125rem" } } }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Collapse>
  );
};

export default PresupuestoHeader;
