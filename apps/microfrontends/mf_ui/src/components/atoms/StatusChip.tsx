/**
 * Status Chip - Atomo
 *
 * Chip/badge de estado para listas de tareas y documentos
 */

import { Box, alpha, styled } from "@mui/material";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

type StatusVariant =
  | "pendiente"
  | "urgente"
  | "en-revision"
  | "aprobado"
  | "borrador"
  | "rechazado"
  | "vencido";

export interface StatusChipProps {
  /** Variante de estado */
  variant: StatusVariant;
  /** Texto a mostrar */
  label: string;
  /** Icono opcional */
  icon?: ReactNode;
}

// ============================================================================
// COLOR CONFIG
// ============================================================================

const variantColors: Record<StatusVariant, string> = {
  pendiente: "#d97706",
  urgente: "#dc2626",
  "en-revision": "#2563eb",
  aprobado: "#059669",
  borrador: "#64748b",
  rechazado: "#dc2626",
  vencido: "#d97706",
};

// ============================================================================
// STYLED COMPONENT
// ============================================================================

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "statusVariant",
})<{ statusVariant: StatusVariant }>(({ statusVariant }) => {
  const color = variantColors[statusVariant];

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 10px",
    borderRadius: 6,
    fontSize: "0.6875rem",
    fontWeight: 600,
    lineHeight: 1.5,
    color,
    backgroundColor: alpha(color, 0.1),
    whiteSpace: "nowrap",
  };
});

// ============================================================================
// COMPONENT
// ============================================================================

export function StatusChip({ variant, label, icon }: StatusChipProps) {
  return (
    <Root statusVariant={variant} component="span">
      {icon}
      {label}
    </Root>
  );
}

export default StatusChip;
