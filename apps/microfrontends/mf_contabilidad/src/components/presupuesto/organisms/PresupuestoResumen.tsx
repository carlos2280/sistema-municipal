import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import BalanceIcon from "@mui/icons-material/Balance";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import type { EquilibrioState, FilaDetalle } from "../../../types/presupuesto.types";
import { formatCLP } from "../atoms/MontoInput";

interface PresupuestoResumenProps {
  filasIngresos: FilaDetalle[];
  filasGastos: FilaDetalle[];
  equilibrio: EquilibrioState;
}

interface ResumenGrupo {
  codigo: string;
  nombre: string;
  total: number;
}

interface ResumenCC {
  codigo: string;
  nombre: string;
  ingresos: number;
  gastos: number;
  saldo: number;
}

const sumarFilasRaiz = (filas: FilaDetalle[]): ResumenGrupo[] => {
  const grupos = new Map<string, ResumenGrupo>();
  for (const f of filas) {
    if (!f.cuenta || f.cuenta.parentId !== null) continue;
    const key = f.cuenta.codigo;
    const existing = grupos.get(key);
    if (existing) {
      existing.total += f.montoAnual;
    } else {
      grupos.set(key, { codigo: f.cuenta.codigo, nombre: f.cuenta.nombre, total: f.montoAnual });
    }
  }
  return Array.from(grupos.values()).sort((a, b) => a.codigo.localeCompare(b.codigo));
};

const agruparPorCC = (filasIngresos: FilaDetalle[], filasGastos: FilaDetalle[]): ResumenCC[] => {
  const map = new Map<string, ResumenCC>();
  const add = (filas: FilaDetalle[], tipo: "ingresos" | "gastos") => {
    for (const f of filas) {
      const key = f.centroCosto?.codigo ?? "(sin C.Costo)";
      const nombre = f.centroCosto?.nombre ?? "Sin Centro de Costo";
      if (!map.has(key)) map.set(key, { codigo: key, nombre, ingresos: 0, gastos: 0, saldo: 0 });
      const e = map.get(key)!;
      if (tipo === "ingresos") e.ingresos += f.montoAnual;
      else e.gastos += f.montoAnual;
    }
  };
  add(filasIngresos, "ingresos");
  add(filasGastos, "gastos");
  for (const e of map.values()) e.saldo = e.ingresos - e.gastos;
  return Array.from(map.values()).sort((a, b) => a.codigo.localeCompare(b.codigo));
};

// ── Sub-componente: card genérico del resumen ──────────────────────────────────
const ResumenCard = ({
  icon,
  iconBg,
  iconColor,
  title,
  rows,
  totalLabel,
  totalValue,
  totalColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  rows: ResumenGrupo[];
  totalLabel: string;
  totalValue: number;
  totalColor: string;
}) => (
  <Box
    sx={{
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      overflow: "hidden",
    }}
  >
    {/* Header */}
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderBottom: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 0.75,
          bgcolor: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{ fontSize: "0.875rem", fontWeight: 700, color: "text.primary" }}
      >
        {title}
      </Typography>
    </Box>

    {/* Body */}
    <Box sx={{ px: 2, py: 1.5 }}>
      {rows.map((g, i) => (
        <Box
          key={g.codigo}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 0.875,
            borderTop: i === 0 ? "none" : "1px solid rgba(226, 232, 240, 0.5)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              fontWeight: 600,
              color: "text.disabled",
              mr: 1,
              minWidth: 52,
              fontSize: "0.75rem",
            }}
          >
            {g.codigo}
          </Typography>
          <Typography variant="caption" sx={{ flex: 1, color: "text.secondary", fontWeight: 450 }}>
            {g.nombre}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontFamily: "monospace", fontWeight: 600, ml: 2, fontSize: "0.8125rem", color: "text.primary" }}
          >
            {formatCLP(g.total)}
          </Typography>
        </Box>
      ))}
    </Box>

    {/* Total row */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        bgcolor: "grey.50",
        borderTop: "2px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: "text.primary" }}
      >
        {totalLabel}
      </Typography>
      <Typography
        sx={{
          fontFamily: "monospace",
          fontSize: "1rem",
          fontWeight: 800,
          letterSpacing: "-0.01em",
          color: totalColor,
        }}
      >
        ${formatCLP(totalValue)}
      </Typography>
    </Box>
  </Box>
);

/**
 * Organism: tab de Resumen/Equilibrio presupuestario.
 * Diseño idéntico al prototipo: 2 columnas (Ingresos/Gastos) + cards full-width (Equilibrio + C.Costo).
 */
