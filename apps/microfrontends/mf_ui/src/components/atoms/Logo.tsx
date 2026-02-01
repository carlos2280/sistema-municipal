/**
 * Logo - Átomo
 *
 * Componente del logo CrisCar con soporte para diferentes tamaños
 * y modos (claro/oscuro)
 */

import { Box, styled } from "@mui/material";

// ============================================================================
// TYPES
// ============================================================================

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";
type LogoVariant = "full" | "icon";

interface LogoProps {
  /** Tamaño del logo */
  size?: LogoSize;
  /** Variante: full (completo) o icon (solo icono) */
  variant?: LogoVariant;
  /** Si debe usar la versión para fondo oscuro */
  light?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

// ============================================================================
// SIZE CONFIG
// ============================================================================

const sizeMap: Record<LogoSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

// ============================================================================
// STYLED COMPONENT
// ============================================================================

const LogoContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "clickable",
})<{ clickable?: boolean }>(({ clickable }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.2s ease-in-out",
  ...(clickable && {
    cursor: "pointer",
    "&:hover": {
      transform: "scale(1.05)",
    },
    "&:active": {
      transform: "scale(0.98)",
    },
  }),
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function Logo({
  size = "md",
  variant = "full",
  light = false,
  className,
  onClick,
}: LogoProps) {
  const dimension = sizeMap[size];

  // Determinar qué logo usar
  const logoSrc = variant === "icon"
    ? "/logo-criscar-icon.svg"
    : light
      ? "/logo-criscar-white.svg"
      : "/logo-criscar.svg";

  return (
    <LogoContainer
      className={className}
      clickable={!!onClick}
      onClick={onClick}
    >
      <Box
        component="img"
        src={logoSrc}
        alt="CrisCar - Sistema Municipal"
        sx={{
          width: dimension,
          height: dimension,
          objectFit: "contain",
        }}
      />
    </LogoContainer>
  );
}

export default Logo;
