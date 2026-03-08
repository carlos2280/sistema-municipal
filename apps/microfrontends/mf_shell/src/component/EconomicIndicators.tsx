/**
 * EconomicIndicators — Indicadores Económicos
 *
 * Modo inline en el AppBar: UF y USD con separador.
 * Tooltip al hover muestra detalle completo (via MUI Popper + portal).
 *
 * Layout tooltip (prototipo CIVITAS v3):
 *   Header
 *   ┌─ Nombre (caption, secondary)
 *   │  Valor (0.9375rem, bold, mono, text.primary)   [badge cambio]
 *   │  Valor anterior ——————————————— $xx.xxx
 *   └─ (divider)
 *   Actualizado: dd mmm yyyy, HH:mm
 */

import {
  Box,
  Divider,
  Fade,
  Paper,
  Popper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { TrendingDown, TrendingUp } from "lucide-react";
import { keyframes, styled } from "@mui/material/styles";
import type React from "react";
import { useRef, useState } from "react";

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
}

// ============================================================================
// ANIMATIONS
// ============================================================================

const pulseDot = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
`;

// ============================================================================
// STYLED
// ============================================================================

const InlineContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: "5px 12px",
  borderRadius: 8,
  cursor: "default",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

// ============================================================================
// UTILITIES
// ============================================================================

const formatCurrencyFull = (value: number): string =>
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
// SUB-COMPONENTS
// ============================================================================

/** Chip inline en el AppBar: "UF 37.245 ↗+0,13%" — fiel al prototipo */
const CurrencyChip: React.FC<{ currency: CurrencyData }> = ({ currency }) => {
  const theme = useTheme();
  const change = calculateChange(currency.value, currency.previousValue);
  const isUp = change >= 0;

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {/* Código */}
      <Typography
        component="span"
        sx={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          color: "text.disabled",
          letterSpacing: "0.04em",
        }}
      >
        {currency.code}
      </Typography>

      {/* Valor */}
      <Typography
        component="span"
        sx={{
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "text.primary",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {new Intl.NumberFormat("es-CL", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(currency.value)}
      </Typography>

      {/* Badge cambio */}
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          px: "5px",
          py: "1px",
          borderRadius: "4px",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.625rem",
          fontWeight: 600,
          ...(isUp
            ? {
                color: theme.palette.success.main,
                bgcolor: alpha(theme.palette.success.main, 0.1),
              }
            : {
                color: theme.palette.error.main,
                bgcolor: alpha(theme.palette.error.main, 0.1),
              }),
        }}
      >
        {isUp ? <TrendingUp size={10} strokeWidth={2} /> : <TrendingDown size={10} strokeWidth={2} />}
        {isUp ? "+" : ""}
        {change.toFixed(2)}%
      </Box>
    </Stack>
  );
};

/** Bloque detalle en tooltip: nombre → valor | badge → valor anterior */
const CurrencyBlock: React.FC<{ currency: CurrencyData; isLast?: boolean }> = ({
  currency,
  isLast = false,
}) => {
  const theme = useTheme();
  const change = calculateChange(currency.value, currency.previousValue);
  const isUp = change >= 0;

  return (
    <>
      <Box sx={{ py: "8px" }}>
        {/* Nombre */}
        <Typography
          sx={{ fontSize: "0.6875rem", color: "text.secondary", mb: "2px", lineHeight: 1.4 }}
        >
          {currency.name}
        </Typography>

        {/* Valor + cambio — misma fila, space-between */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "0.01em",
            }}
          >
            {formatCurrencyFull(currency.value)}
          </Typography>

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "2px",
              px: "5px",
              py: "1px",
              borderRadius: "4px",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.625rem",
              fontWeight: 600,
              ...(isUp
                ? {
                    color: theme.palette.success.main,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                  }
                : {
                    color: theme.palette.error.main,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                  }),
            }}
          >
            {isUp ? <TrendingUp size={11} strokeWidth={2} /> : <TrendingDown size={11} strokeWidth={2} />}
            {isUp ? "+" : ""}
            {change.toFixed(2)}%
          </Box>
        </Box>

        {/* Valor anterior */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: "4px" }}>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            Valor anterior
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {formatCurrencyFull(currency.previousValue)}
          </Typography>
        </Box>
      </Box>

      {!isLast && <Divider sx={{ borderColor: "divider" }} />}
    </>
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
// MAIN COMPONENT
// ============================================================================

const EconomicIndicators: React.FC<EconomicIndicatorsProps> = ({
  uf = defaultUF,
  usd = defaultUSD,
  showTooltip = true,
}) => {
  const theme = useTheme();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <InlineContainer
        ref={anchorRef}
        onMouseEnter={() => showTooltip && setOpen(true)}
        onMouseLeave={() => showTooltip && setOpen(false)}
      >
        <CurrencyChip currency={uf} />

        {/* Separator */}
        <Box
          component="span"
          sx={{
            width: "1px",
            height: 14,
            bgcolor: alpha(theme.palette.divider, 0.8),
            alignSelf: "center",
            flexShrink: 0,
          }}
        />

        <CurrencyChip currency={usd} />

        {/* Live dot */}
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: "success.main",
            flexShrink: 0,
            alignSelf: "center",
            animation: `${pulseDot} 2.5s ease-in-out infinite`,
          }}
        />
      </InlineContainer>

      {/* ── Tooltip via Popper (portal, evita clipping del AppBar) ── */}
      {showTooltip && (
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-end"
          transition
          disablePortal={false}
          style={{ zIndex: theme.zIndex.tooltip }}
          modifiers={[
            { name: "offset", options: { offset: [0, 8] } },
            { name: "preventOverflow", options: { boundary: "window" } },
          ]}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={180}>
              <Paper
                elevation={0}
                sx={{
                  minWidth: 280,
                  p: "16px",
                  bgcolor: "background.paper",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "12px",
                  boxShadow:
                    theme.palette.mode === "light"
                      ? "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)"
                      : "0 8px 32px rgba(0,0,0,0.4)",
                  pointerEvents: "none",
                }}
              >
                {/* Header */}
                <Typography
                  sx={{
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "text.disabled",
                    mb: "12px",
                  }}
                >
                  Indicadores económicos
                </Typography>

                <CurrencyBlock currency={uf} />
                <CurrencyBlock currency={usd} isLast />

                {/* Actualizado */}
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    color: "text.disabled",
                    mt: "8px",
                    pt: "8px",
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  Actualizado: {formatDate(uf.lastUpdate)}
                </Typography>
              </Paper>
            </Fade>
          )}
        </Popper>
      )}
    </>
  );
};

export default EconomicIndicators;
