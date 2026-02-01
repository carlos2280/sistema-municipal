/**
 * Stat Card - Molécula
 *
 * Tarjeta de estadística elegante con tendencia y animaciones
 */

import { Box, Paper, Stack, Typography, alpha, styled, keyframes } from "@mui/material";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

// ============================================================================
// ANIMATIONS
// ============================================================================

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const countUp = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// ============================================================================
// TYPES
// ============================================================================

type TrendDirection = "up" | "down" | "neutral";

interface StatCardProps {
  /** Título/etiqueta de la estadística */
  label: string;
  /** Valor principal a mostrar */
  value: string | number;
  /** Icono del card */
  icon?: ReactNode;
  /** Dirección de la tendencia */
  trend?: TrendDirection;
  /** Porcentaje de cambio */
  trendValue?: string;
  /** Texto adicional de la tendencia */
  trendLabel?: string;
  /** Color del icono */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  /** Si está cargando */
  loading?: boolean;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: Number(theme.shape.borderRadius) + 4,
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease",
  animation: `${fadeInUp} 0.4s ease-out`,
  "&:hover": {
    boxShadow: theme.shadows[4],
    borderColor: alpha(theme.palette.primary.main, 0.2),
    transform: "translateY(-2px)",
  },
}));

const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "iconColor",
})<{ iconColor: string }>(({ theme, iconColor }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: alpha(iconColor, 0.12),
  color: iconColor,
  "& > svg": {
    width: 24,
    height: 24,
  },
}));

const ValueText = styled(Typography)(() => ({
  fontSize: "1.75rem",
  fontWeight: 700,
  lineHeight: 1.2,
  animation: `${countUp} 0.5s ease-out`,
  fontVariantNumeric: "tabular-nums",
}));

const TrendBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== "trendDirection",
})<{ trendDirection: TrendDirection }>(({ theme, trendDirection }) => {
  const getColor = () => {
    switch (trendDirection) {
      case "up":
        return theme.palette.success.main;
      case "down":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const color = getColor();

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.25, 1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(color, 0.12),
    color: color,
    fontSize: "0.75rem",
    fontWeight: 600,
  };
});

// ============================================================================
// COMPONENT
// ============================================================================

// Mapa de colores para el icono
const colorMap: Record<string, string> = {
  primary: "#7928ca",
  secondary: "#0891b2",
  success: "#059669",
  warning: "#d97706",
  error: "#dc2626",
  info: "#0284c7",
};

export function StatCard({
  label,
  value,
  icon,
  trend = "neutral",
  trendValue,
  trendLabel,
  color = "primary",
  loading = false,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const iconColor = colorMap[color] || colorMap.primary;

  return (
    <StyledPaper elevation={0}>
      <Stack spacing={2}>
        {/* Header con icono */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
            sx={{ textTransform: "uppercase", letterSpacing: "0.02em" }}
          >
            {label}
          </Typography>

          {icon && (
            <IconContainer iconColor={iconColor}>
              {icon}
            </IconContainer>
          )}
        </Stack>

        {/* Valor principal */}
        <Box>
          {loading ? (
            <Box
              sx={{
                height: 42,
                width: "60%",
                borderRadius: 1,
                bgcolor: "action.hover",
              }}
            />
          ) : (
            <ValueText>{value}</ValueText>
          )}
        </Box>

        {/* Tendencia */}
        {(trendValue || trendLabel) && !loading && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <TrendBadge trendDirection={trend}>
              <TrendIcon size={14} />
              {trendValue}
            </TrendBadge>

            {trendLabel && (
              <Typography variant="caption" color="text.secondary">
                {trendLabel}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </StyledPaper>
  );
}

export default StatCard;
