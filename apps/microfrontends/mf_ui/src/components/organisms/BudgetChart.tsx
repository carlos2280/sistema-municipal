/**
 * Budget Chart - Organismo
 *
 * Grafico de barras de ejecucion presupuestaria con CSS puro
 */

import { Box, Typography, alpha, styled, useTheme } from "@mui/material";
import { fontFamily } from "../../theme/tokens";

// ============================================================================
// TYPES
// ============================================================================

export interface ChartBarData {
  /** Nombre del mes */
  label: string;
  /** Porcentaje 0-100 para la barra de presupuesto */
  budget: number;
  /** Porcentaje 0-100 para la barra de ejecucion */
  executed: number;
}

export interface BudgetChartProps {
  /** Titulo del grafico */
  title: string;
  /** Subtitulo descriptivo */
  subtitle?: string;
  /** Datos de barras por mes */
  data: ChartBarData[];
  /** Resumen inferior */
  summary: {
    budgeted: string;
    executed: string;
    percentage: string;
  };
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const ChartCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12,
  padding: theme.spacing(3),
}));

const ChartHeader = styled(Box)(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexWrap: "wrap",
  gap: 12,
}));

const ChartTitle = styled(Typography)(() => ({
  fontFamily: fontFamily.display,
  fontWeight: 600,
  fontSize: "1rem",
  lineHeight: 1.4,
}));

const ChartSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  marginTop: 2,
}));

const Legend = styled(Box)(() => ({
  display: "flex",
  gap: 16,
  alignItems: "center",
}));

const LegendItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
}));

const LegendDot = styled(Box)(() => ({
  width: 10,
  height: 10,
  borderRadius: 3,
  flexShrink: 0,
}));

const BarsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  gap: 16,
  height: 160,
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    height: 120,
    gap: 10,
  },
}));

const BarGroup = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  gap: 6,
  height: "100%",
}));

const BarPair = styled(Box)(() => ({
  display: "flex",
  alignItems: "flex-end",
  gap: 4,
  flex: 1,
  width: "100%",
  justifyContent: "center",
}));

const Bar = styled(Box, {
  shouldForwardProp: (prop) => prop !== "barHeight",
})<{ barHeight: number }>(({ barHeight }) => ({
  width: "40%",
  maxWidth: 28,
  borderRadius: "4px 4px 0 0",
  height: `${barHeight}%`,
  transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  minHeight: barHeight > 0 ? 4 : 0,
}));

const BarLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.6875rem",
  color: theme.palette.text.disabled,
  textAlign: "center",
  whiteSpace: "nowrap",
}));

const SummaryContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: 24,
  marginTop: theme.spacing(2.5),
  flexWrap: "wrap",
}));

const SummaryItem = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: 2,
}));

const SummaryLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
}));

const SummaryValue = styled(Typography)(() => ({
  fontFamily: fontFamily.mono,
  fontWeight: 700,
  fontSize: "1.125rem",
  letterSpacing: "-0.03em",
  fontVariantNumeric: "tabular-nums",
}));

const SummaryPct = styled(Typography)(({ theme }) => ({
  fontFamily: fontFamily.mono,
  fontWeight: 600,
  fontSize: "0.875rem",
  color: theme.palette.primary.main,
  fontVariantNumeric: "tabular-nums",
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function BudgetChart({ title, subtitle, data, summary }: BudgetChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const budgetColor = isDark ? "rgba(79,70,201,0.25)" : "rgba(55,48,163,0.2)";
  const executedColor = isDark ? "#14b8a6" : "#0d6b5e";
  const legendBudgetDot = isDark ? "rgba(79,70,201,0.5)" : "rgba(55,48,163,0.3)";

  return (
    <ChartCard>
      {/* Header */}
      <ChartHeader>
        <Box>
          <ChartTitle>{title}</ChartTitle>
          {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
        </Box>

        <Legend>
          <LegendItem>
            <LegendDot sx={{ bgcolor: legendBudgetDot }} />
            Presupuestado
          </LegendItem>
          <LegendItem>
            <LegendDot sx={{ bgcolor: executedColor }} />
            Ejecutado
          </LegendItem>
        </Legend>
      </ChartHeader>

      {/* Bars */}
      <BarsContainer>
        {data.map((item) => (
          <BarGroup key={item.label}>
            <BarPair>
              <Bar
                barHeight={item.budget}
                sx={{ bgcolor: budgetColor }}
              />
              <Bar
                barHeight={item.executed}
                sx={{ bgcolor: executedColor }}
              />
            </BarPair>
            <BarLabel>{item.label}</BarLabel>
          </BarGroup>
        ))}
      </BarsContainer>

      {/* Summary */}
      <SummaryContainer>
        <SummaryItem>
          <SummaryLabel>Presupuestado</SummaryLabel>
          <SummaryValue>{summary.budgeted}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Ejecutado</SummaryLabel>
          <SummaryValue>{summary.executed}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Ejecucion</SummaryLabel>
          <SummaryPct>{summary.percentage}</SummaryPct>
        </SummaryItem>
      </SummaryContainer>
    </ChartCard>
  );
}

export default BudgetChart;
