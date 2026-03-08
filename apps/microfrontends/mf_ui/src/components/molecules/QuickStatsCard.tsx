/**
 * Quick Stats Card - Molécula
 *
 * Tarjeta de lista de estadísticas rápidas con filas label/valor
 */

import { Box, Typography, styled } from "@mui/material";

// ============================================================================
// TYPES
// ============================================================================

export interface QuickStatItem {
  /** Etiqueta del indicador */
  label: string;
  /** Valor formateado */
  value: string;
}

export interface QuickStatsCardProps {
  /** Título de la tarjeta */
  title: string;
  /** Lista de indicadores */
  items: QuickStatItem[];
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12,
  padding: 20,
}));

const Title = styled(Typography)(({ theme }) => ({
  fontFamily: theme.typography.h1?.fontFamily ?? "inherit",
  fontWeight: 600,
  fontSize: "1rem",
  letterSpacing: "-0.01em",
  marginBottom: 16,
  color: theme.palette.text.primary,
}));

const Row = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    borderBottom: "none",
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  fontSize: "0.8125rem",
  color: theme.palette.text.secondary,
}));

const Value = styled(Typography)(({ theme }) => ({
  fontFamily: '"Roboto Mono", "SF Mono", "Fira Code", monospace',
  fontWeight: 600,
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
  fontVariantNumeric: "tabular-nums",
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function QuickStatsCard({ title, items }: QuickStatsCardProps) {
  return (
    <Container>
      <Title>{title}</Title>

      {items.map((item) => (
        <Row key={item.label}>
          <Label>{item.label}</Label>
          <Value>{item.value}</Value>
        </Row>
      ))}
    </Container>
  );
}

export default QuickStatsCard;
