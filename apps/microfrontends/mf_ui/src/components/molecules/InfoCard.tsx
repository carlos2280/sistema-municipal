/**
 * Info Card - Molécula
 *
 * Tarjeta informativa elegante con múltiples variantes
 */

import {
  Box,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
  styled,
} from "@mui/material";
import { X, Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

type InfoCardVariant = "info" | "success" | "warning" | "error";

interface InfoCardProps {
  /** Variante visual */
  variant?: InfoCardVariant;
  /** Título del card */
  title?: string;
  /** Contenido/descripción */
  children: ReactNode;
  /** Icono personalizado */
  icon?: ReactNode;
  /** Si se puede cerrar */
  dismissible?: boolean;
  /** Handler para cerrar */
  onDismiss?: () => void;
  /** Acción adicional */
  action?: ReactNode;
  /** Sin borde */
  borderless?: boolean;
}

// ============================================================================
// VARIANT CONFIG
// ============================================================================

const variantConfig: Record<
  InfoCardVariant,
  { icon: ReactNode; colorKey: "info" | "success" | "warning" | "error" }
> = {
  info: { icon: <Info size={20} />, colorKey: "info" },
  success: { icon: <CheckCircle size={20} />, colorKey: "success" },
  warning: { icon: <AlertTriangle size={20} />, colorKey: "warning" },
  error: { icon: <AlertCircle size={20} />, colorKey: "error" },
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledPaper = styled(Paper, {
  shouldForwardProp: (prop) =>
    !["cardVariant", "borderless"].includes(prop as string),
})<{
  cardVariant: InfoCardVariant;
  borderless: boolean;
}>(({ theme, cardVariant, borderless }) => {
  const colorKey = variantConfig[cardVariant].colorKey;
  const color = theme.palette[colorKey].main;

  return {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(color, theme.palette.mode === "light" ? 0.06 : 0.12),
    border: borderless ? "none" : `1px solid ${alpha(color, 0.2)}`,
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: color,
    },
  };
});

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "cardVariant",
})<{ cardVariant: InfoCardVariant }>(({ theme, cardVariant }) => {
  const colorKey = variantConfig[cardVariant].colorKey;
  const color = theme.palette[colorKey].main;

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
    color: color,
  };
});

// ============================================================================
// COMPONENT
// ============================================================================

export function InfoCard({
  variant = "info",
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  action,
  borderless = false,
}: InfoCardProps) {
  const config = variantConfig[variant];
  const displayIcon = icon || config.icon;

  return (
    <StyledPaper cardVariant={variant} borderless={borderless} elevation={0}>
      <IconWrapper cardVariant={variant}>{displayIcon}</IconWrapper>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {title && (
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{ mb: 0.5 }}
          >
            {title}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {children}
        </Typography>

        {action && <Box sx={{ mt: 2 }}>{action}</Box>}
      </Box>

      {dismissible && onDismiss && (
        <IconButton
          size="small"
          onClick={onDismiss}
          sx={{
            flexShrink: 0,
            ml: 1,
            mt: -0.5,
            color: "text.secondary",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <X size={16} />
        </IconButton>
      )}
    </StyledPaper>
  );
}

export default InfoCard;
