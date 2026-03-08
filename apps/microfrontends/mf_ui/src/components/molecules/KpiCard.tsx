/**
 * KPI Card - Molécula
 *
 * Tarjeta de indicador clave de rendimiento (KPI) para dashboards,
 * con soporte para tendencia, barra de progreso y variante destacada.
 */

import {
  Box,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
  keyframes,
  styled,
  useTheme,
} from "@mui/material";
import type { ReactNode } from "react";

// ============================================================================
// ANIMATIONS
// ============================================================================

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ============================================================================
// TYPES
// ============================================================================

type IconColorVariant = "jade" | "green" | "red" | "blue";

interface KpiCardProps {
  /** Etiqueta descriptiva del KPI */
  label: string;
  /** Valor principal a mostrar */
  value: string;
  /** Icono del KPI */
  icon: ReactNode;
  /** Color de fondo del icono */
  iconColor?: IconColorVariant;
  /** Tendencia del KPI */
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  /** Texto descriptivo de la tendencia */
  trendLabel?: string;
  /** Barra de progreso opcional */
  progress?: { value: number; label: string };
  /** Variante destacada con sombra especial */
  featured?: boolean;
  /** Delay de animación para entrada escalonada (en ms) */
  animationDelay?: number;
}

// ============================================================================
// COLOR MAPS
// ============================================================================

const iconColorMap: Record<IconColorVariant, string> = {
  jade: "#059669",
  green: "#16a34a",
  red: "#dc2626",
  blue: "#2563eb",
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledPaper = styled(Paper, {
  shouldForwardProp: (prop) =>
    !["featured", "animationDelay"].includes(prop as string),
})<{ featured?: boolean; animationDelay?: number }>(
  ({ theme, featured, animationDelay }) => ({
    padding: theme.spacing(3),
    borderRadius: Number(theme.shape.borderRadius) + 4,
    border: `1px solid ${theme.palette.divider}`,
    transition: "all 0.3s ease",
    animation: `${fadeInUp} 0.4s ease-out`,
    animationDelay: animationDelay ? `${animationDelay}ms` : undefined,
    animationFillMode: animationDelay ? "both" : undefined,
    cursor: "default",
    ...(featured && {
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
      borderColor: alpha(theme.palette.primary.main, 0.25),
    }),
    "&:hover": {
      boxShadow: featured
        ? `0 8px 30px ${alpha(theme.palette.primary.main, 0.2)}`
        : theme.shadows[4],
      borderColor: alpha(theme.palette.primary.main, 0.2),
      transform: "translateY(-2px)",
    },
  }),
);

const IconBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "iconColor",
})<{ iconColor: string }>(({ theme, iconColor }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: alpha(iconColor, 0.12),
  color: iconColor,
  flexShrink: 0,
  "& > svg": {
    width: 20,
    height: 20,
  },
}));

const ValueText = styled(Typography)(() => ({
  fontFamily: '"JetBrains Mono", monospace',
  fontWeight: 800,
  fontSize: "2rem",
  letterSpacing: "-0.04em",
  lineHeight: 1.2,
  fontVariantNumeric: "tabular-nums",
}));

const LabelText = styled(Typography)(({ theme }) => ({
  fontSize: "0.6875rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
}));

const TrendBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== "direction",
})<{ direction: "up" | "down" | "neutral" }>(({ theme, direction }) => {
  const colorMap = {
    up: { bg: "rgba(5,150,105,0.1)", text: "#059669" },
    down: { bg: "rgba(220,38,38,0.1)", text: "#dc2626" },
    neutral: {
      bg: alpha(theme.palette.grey[500], 0.1),
      text: theme.palette.grey[600],
    },
  };

  const colors = colorMap[direction];

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.25, 1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: colors.bg,
    color: colors.text,
    fontSize: "0.75rem",
    fontWeight: 600,
  };
});

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 5,
  borderRadius: 3,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  "& .MuiLinearProgress-bar": {
    borderRadius: 3,
    backgroundColor: theme.palette.primary.main,
  },
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function KpiCard({
  label,
  value,
  icon,
  iconColor = "jade",
  trend,
  trendLabel,
  progress,
  featured = false,
  animationDelay,
}: KpiCardProps) {
  const theme = useTheme();
  const resolvedIconColor = iconColorMap[iconColor] ?? theme.palette.primary.main;

  return (
    <StyledPaper elevation={0} featured={featured} animationDelay={animationDelay}>
      <Stack spacing={2}>
        {/* Header: label + icon */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <LabelText>{label}</LabelText>
          <IconBox iconColor={resolvedIconColor}>{icon}</IconBox>
        </Stack>

        {/* Valor principal */}
        <ValueText>{value}</ValueText>

        {/* Tendencia */}
        {trend && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <TrendBadge direction={trend.direction}>{trend.value}</TrendBadge>
            {trendLabel && (
              <Typography variant="caption" color="text.secondary">
                {trendLabel}
              </Typography>
            )}
          </Stack>
        )}

        {/* Barra de progreso */}
        {progress && (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 0.75 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.6875rem" }}
              >
                {progress.label}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  fontSize: "0.6875rem",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {progress.value}%
              </Typography>
            </Stack>
            <ProgressBar variant="determinate" value={progress.value} />
          </Box>
        )}
      </Stack>
    </StyledPaper>
  );
}

export type { KpiCardProps };
export default KpiCard;
