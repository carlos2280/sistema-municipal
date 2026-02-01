/**
 * Empty State - Molécula
 *
 * Estado vacío elegante para cuando no hay datos que mostrar
 */

import { Box, Button, Stack, Typography, alpha, styled } from "@mui/material";
import { Inbox, Search, FileQuestion, Plus } from "lucide-react";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

type EmptyStateVariant = "default" | "search" | "error" | "noData";

interface EmptyStateProps {
  /** Variante predefinida */
  variant?: EmptyStateVariant;
  /** Título principal */
  title?: string;
  /** Descripción secundaria */
  description?: string;
  /** Icono personalizado */
  icon?: ReactNode;
  /** Texto del botón de acción */
  actionLabel?: string;
  /** Handler del botón de acción */
  onAction?: () => void;
  /** Texto del botón secundario */
  secondaryActionLabel?: string;
  /** Handler del botón secundario */
  onSecondaryAction?: () => void;
  /** Tamaño del componente */
  size?: "small" | "medium" | "large";
}

// ============================================================================
// PRESET CONFIGS
// ============================================================================

const presetConfig: Record<
  EmptyStateVariant,
  { icon: ReactNode; title: string; description: string }
> = {
  default: {
    icon: <Inbox />,
    title: "Sin contenido",
    description: "No hay elementos para mostrar en este momento.",
  },
  search: {
    icon: <Search />,
    title: "Sin resultados",
    description: "No encontramos resultados para tu búsqueda. Intenta con otros términos.",
  },
  error: {
    icon: <FileQuestion />,
    title: "Algo salió mal",
    description: "Ocurrió un error al cargar los datos. Por favor, intenta de nuevo.",
  },
  noData: {
    icon: <Inbox />,
    title: "Comienza aquí",
    description: "Aún no hay datos registrados. Crea el primero para empezar.",
  },
};

// ============================================================================
// SIZE CONFIG
// ============================================================================

const sizeConfig = {
  small: {
    iconSize: 48,
    iconPadding: 16,
    titleVariant: "subtitle1" as const,
    spacing: 1.5,
    py: 4,
  },
  medium: {
    iconSize: 64,
    iconPadding: 20,
    titleVariant: "h6" as const,
    spacing: 2,
    py: 6,
  },
  large: {
    iconSize: 80,
    iconPadding: 24,
    titleVariant: "h5" as const,
    spacing: 2.5,
    py: 8,
  },
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const IconContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  transition: "all 0.3s ease",
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function EmptyState({
  variant = "default",
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  size = "medium",
}: EmptyStateProps) {
  const preset = presetConfig[variant];
  const sizeStyles = sizeConfig[size];

  const displayTitle = title || preset.title;
  const displayDescription = description || preset.description;
  const displayIcon = icon || preset.icon;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: sizeStyles.py,
        px: 3,
      }}
    >
      <IconContainer
        sx={{
          width: sizeStyles.iconSize + sizeStyles.iconPadding * 2,
          height: sizeStyles.iconSize + sizeStyles.iconPadding * 2,
          "& > svg": {
            width: sizeStyles.iconSize,
            height: sizeStyles.iconSize,
          },
        }}
      >
        {displayIcon}
      </IconContainer>

      <Stack spacing={sizeStyles.spacing / 2} alignItems="center" sx={{ maxWidth: 400 }}>
        <Typography
          variant={sizeStyles.titleVariant}
          fontWeight={600}
          color="text.primary"
        >
          {displayTitle}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          {displayDescription}
        </Typography>
      </Stack>

      {(actionLabel || secondaryActionLabel) && (
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          {actionLabel && onAction && (
            <Button
              variant="contained"
              onClick={onAction}
              startIcon={variant === "noData" ? <Plus size={18} /> : undefined}
              sx={{ textTransform: "none" }}
            >
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outlined"
              onClick={onSecondaryAction}
              sx={{ textTransform: "none" }}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default EmptyState;
