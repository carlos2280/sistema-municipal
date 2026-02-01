/**
 * Loading Spinner - Átomo
 *
 * Indicador de carga elegante con animación suave
 */

import { Box, CircularProgress, Typography, alpha, styled, keyframes } from "@mui/material";
import type { ReactNode } from "react";

// ============================================================================
// ANIMATIONS
// ============================================================================

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const SpinnerContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  animation: `${fadeIn} 0.3s ease-out`,
}));

const SpinnerWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "inline-flex",
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  animation: `${pulse} 2s ease-in-out infinite`,
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

// ============================================================================
// TYPES
// ============================================================================

interface LoadingSpinnerProps {
  /** Tamaño del spinner */
  size?: "small" | "medium" | "large";
  /** Texto a mostrar debajo del spinner */
  text?: string;
  /** Color del spinner (usa primary del tema por defecto) */
  color?: "primary" | "secondary" | "inherit";
  /** Si debe ocupar toda la pantalla */
  fullScreen?: boolean;
  /** Contenido adicional */
  children?: ReactNode;
}

// ============================================================================
// SIZE MAP
// ============================================================================

const sizeMap = {
  small: 24,
  medium: 40,
  large: 56,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function LoadingSpinner({
  size = "medium",
  text,
  color = "primary",
  fullScreen = false,
  children,
}: LoadingSpinnerProps) {
  const spinnerSize = sizeMap[size];

  const content = (
    <SpinnerContainer>
      <SpinnerWrapper>
        <CircularProgress
          size={spinnerSize}
          color={color}
          thickness={4}
          sx={{
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
      </SpinnerWrapper>

      {text && (
        <LoadingText variant={size === "small" ? "caption" : "body2"}>
          {text}
        </LoadingText>
      )}

      {children}
    </SpinnerContainer>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.8),
          backdropFilter: "blur(4px)",
          zIndex: (theme) => theme.zIndex.modal + 1,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}

export default LoadingSpinner;
