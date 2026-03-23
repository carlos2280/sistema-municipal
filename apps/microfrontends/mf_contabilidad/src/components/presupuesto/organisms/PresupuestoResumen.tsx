import type {
  EquilibrioState,
  FilaDisplay,
  FilaMatrix,
  SubprogramaItem,
} from '@/types/presupuesto.types';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BalanceIcon from '@mui/icons-material/Balance';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';
import { formatCLP } from '../atoms/MontoInput';

const numFontSx = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontFeatureSettings: "'tnum' 1, 'ss01' 1",
} as const;

interface PresupuestoResumenProps {
  filasIngresos: FilaDisplay[];
  filasGastos: FilaDisplay[];
  discrepanciasIngresosMap: Map<string, number | null>;
  discrepanciasGastosMap: Map<string, number | null>;
  equilibrio: EquilibrioState;
  subprogramas?: SubprogramaItem[];
  filasMatrixGastos?: FilaMatrix[];
}

interface ResumenGrupo {
  codigo: string;
  nombre: string;
  total: number;
  /** true si esta cuenta raíz o alguno de sus descendientes tiene discrepancia */
  hasDiscrepancia: boolean;
}

interface ResumenCC {
  codigo: string;
  nombre: string;
  ingresos: number;
  gastos: number;
  saldo: number;
}

/**
 * Construye los grupos raíz para el resumen.
 * Detecta discrepancias: si la cuenta raíz o cualquier descendiente tiene delta !== 0.
 */
const sumarFilasRaiz = (
  filas: FilaDisplay[],
  discrepanciasMap: Map<string, number | null>,
): ResumenGrupo[] => {
  const grupos = new Map<string, ResumenGrupo>();

  for (const f of filas) {
    if (!f.cuenta || f.cuenta.parentId !== null) continue;
    const key = f.cuenta.codigo;
    const existing = grupos.get(key);
    if (existing) {
      existing.total += f.montoAnual;
    } else {
      grupos.set(key, {
        codigo: f.cuenta.codigo,
        nombre: f.cuenta.nombre,
        total: f.montoAnual,
        hasDiscrepancia: false,
      });
    }
  }

  // Detectar si algún nodo del subárbol tiene discrepancia
  for (const [clientId, delta] of discrepanciasMap) {
    if (delta === null || delta === 0) continue;
    // Encontrar la cuenta raíz de este clientId
    const fila = filas.find((f) => f._clientId === clientId);
    if (!fila?.cuenta?.codigo) continue;
    // Buscar a qué grupo raíz pertenece
    for (const [rootCode, grupo] of grupos) {
      if (
        fila.cuenta.codigo === rootCode ||
        fila.cuenta.codigo.startsWith(rootCode)
      ) {
        grupo.hasDiscrepancia = true;
        break;
      }
    }
  }

  return Array.from(grupos.values()).sort((a, b) =>
    a.codigo.localeCompare(b.codigo),
  );
};

const agruparPorCC = (
  filasIngresos: FilaDisplay[],
  filasGastos: FilaDisplay[],
): ResumenCC[] => {
  const map = new Map<string, ResumenCC>();
  const add = (filas: FilaDisplay[], tipo: 'ingresos' | 'gastos') => {
    for (const f of filas) {
      const key = f.centroCosto?.codigo ?? '(sin C.Costo)';
      const nombre = f.centroCosto?.nombre ?? 'Sin Centro de Costo';
      if (!map.has(key))
        map.set(key, { codigo: key, nombre, ingresos: 0, gastos: 0, saldo: 0 });
      const e = map.get(key) as ResumenCC;
      if (tipo === 'ingresos') e.ingresos += f.montoAnual;
      else e.gastos += f.montoAnual;
    }
  };
  add(filasIngresos, 'ingresos');
  add(filasGastos, 'gastos');
  for (const e of map.values()) e.saldo = e.ingresos - e.gastos;
  return Array.from(map.values()).sort((a, b) =>
    a.codigo.localeCompare(b.codigo),
  );
};

// ── Sub-componente: card del resumen (Ingresos o Gastos) ──────────────────────

