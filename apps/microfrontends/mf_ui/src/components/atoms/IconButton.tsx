/**
 * Icon Button - Átomo
 *
 * Botón de icono elegante con animaciones sutiles
 */

import {
  IconButton as MuiIconButton,
  Tooltip,
  alpha,
  styled,
  type IconButtonProps as MuiIconButtonProps,
} from "@mui/material";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

type IconButtonVariant = "default" | "filled" | "soft" | "outlined";

interface IconButtonProps extends Omit<MuiIconButtonProps, "variant"> {
  /** Variante visual del botón */
  variant?: IconButtonVariant;
  /** Tooltip a mostrar */
  tooltip?: string;
  /** Si está en estado activo/seleccionado */
  active?: boolean;
  /** Icono a mostrar */
  children: ReactNode;
}

// ============================================================================
// STYLED COMPONENT
// ============================================================================

const StyledIconButton = styled(MuiIconButton, {
  shouldForwardProp: (prop) =>
    !["buttonVariant", "active"].includes(prop as string),
})<{
  buttonVariant: IconButtonVariant;
  active?: boolean;
}>(({ theme, buttonVariant, active, color = "default" }) => {
  const getColorMain = () => {
    if (color === "default" || color === "inherit") {
      return theme.palette.primary.main;
    }
    return theme.palette[color]?.main || theme.palette.primary.main;
  };

  const colorMain = getColorMain();

  const baseStyles = {
    borderRadius: theme.shape.borderRadius,
    transition: "all 0.2s ease-in-out",
    "&:active": {
      transform: "scale(0.95)",
    },
  };

  const variantStyles = {
    default: {
      "&:hover": {
        backgroundColor: alpha(colorMain, 0.08),
      },
      ...(active && {
        backgroundColor: alpha(colorMain, 0.12),
        color: colorMain,
      }),
    },
    filled: {
      backgroundColor: colorMain,
      color: theme.palette.getContrastText(colorMain),
      "&:hover": {
        backgroundColor:
          theme.palette.mode === "light"
            ? alpha(colorMain, 0.85)
            : alpha(colorMain, 1.15),
        boxShadow: `0 4px 12px ${alpha(colorMain, 0.35)}`,
      },
      ...(active && {
        boxShadow: `0 4px 12px ${alpha(colorMain, 0.35)}`,
      }),
    },
    soft: {
      backgroundColor: alpha(colorMain, theme.palette.mode === "light" ? 0.08 : 0.16),
      color: colorMain,
      "&:hover": {
        backgroundColor: alpha(colorMain, theme.palette.mode === "light" ? 0.16 : 0.24),
      },
      ...(active && {
        backgroundColor: alpha(colorMain, theme.palette.mode === "light" ? 0.16 : 0.24),
      }),
    },
    outlined: {
      border: `1.5px solid ${theme.palette.divider}`,
      "&:hover": {
        borderColor: colorMain,
        backgroundColor: alpha(colorMain, 0.04),
      },
      ...(active && {
        borderColor: colorMain,
        backgroundColor: alpha(colorMain, 0.08),
        color: colorMain,
      }),
    },
  };

  return {
    ...baseStyles,
    ...variantStyles[buttonVariant],
  };
});

// ============================================================================
// COMPONENT
// ============================================================================

export function IconButton({
  variant = "default",
  tooltip,
  active = false,
  children,
  ...props
}: IconButtonProps) {
  const button = (
    <StyledIconButton buttonVariant={variant} active={active} {...props}>
      {children}
    </StyledIconButton>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
}

export default IconButton;