const PresupuestoResumen = ({
  filasIngresos,
  filasGastos,
  equilibrio,
}: PresupuestoResumenProps) => {
  const gruposIngresos = useMemo(() => sumarFilasRaiz(filasIngresos), [filasIngresos]);
  const gruposGastos = useMemo(() => sumarFilasRaiz(filasGastos), [filasGastos]);
  const porCC = useMemo(() => agruparPorCC(filasIngresos, filasGastos), [filasIngresos, filasGastos]);

  const { totalIngresos, totalGastos, diferencia, estado } = equilibrio;
  const isOk = estado === "ok";
  const isWarning = estado === "warning";

  return (
    <Box
      sx={{
        px: 3,
        py: 3,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 2.5,
        maxWidth: 960,
      }}
    >
      {/* Card Ingresos */}
      <ResumenCard
        icon={<ArrowDownwardIcon sx={{ fontSize: "1rem" }} />}
        iconBg="rgba(5, 150, 105, 0.1)"
        iconColor="#059669"
        title="Ingresos"
        rows={gruposIngresos}
        totalLabel="Total Ingresos"
        totalValue={totalIngresos}
        totalColor="success.dark"
      />

      {/* Card Gastos */}
      <ResumenCard
        icon={<ArrowUpwardIcon sx={{ fontSize: "1rem" }} />}
        iconBg="rgba(220, 38, 38, 0.1)"
        iconColor="#dc2626"
        title="Gastos"
        rows={gruposGastos}
        totalLabel="Total Gastos"
        totalValue={totalGastos}
        totalColor="error.dark"
      />

      {/* Card Equilibrio — full width */}
      <Box
        sx={{
          gridColumn: { xs: "1", md: "1 / -1" },
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 0.75, bgcolor: "rgba(13, 107, 94, 0.1)", color: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BalanceIcon sx={{ fontSize: "1rem" }} />
          </Box>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "text.primary" }}>
            Equilibrio Presupuestario
          </Typography>
        </Box>

        {/* Body */}
        <Box sx={{ px: 2, py: 2 }}>
          {/* Ingresos = Gastos */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: 3,
              alignItems: "center",
              pb: 2,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", display: "block", mb: 0.5 }}>
                Total Ingresos
              </Typography>
              <Typography sx={{ fontFamily: "monospace", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: "success.dark" }}>
                ${formatCLP(totalIngresos)}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.disabled", fontSize: "0.75rem" }}>
              =
            </Typography>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", display: "block", mb: 0.5 }}>
                Total Gastos
              </Typography>
              <Typography sx={{ fontFamily: "monospace", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: "error.dark" }}>
                ${formatCLP(totalGastos)}
              </Typography>
            </Box>
          </Box>

          {/* Diferencia */}
          <Box
            sx={{
              textAlign: "center",
              pt: 2,
              borderTop: "2px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", display: "block", mb: 1 }}>
              Diferencia
            </Typography>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                fontFamily: "monospace",
                fontSize: "1.5rem",
                fontWeight: 800,
                px: 3,
                py: 1,
                borderRadius: 2,
                bgcolor: isOk ? "rgba(5, 150, 105, 0.06)" : isWarning ? "rgba(234, 179, 8, 0.06)" : "rgba(220, 38, 38, 0.06)",
                color: isOk ? "success.main" : isWarning ? "#b45309" : "error.main",
              }}
            >
              {isOk ? (
                <CheckCircleOutlineIcon sx={{ fontSize: "1.25rem" }} />
              ) : (
                <WarningAmberIcon sx={{ fontSize: "1.25rem" }} />
              )}
              {diferencia > 0 ? "+" : ""}${formatCLP(diferencia)}
            </Box>
            {!isOk && (
              <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", fontStyle: "italic" }}>
                {isWarning
                  ? "Existen discrepancias padre/hijo pendientes de recalcular."
                  : diferencia < 0
                    ? "Gastos superan ingresos. Ajuste las partidas para equilibrar."
                    : "Ingresos superan gastos. Ajuste las partidas para equilibrar."}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Card Distribución por Centro de Costo — full width */}
      <Box
        sx={{
          gridColumn: { xs: "1", md: "1 / -1" },
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 0.75, bgcolor: "rgba(37, 99, 235, 0.1)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BusinessIcon sx={{ fontSize: "1rem" }} />
          </Box>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "text.primary" }}>
            Distribución por Centro de Costo
          </Typography>
        </Box>

        {/* Tabla */}
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
          <Box component="thead">
            <Box component="tr">
              {["Centro de Costo", "Ingresos", "Gastos", "Saldo"].map((h, i) => (
                <Box
                  key={h}
                  component="th"
                  sx={{
                    px: 2,
                    py: 1,
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "text.disabled",
                    textAlign: i === 0 ? "left" : "right",
                  }}
                >
                  {h}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {porCC.map((cc) => (
              <Box
                key={cc.codigo}
                component="tr"
                sx={{ "&:hover": { bgcolor: "rgba(13, 107, 94, 0.03)" }, "& td": { borderBottom: "1px solid", borderColor: "divider" } }}
              >
                <Box component="td" sx={{ px: 2, py: 1, color: "text.primary", verticalAlign: "middle" }}>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      px: 1,
                      py: 0.25,
                      mr: 1,
                      borderRadius: 0.5,
                      bgcolor: "grey.100",
                      fontFamily: "monospace",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: "text.secondary",
                    }}
                  >
                    {cc.codigo}
                  </Box>
                  <Typography component="span" variant="caption" color="text.secondary">
                    {cc.nombre}
                  </Typography>
                </Box>
                <Box component="td" sx={{ px: 2, py: 1, textAlign: "right", fontFamily: "monospace", fontSize: "0.8125rem", color: "success.dark" }}>
                  {formatCLP(cc.ingresos)}
                </Box>
                <Box component="td" sx={{ px: 2, py: 1, textAlign: "right", fontFamily: "monospace", fontSize: "0.8125rem", color: "error.dark" }}>
                  {formatCLP(cc.gastos)}
                </Box>
                <Box
                  component="td"
                  sx={{
                    px: 2,
                    py: 1,
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: cc.saldo >= 0 ? "success.dark" : "error.dark",
                  }}
                >
                  {cc.saldo > 0 ? "+" : ""}
                  {formatCLP(cc.saldo)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PresupuestoResumen;