const ResumenCard = ({
  icon,
  iconBg,
  iconColor,
  title,
  rows,
  totalLabel,
  totalValue,
  totalColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  rows: ResumenGrupo[];
  totalLabel: string;
  totalValue: number;
  totalColor: string;
}) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* Header */}
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 0.75,
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}
      >
        {title}
      </Typography>
    </Box>

    {/* Body — flex: 1 para que el total quede siempre al fondo alineado */}
    <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
      {rows.map((g, i) => (
        <Box
          key={g.codigo}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 0.875,
            borderTop: i === 0 ? 'none' : '1px solid',
            borderColor: 'divider',
            // Resaltar fila con discrepancia
            ...(g.hasDiscrepancia && {
              borderLeft: (t) => `3px solid ${t.palette.warning.main}`,
              bgcolor: (t) => alpha(t.palette.warning.main, 0.04),
              mx: -2,
              px: 2,
              pl: '13px',
            }),
          }}
        >
          <Typography
            component="span"
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontWeight: 600,
              color: g.hasDiscrepancia ? 'warning.main' : 'text.disabled',
              mr: 1,
              minWidth: 44,
              fontSize: '10px',
              letterSpacing: '0.02em',
              flexShrink: 0,
            }}
          >
            {g.codigo}
          </Typography>
          <Typography
            component="span"
            sx={{
              flex: 1,
              color: 'text.secondary',
              fontSize: '12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {g.nombre}
          </Typography>
          {/* Icono de discrepancia */}
          {g.hasDiscrepancia && (
            <WarningAmberIcon
              sx={{
                fontSize: '12px',
                color: 'warning.main',
                mx: 0.5,
                flexShrink: 0,
              }}
            />
          )}
          <Typography
            component="span"
            sx={{
              ...numFontSx,
              fontWeight: 600,
              ml: g.hasDiscrepancia ? 0.5 : 2,
              fontSize: '12px',
              color: g.hasDiscrepancia ? 'warning.main' : 'text.primary',
              flexShrink: 0,
            }}
          >
            $ {formatCLP(g.total)}
          </Typography>
        </Box>
      ))}
    </Box>

    {/* Total row — siempre al fondo */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        bgcolor: 'background.default',
        borderTop: '2px solid',
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: totalColor,
        }}
      >
        {totalLabel}
      </Typography>
      <Typography
        component="span"
        sx={{
          ...numFontSx,
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: totalColor,
        }}
      >
        $ {formatCLP(totalValue)}
      </Typography>
    </Box>
  </Box>
);

/**
 * Organism: tab de Resumen/Equilibrio presupuestario.
 * - Cards Ingresos/Gastos con totales alineados al fondo
 * - Indicador ⚠ en cuentas raíz con discrepancia en su árbol
 * - Card Equilibrio + Card Centro de Costo full-width
 */
