/**
 * Divider - Átomo
 *
 * Separador elegante con variantes y etiqueta opcional
 */

import { Box, Divider as MuiDivider, Typography, styled } from "@mui/material";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface DividerProps {
  /** Orientación del divisor */
  orientation?: "horizontal" | "vertical";
  /** Variante visual */
  variant?: "fullWidth" | "inset" | "middle";
  /** Contenido a mostrar en el centro (solo horizontal) */
  children?: ReactNode;
  /** Espacio vertical (solo horizontal) */
  spacing?: number;
  /** Si el divisor es más sutil */
  light?: boolean;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledDivider = styled(MuiDivider, {
  shouldForwardProp: (prop) => !["spacing", "light"].includes(prop as string),
})<{ spacing?: number; light?: boolean }>(({ theme, spacing = 0, light }) => ({
  marginTop: theme.spacing(spacing),
  marginBottom: theme.spacing(spacing),
  borderColor: light ? theme.palette.divider : theme.palette.divider,
  opacity: light ? 0.5 : 1,
}));

const DividerWithText = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  gap: theme.spacing(2),
  "&::before, &::after": {
    content: '""',
    flex: 1,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const DividerText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.75rem",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  whiteSpace: "nowrap",
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function Divider({
  orientation = "horizontal",
  variant = "fullWidth",
  children,
  spacing = 0,
  light = false,
}: DividerProps) {
  // Si hay contenido, usar versión con texto
  if (children && orientation === "horizontal") {
    return (
      <Box sx={{ my: spacing }}>
        <DividerWithText>
          <DividerText>{children}</DividerText>
        </DividerWithText>
      </Box>
    );
  }

  return (
    <StyledDivider
      orientation={orientation}
      variant={variant}
      spacing={spacing}
      light={light}
      flexItem={orientation === "vertical"}
    />
  );
}

export default Divider;
