/**
 * Badge - Átomo
 *
 * Etiquetas y badges elegantes para estados, categorías, etc.
 */

import { Box, Typography, alpha, styled } from "@mui/material";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

type BadgeVariant = "filled" | "outlined" | "soft";
type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";
type BadgeSize = "small" | "medium" | "large";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  pill?: boolean;
  pulse?: boolean;
  className?: string;
}

// ============================================================================
// SIZE CONFIG
// ============================================================================

const sizeConfig = {
  small: {
    px: 1.5,
    py: 0.25,
    fontSize: "0.65rem",
    iconSize: 12,
  },
  medium: {
    px: 2,
    py: 0.5,
    fontSize: "0.75rem",
    iconSize: 14,
  },
  large: {
    px: 2.5,
    py: 0.75,
    fontSize: "0.8125rem",
    iconSize: 16,
  },
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledBadge = styled(Box, {
  shouldForwardProp: (prop) =>
    !["badgeVariant", "badgeColor", "badgeSize", "pill", "pulse"].includes(
      prop as string
    ),
})<{
  badgeVariant: BadgeVariant;
  badgeColor: BadgeColor;
  badgeSize: BadgeSize;
  pill: boolean;
  pulse: boolean;
}>(({ theme, badgeVariant, badgeColor, badgeSize, pill, pulse }) => {
  // Valores seguros con fallbacks
  const safeSize = badgeSize && sizeConfig[badgeSize] ? badgeSize : "medium";
  const safeColor = badgeColor || "primary";
  const size = sizeConfig[safeSize];

  // Obtener color del tema de forma segura
  const getColor = () => {
    if (safeColor === "neutral") {
      return theme.palette.mode === "light"
        ? theme.palette.grey[600]
        : theme.palette.grey[400];
    }
    const paletteColor = theme.palette[safeColor as keyof typeof theme.palette];
    if (paletteColor && typeof paletteColor === "object" && "main" in paletteColor) {
      return (paletteColor as { main: string }).main;
    }
    return theme.palette.primary.main;
  };

  const color = getColor();

  // Estilos base
  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    paddingLeft: theme.spacing(size.px),
    paddingRight: theme.spacing(size.px),
    paddingTop: theme.spacing(size.py),
    paddingBottom: theme.spacing(size.py),
    borderRadius: pill ? "9999px" : theme.shape.borderRadius,
    fontSize: size.fontSize,
    fontWeight: 600,
    lineHeight: 1.4,
    whiteSpace: "nowrap" as const,
    transition: "all 0.2s ease-in-out",
  };

  // Estilos por variante
  const variantStyles = {
    filled: {
      backgroundColor: color,
      color: theme.palette.getContrastText(color),
    },
    outlined: {
      backgroundColor: "transparent",
      color: color,
      border: `1.5px solid ${color}`,
    },
    soft: {
      backgroundColor: alpha(color, theme.palette.mode === "light" ? 0.12 : 0.2),
      color:
        theme.palette.mode === "light"
          ? badgeColor === "neutral"
            ? theme.palette.grey[800]
            : theme.palette[badgeColor as Exclude<BadgeColor, "neutral">].dark
          : badgeColor === "neutral"
            ? theme.palette.grey[200]
            : theme.palette[badgeColor as Exclude<BadgeColor, "neutral">].light,
    },
  };

  // Animación de pulso
  const pulseStyles = pulse
    ? {
        position: "relative" as const,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          backgroundColor: color,
          animation: "badge-pulse 2s ease-in-out infinite",
          opacity: 0,
        },
        "@keyframes badge-pulse": {
          "0%, 100%": {
            opacity: 0,
            transform: "scale(1)",
          },
          "50%": {
            opacity: 0.3,
            transform: "scale(1.05)",
          },
        },
      }
    : {};

  return {
    ...baseStyles,
    ...variantStyles[badgeVariant],
    ...pulseStyles,
  };
});

// ============================================================================
// COMPONENT
// ============================================================================

export function Badge({
  children,
  variant = "soft",
  color = "primary",
  size = "medium",
  startIcon,
  endIcon,
  pill = false,
  pulse = false,
  className,
}: BadgeProps) {
  const iconSize = sizeConfig[size].iconSize;

  return (
    <StyledBadge
      badgeVariant={variant}
      badgeColor={color}
      badgeSize={size}
      pill={pill}
      pulse={pulse}
      className={className}
    >
      {startIcon && (
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            "& > svg": { width: iconSize, height: iconSize },
          }}
        >
          {startIcon}
        </Box>
      )}

      <Typography
        component="span"
        sx={{
          fontSize: "inherit",
          fontWeight: "inherit",
          lineHeight: "inherit",
        }}
      >
        {children}
      </Typography>

      {endIcon && (
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            "& > svg": { width: iconSize, height: iconSize },
          }}
        >
          {endIcon}
        </Box>
      )}
    </StyledBadge>
  );
}

export default Badge;