const PresupuestoResumen = ({
  filasIngresos,
  filasGastos,
  discrepanciasIngresosMap,
  discrepanciasGastosMap,
  equilibrio,
  subprogramas = [],
  filasMatrixGastos = [],
}: PresupuestoResumenProps) => {
  const gruposIngresos = useMemo(
    () => sumarFilasRaiz(filasIngresos, discrepanciasIngresosMap),
    [filasIngresos, discrepanciasIngresosMap],
  );
  const gruposGastos = useMemo(
    () => sumarFilasRaiz(filasGastos, discrepanciasGastosMap),
    [filasGastos, discrepanciasGastosMap],
  );
  const porCC = useMemo(
    () => agruparPorCC(filasIngresos, filasGastos),
    [filasIngresos, filasGastos],
  );

  // Distribución por subprograma
  const distribucionSubprogramas = useMemo(() => {
    if (subprogramas.length === 0 || filasMatrixGastos.length === 0) return [];
    const totales = new Map<number, number>();
    for (const fila of filasMatrixGastos) {
      if (fila.nivel !== 0) continue;
      for (const [subId, monto] of fila.distribucion) {
        totales.set(subId, (totales.get(subId) ?? 0) + monto);
      }
    }
    const totalGeneral = [...totales.values()].reduce((a, b) => a + b, 0);
    return subprogramas
      .filter((s) => (totales.get(s.id) ?? 0) > 0)
      .map((s) => ({
        ...s,
        total: totales.get(s.id) ?? 0,
        pct:
          totalGeneral > 0
            ? ((totales.get(s.id) ?? 0) / totalGeneral) * 100
            : 0,
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [subprogramas, filasMatrixGastos]);

  const { totalIngresos, totalGastos, diferencia, estado } = equilibrio;
  const isOk = estado === 'ok';
  const isWarning = estado === 'warning';

  return (
    <Box
      sx={{
        px: 3,
        py: 3,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2.5,
      }}
    >
      {/* Card Ingresos */}
      <ResumenCard
        icon={<ArrowDownwardIcon sx={{ fontSize: '1rem' }} />}
        iconBg="action.selected"
        iconColor="success.main"
        title="Ingresos"
        rows={gruposIngresos}
        totalLabel="Total Ingresos"
        totalValue={totalIngresos}
        totalColor="success.main"
      />

      {/* Card Gastos */}
      <ResumenCard
        icon={<ArrowUpwardIcon sx={{ fontSize: '1rem' }} />}
        iconBg="action.selected"
        iconColor="error.main"
        title="Gastos"
        rows={gruposGastos}
        totalLabel="Total Gastos"
        totalValue={totalGastos}
        totalColor="error.main"
      />

      {/* Card Equilibrio — full width */}
      <Box
        sx={{
          gridColumn: { xs: '1', md: '1 / -1' },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0.75,
              bgcolor: 'action.selected',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BalanceIcon sx={{ fontSize: '1rem' }} />
          </Box>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            Equilibrio Presupuestario
          </Typography>
        </Box>

        <Box sx={{ px: 2, py: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: 3,
              alignItems: 'center',
              pb: 2,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '9px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'text.disabled',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                Total Ingresos
              </Typography>
              <Typography
                sx={{
                  ...numFontSx,
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'success.main',
                }}
              >
                $ {formatCLP(totalIngresos)}
              </Typography>
            </Box>
            <Typography
              sx={{ fontSize: '14px', color: 'text.disabled', fontWeight: 300 }}
            >
              =
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '9px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'text.disabled',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                Total Gastos
              </Typography>
              <Typography
                sx={{
                  ...numFontSx,
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'error.main',
                }}
              >
                $ {formatCLP(totalGastos)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              pt: 2,
              borderTop: '2px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '9px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'text.disabled',
                display: 'block',
                mb: 1,
              }}
            >
              Diferencia
            </Typography>
            <Box
              sx={(t) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                ...numFontSx,
                fontSize: '22px',
                fontWeight: 700,
                px: 2,
                py: 0.75,
                borderRadius: 1,
                bgcolor: isOk
                  ? alpha(t.palette.success.main, 0.08)
                  : isWarning
                    ? alpha(t.palette.warning.main, 0.08)
                    : alpha(t.palette.error.main, 0.08),
                border: `1px solid ${
                  isOk
                    ? alpha(t.palette.success.main, 0.2)
                    : isWarning
                      ? alpha(t.palette.warning.main, 0.2)
                      : alpha(t.palette.error.main, 0.2)
                }`,
                color: isOk
                  ? 'success.main'
                  : isWarning
                    ? 'warning.main'
                    : 'error.main',
              })}
            >
              {isOk ? (
                <CheckCircleOutlineIcon sx={{ fontSize: '1.25rem' }} />
              ) : (
                <WarningAmberIcon sx={{ fontSize: '1.25rem' }} />
              )}
              {diferencia > 0 ? '+' : ''}$ {formatCLP(diferencia)}
            </Box>
            {!isOk && (
              <Typography
                variant="body2"
                sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}
              >
                {isWarning
                  ? 'Existen discrepancias padre/hijo pendientes de recalcular.'
                  : diferencia < 0
                    ? 'Gastos superan ingresos. Ajuste las partidas para equilibrar.'
                    : 'Ingresos superan gastos. Ajuste las partidas para equilibrar.'}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Card Distribución por Centro de Costo — full width */}
      <Box
        sx={{
          gridColumn: { xs: '1', md: '1 / -1' },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0.75,
              bgcolor: 'action.selected',
              color: 'info.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BusinessIcon sx={{ fontSize: '1rem' }} />
          </Box>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            Distribución por Centro de Costo
          </Typography>
        </Box>

        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.8125rem',
          }}
        >
          <Box component="thead">
            <Box component="tr">
              {['Centro de Costo', 'Ingresos', 'Gastos', 'Saldo'].map(
                (h, i) => (
                  <Box
                    key={h}
                    component="th"
                    sx={{
                      px: 2,
                      py: 1,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'text.disabled',
                      textAlign: i === 0 ? 'left' : 'right',
                    }}
                  >
                    {h}
                  </Box>
                ),
              )}
            </Box>
          </Box>
          <Box component="tbody">
            {porCC.map((cc) => (
              <Box
                key={cc.codigo}
                component="tr"
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                  '& td': { borderBottom: '1px solid', borderColor: 'divider' },
                }}
              >
                <Box
                  component="td"
                  sx={{
                    px: 2,
                    py: 1,
                    color: 'text.primary',
                    verticalAlign: 'middle',
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      px: '5px',
                      py: '1px',
                      mr: 1,
                      borderRadius: '3px',
                      bgcolor: 'action.selected',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'text.disabled',
                      minWidth: 44,
                      flexShrink: 0,
                    }}
                  >
                    {cc.codigo}
                  </Box>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    {cc.nombre}
                  </Typography>
                </Box>
                <Box
                  component="td"
                  sx={{
                    px: 2,
                    py: 1,
                    textAlign: 'right',
                    ...numFontSx,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'success.main',
                  }}
                >
                  {formatCLP(cc.ingresos)}
                </Box>
                <Box
                  component="td"
                  sx={{
                    px: 2,
                    py: 1,
                    textAlign: 'right',
                    ...numFontSx,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'error.main',
                  }}
                >
                  {formatCLP(cc.gastos)}
                </Box>
                <Box
                  component="td"
                  sx={{
                    px: 2,
                    py: 1,
                    textAlign: 'right',
                    ...numFontSx,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: cc.saldo >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  {cc.saldo > 0 ? '+' : ''}
                  {formatCLP(cc.saldo)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      {/* ── Distribución por Subprograma (Gastos) ── */}
      {distribucionSubprogramas.length > 0 && (
        <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
          <Box
            sx={(t) => ({
              bgcolor: t.meridian?.surfaces?.s1 ?? 'background.paper',
              borderRadius: 2,
              border: `1px solid ${t.palette.divider}`,
              overflow: 'hidden',
            })}
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: 'text.primary' }}
              >
                Distribución por Subprograma (Gastos)
              </Typography>
            </Box>

            <Box
              component="table"
              sx={{ width: '100%', borderCollapse: 'collapse' }}
            >
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: 'action.hover' }}>
                  <Box
                    component="th"
                    sx={{
                      px: 2.5,
                      py: 1,
                      textAlign: 'left',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'text.disabled',
                    }}
                  >
                    Subprograma
                  </Box>
                  <Box
                    component="th"
                    sx={{
                      px: 2,
                      py: 1,
                      textAlign: 'right',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'text.disabled',
                    }}
                  >
                    Monto (M$)
                  </Box>
                  <Box
                    component="th"
                    sx={{
                      px: 2,
                      py: 1,
                      textAlign: 'right',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'text.disabled',
                      width: 80,
                    }}
                  >
                    %
                  </Box>
                  <Box
                    component="th"
                    sx={{
                      px: 2,
                      py: 1,
                      textAlign: 'left',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'text.disabled',
                      width: 200,
                    }}
                  >
                    Distribución
                  </Box>
                </Box>
              </Box>

              <Box component="tbody">
                {distribucionSubprogramas.map((sub) => {
                  const maxPct = distribucionSubprogramas[0]?.pct ?? 100;
                  const barWidth = maxPct > 0 ? (sub.pct / maxPct) * 100 : 0;
                  const paletteColor =
                    sub.color === 'default' ? 'grey' : sub.color;
                  return (
                    <Box
                      key={sub.id}
                      component="tr"
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        component="td"
                        sx={{
                          px: 2.5,
                          py: 1.25,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: `${paletteColor}.main`,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          component="span"
                          sx={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '10px',
                            fontWeight: 600,
                            color: 'text.disabled',
                            mr: 0.5,
                          }}
                        >
                          {sub.abreviatura}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sub.nombre}
                        </Typography>
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          px: 2,
                          py: 1.25,
                          textAlign: 'right',
                          ...numFontSx,
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'text.primary',
                        }}
                      >
                        {Math.round(sub.total / 1000).toLocaleString('es-CL')}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          px: 2,
                          py: 1.25,
                          textAlign: 'right',
                          ...numFontSx,
                          fontSize: '11px',
                          fontWeight: 500,
                          color: 'text.secondary',
                        }}
                      >
                        {sub.pct.toFixed(1)}%
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.25 }}>
                        <Box
                          sx={(t) => ({
                            height: 6,
                            borderRadius: 3,
                            width: `${barWidth}%`,
                            bgcolor:
                              (
                                t.palette[
                                  paletteColor as keyof typeof t.palette
                                ] as { main: string }
                              )?.main ?? t.palette.primary.main,
                            minWidth: barWidth > 0 ? 4 : 0,
                          })}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PresupuestoResumen;
