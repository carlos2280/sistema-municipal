/**
 * EconomicIndicators — Indicadores Económicos
 *
 * Modo inline (compact=true): muestra UF y USD directamente en el AppBar
 * como texto sutil con separador. Tooltip al hover con detalle completo.
 *
 * Sin Paper/elevation — se integra visualmente al glassmorphism del AppBar.
 */

import {
  Box,
  Divider,
  Fade,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { TrendingUp, TrendingDown, CircleDot } from "lucide-react";
import { keyframes, styled } from "@mui/material/styles";
import type React from "react";
import { useState } from "react";

// ============================================================================
// INTERFACES
// ============================================================================

interface CurrencyData {
  code: string;
  name: string;
  value: number;
  previousValue: number;
  lastUpdate: string;
  trend: "up" | "down" | "stable";
}

interface EconomicIndicatorsProps {
  uf?: CurrencyData;
  usd?: CurrencyData;
  showTooltip?: boolean;
  compact?: boolean;
}

// ============================================================================
// ANIMATIONS
// ============================================================================

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

// ============================================================================
// STYLED
// ============================================================================

/** Contenedor inline — sin fondo ni borde propio, se integra al AppBar */
const InlineContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(0.5, 1.25),
  borderRadius: theme.shape.borderRadius + 2,
  cursor: "default",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const LiveDot = styled(CircleDot)(({ theme }) => ({
  color: theme.palette.success.main,
  animation: `${pulse} 2.5s ease-in-out infinite`,
  flexShrink: 0,
}));

// ============================================================================
// UTILITIES
// ============================================================================

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (dateString: string): string =>
  new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));

const calculateChange = (current: number, previous: number): number =>
  ((current - previous) / previous) * 100;

// ============================================================================
// TOOLTIP CONTENT
// ============================================================================

const TooltipRow: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Box>{children}</Box>
  </Stack>
);

const CurrencyDetail: React.FC<{ currency: CurrencyData }> = ({ currency }) => {
  const change = calculateChange(currency.value, currency.previousValue);
  const isUp = change >= 0;

  return (
    <Box sx={{ py: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {currency.name}
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} color="success.main">
            {formatCurrency(currency.value)}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: 2,
            bgcolor: (t) => alpha(isUp ? t.palette.success.main : t.palette.error.main, 0.1),
            color: isUp ? "success.main" : "error.main",
          }}
        >
          {isUp
            ? <TrendingUp size={12} strokeWidth={1.5} />
            : <TrendingDown size={12} strokeWidth={1.5} />
          }
          <Typography variant="caption" fontWeight={600}>
            {isUp ? "+" : ""}{change.toFixed(2)}%
          </Typography>
        </Box>
      </Stack>
      <TooltipRow label="Valor anterior">
        <Typography variant="caption" color="text.secondary">
          {formatCurrency(currency.previousValue)}
        </Typography>
      </TooltipRow>
    </Box>
  );
};

// ============================================================================
// DEFAULTS
// ============================================================================

const defaultUF: CurrencyData = {
  code: "UF",
  name: "Unidad de Fomento",
  value: 37245.67,
  previousValue: 37198.45,
  lastUpdate: new Date().toISOString(),
  trend: "up",
};

const defaultUSD: CurrencyData = {
  code: "USD",
  name: "Dólar Americano",
  value: 950.32,
  previousValue: 948.75,
  lastUpdate: new Date().toISOString(),
  trend: "up",
};

// ============================================================================
// CURRENCY ITEM
// ============================================================================

const CurrencyItem: React.FC<{ currency: CurrencyData }> = ({ currency }) => (
  <Stack direction="row" alignItems="baseline" spacing={0.5}>
    <Typography
      variant="caption"
      fontWeight={700}
      sx={{ color: "text.disabled", letterSpacing: "0.04em", fontSize: "0.6875rem" }}
    >
      {currency.code}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={600}
      sx={{ color: "text.primary", fontSize: "0.8125rem", fontVariantNumeric: "tabular-nums" }}
    >
      {new Intl.NumberFormat("es-CL", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(currency.value)}
    </Typography>
  </Stack>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EconomicIndicators: React.FC<EconomicIndicatorsProps> = ({
  uf = defaultUF,
  usd = defaultUSD,
  showTooltip = true,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const tooltipContent = (
    <Box sx={{ p: 1.5, minWidth: 240 }}>
      <Typography
        variant="overline"
        color="text.disabled"
        display="block"
        sx={{ mb: 1, letterSpacing: "0.08em" }}
      >
        Indicadores económicos
      </Typography>
      <CurrencyDetail currency={uf} />
      <Divider sx={{ my: 1 }} />
      <CurrencyDetail currency={usd} />
      <Divider sx={{ my: 1 }} />
      <Typography variant="caption" color="text.disabled">
        Actualizado: {formatDate(uf.lastUpdate)}
      </Typography>
    </Box>
  );

  const content = (
    <InlineContainer
      onMouseEnter={() => showTooltip && setOpen(true)}
      onMouseLeave={() => showTooltip && setOpen(false)}
    >
      <CurrencyItem currency={uf} />

      <Divider
        orientation="vertical"
        flexItem
        sx={{ height: 14, alignSelf: "center", borderColor: alpha(theme.palette.divider, 0.4) }}
      />

      <CurrencyItem currency={usd} />

      <LiveDot size={7} />
    </InlineContainer>
  );

  if (!showTooltip) return content;

  return (
    <Tooltip
      title={tooltipContent}
      arrow
      placement="bottom-end"
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 180 }}
      open={open}
      onClose={() => setOpen(false)}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: theme.shape.borderRadius + 4,
            backdropFilter: "blur(12px)",
            maxWidth: "none",
            p: 0,
          },
        },
        arrow: {
          sx: { color: theme.palette.background.paper },
        },
      }}
    >
      {content}
    </Tooltip>
  );
};

export default EconomicIndicators;
