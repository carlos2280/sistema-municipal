/**
 * Task Card - Molécula
 *
 * Tarjeta de tarea para listas de pendientes en el dashboard
 */

import { Box, Typography, alpha, styled, useTheme } from "@mui/material";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

type DotColor = "error" | "warning" | "info" | "success";
type DueVariant = "urgent" | "today" | "normal";

interface TaskCardProps {
  /** Título de la tarea */
  title: string;
  /** Módulo al que pertenece */
  module: string;
  /** Estado (puede ser un StatusChip u otro ReactNode) */
  status: ReactNode;
  /** Texto de tiempo (ej. "Maria G. - hace 10 min") */
  time: string;
  /** Texto de vencimiento (ej. "Vence hoy") */
  due?: string;
  /** Variante de vencimiento para colorear */
  dueVariant?: DueVariant;
  /** Color del indicador circular */
  dotColor: DotColor;
  /** Handler de click */
  onClick?: () => void;
}

// ============================================================================
// DOT COLOR MAP
// ============================================================================

const dotColorMap: Record<DotColor, string> = {
  error: "#dc2626",
  warning: "#d97706",
  info: "#2563eb",
  success: "#16a34a",
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "clickable",
})<{ clickable: boolean }>(({ theme, clickable }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2, 2.5),
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.2s ease",
  cursor: clickable ? "pointer" : "default",
  "&:hover": {
    borderColor: alpha(theme.palette.primary.main, 0.25),
    boxShadow: theme.shadows[2],
    transform: "translateY(-1px)",
  },
}));

const Dot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "color",
})<{ color: string }>(({ color }) => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  backgroundColor: color,
  boxShadow: `0 0 0 3px ${alpha(color, 0.2)}`,
  flexShrink: 0,
  marginTop: 5,
}));

const MetaSeparator = styled(Typography)(({ theme }) => ({
  fontSize: "0.7rem",
  color: theme.palette.text.disabled,
  userSelect: "none",
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

const MetaRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(0.75),
  },
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function TaskCard({
  title,
  module,
  status,
  time,
  due,
  dueVariant = "normal",
  dotColor,
  onClick,
}: TaskCardProps) {
  const theme = useTheme();

  const dueColor =
    dueVariant === "urgent"
      ? "#dc2626"
      : dueVariant === "today"
        ? "#d97706"
        : theme.palette.text.secondary;

  return (
    <StyledCard clickable={!!onClick} onClick={onClick}>
      <Dot color={dotColorMap[dotColor]} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Título */}
        <Typography
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "text.primary",
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>

        {/* Meta */}
        <MetaRow>
          <Typography
            component="span"
            sx={{ fontSize: "0.75rem", color: "text.secondary" }}
          >
            {module}
          </Typography>

          <MetaSeparator component="span">|</MetaSeparator>

          {status}

          <MetaSeparator component="span">|</MetaSeparator>

          <Typography
            component="span"
            sx={{ fontSize: "0.6875rem", color: "text.disabled" }}
          >
            {time}
          </Typography>

          {due && (
            <>
              <MetaSeparator component="span">|</MetaSeparator>

              <Typography
                component="span"
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: dueColor,
                }}
              >
                {due}
              </Typography>
            </>
          )}
        </MetaRow>
      </Box>
    </StyledCard>
  );
}

export type { TaskCardProps };
export default TaskCard;
