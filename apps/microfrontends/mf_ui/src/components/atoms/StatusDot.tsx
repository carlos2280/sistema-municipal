/**
 * Status Dot - Átomo
 *
 * Indicador de estado simple y elegante
 */

import { Box, styled, keyframes } from "@mui/material";

// ============================================================================
// ANIMATIONS
// ============================================================================

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
`;

// ============================================================================
// TYPES
// ============================================================================

type StatusColor = "success" | "warning" | "error" | "info" | "neutral";
type StatusSize = "small" | "medium" | "large";

interface StatusDotProps {
  /** Color del estado */
  color?: StatusColor;
  /** Tamaño del punto */
  size?: StatusSize;
  /** Si debe tener animación de pulso */
  pulse?: boolean;
  /** Texto alternativo para accesibilidad */
  label?: string;
}

// ============================================================================
// SIZE CONFIG
// ============================================================================

const sizeMap: Record<StatusSize, number> = {
  small: 6,
  medium: 8,
  large: 10,
};

// ============================================================================
// STYLED COMPONENT
// ============================================================================

const Dot = styled(Box, {
  shouldForwardProp: (prop) =>
    !["statusColor", "statusSize", "shouldPulse"].includes(prop as string),
})<{
  statusColor: StatusColor;
  statusSize: StatusSize;
  shouldPulse: boolean;
}>(({ theme, statusColor, statusSize, shouldPulse }) => {
  const getColor = () => {
    if (statusColor === "neutral") {
      return theme.palette.grey[500];
    }
    return theme.palette[statusColor].main;
  };

  const color = getColor();
  const dimension = sizeMap[statusSize];

  return {
    width: dimension,
    height: dimension,
    borderRadius: "50%",
    backgroundColor: color,
    flexShrink: 0,
    ...(shouldPulse && {
      animation: `${pulse} 2s ease-in-out infinite`,
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${color}20`,
    }),
  };
});

// ============================================================================
// COMPONENT
// ============================================================================

export function StatusDot({
  color = "neutral",
  size = "medium",
  pulse: shouldPulse = false,
  label,
}: StatusDotProps) {
  return (
    <Dot
      statusColor={color}
      statusSize={size}
      shouldPulse={shouldPulse}
      role="status"
      aria-label={label}
    />
  );
}

export default StatusDot;
