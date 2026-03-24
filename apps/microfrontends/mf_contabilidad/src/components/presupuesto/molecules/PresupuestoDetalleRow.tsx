import {
  AlertCircle as ErrorOutlineIcon,
  AlertTriangle as WarningAmberIcon,
  Pencil as EditOutlinedIcon,
  Trash2 as DeleteOutlineIcon,
} from 'lucide-react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { type Theme, alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import type { CentrosCostoItem, CuentaPresupuestaria } from 'mf_store/store';
import { memo, useCallback, useRef } from 'react';
import type { FilaDisplay } from '../../../types/presupuesto.types';
import CentroCostoAutocomplete from '../atoms/CentroCostoAutocomplete';
import CuentaAutocomplete from '../atoms/CuentaAutocomplete';
import MontoInput, { type MontoInputHandle } from '../atoms/MontoInput';

interface PresupuestoDetalleRowProps {
  fila: FilaDisplay;
  cuentasDisponibles: CuentaPresupuestaria[];
  centrosCosto: CentrosCostoItem[];
  cuentasEnUso: number[];
  discrepanciaDelta: number | null;
  isWarnChild?: boolean;
  isDeleteTarget?: boolean;
  tipoTab: 'ingresos' | 'gastos';
  onCuentaChange: (
    clientId: string,
    cuenta: CuentaPresupuestaria | null,
  ) => void;
  onCentroCostoChange: (clientId: string, cc: CentrosCostoItem | null) => void;
  onMontoConfirm: (clientId: string, monto: number) => void;
  onRecalcular: (clientId: string) => void;
  onEliminar: (clientId: string) => void;
  onTab: (clientId: string, shiftKey: boolean) => void;
  loading?: boolean;
}

// ─── Constantes y estilos estáticos (fuera del componente) ──────────────────

const NIVEL_INDENT = 18;

/**
 * Grid template idéntico al header del Grid.
 * Cuenta(180) | Nombre(1fr) | ÁreaGestión(150) | Monto(170) | Status(36) | Actions(70)
 */
const GRID_TEMPLATE = '180px 1fr 150px 170px 36px 70px';

const pulseRecalc = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.3); }
  50% { box-shadow: 0 0 0 4px rgba(220, 38, 38, 0); }
`;

const numFontSx = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontFeatureSettings: "'tnum' 1, 'ss01' 1",
} as const;

const cellBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
  overflow: 'hidden',
  padding: '0 14px',
};

// ─── Helpers de estilo (functions puras, sin closures costosas) ─────────────

function getRowSx(
  depth: number,
  hasDiscrepancia: boolean,
  isWarnChild: boolean,
  isDeleteTarget: boolean,
) {
  return (t: Theme) => ({
    display: 'grid',
    gridTemplateColumns: GRID_TEMPLATE,
    alignItems: 'center',
    height: '34px',
    // content-visibility: auto → el browser salta layout/paint de filas fuera del viewport.
    // Equivale a virtualización nativa sin mount/unmount → zero secciones negras.
    contentVisibility: 'auto',
    containIntrinsicSize: 'auto 34px',
    borderBottom: `1px solid ${t.meridian.borders.default}`,
    transition: 'background 80ms',
    // Delete target: prioridad máxima
    ...(isDeleteTarget && {
      bgcolor: alpha(t.palette.error.main, 0.06),
      borderLeft: `3px solid ${t.palette.error.main}`,
      '& .MuiTypography-root': { color: alpha(t.palette.error.main, 0.7) },
      '& .row-actions': { opacity: 1 },
    }),
    // Estados normales
    ...(!isDeleteTarget && {
      ...(depth === 0 &&
        !hasDiscrepancia &&
        !isWarnChild && {
          bgcolor: alpha(t.palette.primary.main, 0.02),
          '&:hover': { bgcolor: alpha(t.palette.primary.main, 0.05) },
        }),
      ...(hasDiscrepancia && {
        borderLeft: `3px solid ${t.palette.warning.main}`,
        bgcolor: alpha(t.palette.warning.main, 0.06),
      }),
      ...(!hasDiscrepancia &&
        isWarnChild && {
          borderLeft: `2px solid ${alpha(t.palette.warning.main, 0.25)}`,
          bgcolor: alpha(t.palette.warning.main, 0.025),
        }),
      ...(!hasDiscrepancia &&
        !isWarnChild &&
        depth > 0 && {
          '&:hover': { bgcolor: t.meridian.surfaces.s3 },
        }),
    }),
    '& .row-actions': { opacity: 0, transition: 'opacity 120ms' },
    '&:hover .row-actions': { opacity: 1 },
  });
}

function getMontoColor(
  hasDiscrepancia: boolean,
  isWarnChild: boolean,
  depth: number,
) {
  return (t: Theme) =>
    hasDiscrepancia
      ? t.palette.warning.main
      : isWarnChild
        ? alpha(t.palette.warning.main, 0.7)
        : depth >= 3
          ? t.palette.text.secondary
          : t.palette.text.primary;
}

// ─── Componente ─────────────────────────────────────────────────────────────

const PresupuestoDetalleRow = ({
  fila,
  cuentasDisponibles,
  centrosCosto,
  cuentasEnUso,
  discrepanciaDelta,
  isWarnChild = false,
  isDeleteTarget = false,
  tipoTab,
  onCuentaChange,
  onCentroCostoChange,
  onMontoConfirm,
  onRecalcular,
  onEliminar,
  onTab,
  loading = false,
}: PresupuestoDetalleRowProps) => {
  const montoRef = useRef<MontoInputHandle>(null);

  const handleMontoConfirm = useCallback(
    (monto: number) => onMontoConfirm(fila._clientId, monto),
    [fila._clientId, onMontoConfirm],
  );

  const handleTab = useCallback(
    (shiftKey: boolean) => onTab(fila._clientId, shiftKey),
    [fila._clientId, onTab],
  );

  const showPicker = !fila.cuentaId;
  const hasDiscrepancia = discrepanciaDelta !== null && discrepanciaDelta !== 0;
  const depth = fila.nivel;
  const isLeaf = depth >= 4;

  return (
    <Box sx={getRowSx(depth, hasDiscrepancia, isWarnChild, isDeleteTarget)}>
      {/* Col 1: Código */}
      <div
        style={{ ...cellBase, paddingLeft: `${14 + depth * NIVEL_INDENT}px` }}
      >
        {showPicker ? (
          <CuentaAutocomplete
            value={fila.cuenta ?? null}
            options={cuentasDisponibles}
            excludeIds={cuentasEnUso}
            tipo={tipoTab === 'ingresos' ? 'ingreso' : 'gasto'}
            onChange={(c) => onCuentaChange(fila._clientId, c)}
            autoFocus
            size="small"
          />
        ) : (
          <Typography
            component="span"
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontWeight: depth === 0 ? 600 : 500,
              color: depth >= 4 ? 'text.disabled' : 'text.secondary',
              fontSize: depth === 0 ? '12px' : depth >= 4 ? '10px' : '11px',
              letterSpacing: '0.02em',
              fontFeatureSettings: "'tnum' 1",
            }}
          >
            {fila.cuenta?.codigo}
          </Typography>
        )}
      </div>

      {/* Col 2: Nombre */}
      <div style={{ ...cellBase }}>
        {showPicker ? (
          <Typography
            component="span"
            sx={{
              color: 'text.disabled',
              fontStyle: 'italic',
              fontSize: '12.5px',
            }}
          >
            {fila.cuenta?.nombre ?? ''}
          </Typography>
        ) : (
          <Typography
            component="span"
            noWrap
            sx={{
              fontSize: isLeaf ? '12px' : '12.5px',
              fontWeight: depth === 0 ? 700 : depth === 1 ? 600 : 400,
              color:
                depth === 0
                  ? 'text.primary'
                  : isLeaf
                    ? 'text.disabled'
                    : depth >= 2
                      ? 'text.secondary'
                      : 'text.primary',
            }}
          >
            {fila.cuenta?.nombre}
          </Typography>
        )}
      </div>

      {/* Col 3: Área Gestión */}
      <div style={{ ...cellBase, justifyContent: 'center' }}>
        {fila.isNew ? (
          <CentroCostoAutocomplete
            value={fila.centroCosto ?? null}
            options={centrosCosto}
            onChange={(cc) => onCentroCostoChange(fila._clientId, cc)}
            size="small"
          />
        ) : fila.centroCosto?.codigo ? (
          <Box
            component="span"
            sx={(t) => ({
              display: 'inline-block',
              px: '5px',
              py: '2px',
              borderRadius: '4px',
              bgcolor: t.meridian.surfaces.s3,
              border: `1px solid ${t.meridian.borders.muted}`,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '9.5px',
              fontWeight: 500,
              color: 'text.disabled',
              cursor: 'pointer',
              maxWidth: 130,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'border-color 150ms, color 150ms',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
            })}
          >
            {fila.centroCosto.codigo}
          </Box>
        ) : (
          <span
            style={{
              color: 'var(--mui-palette-text-disabled)',
              fontSize: '11px',
            }}
          >
            —
          </span>
        )}
      </div>

      {/* Col 4: Monto */}
      <div
        style={{
          ...cellBase,
          justifyContent: 'flex-end',
          ...numFontSx,
          fontSize: '12.5px',
          fontWeight: depth === 0 ? 700 : depth === 1 ? 600 : 500,
          letterSpacing: '-0.01em',
        }}
      >
        <Box
          data-monto-id={fila._clientId}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.75,
            color: getMontoColor(hasDiscrepancia, isWarnChild, depth),
          }}
        >
          <MontoInput
            ref={montoRef}
            value={fila.montoAnual}
            onConfirm={handleMontoConfirm}
            onTab={handleTab}
            readOnly={showPicker}
            hasError={hasDiscrepancia}
          />
        </Box>
      </div>

      {/* Col 5: Status */}
      <div style={{ ...cellBase, justifyContent: 'center', padding: 0 }}>
        {hasDiscrepancia ? (
          <Tooltip
            title="Descuadre: hijos no coinciden con padre — click para recalcular"
            arrow
          >
            <IconButton
              size="small"
              onClick={() => onRecalcular(fila._clientId)}
              disabled={loading}
              sx={(t) => ({
                width: 18,
                height: 18,
                color: t.palette.warning.main,
                animation: `${pulseRecalc} 2s infinite`,
                '&:hover': { color: 'primary.main', animation: 'none' },
              })}
            >
              <WarningAmberIcon sx={{ fontSize: '14px' }} />
            </IconButton>
          </Tooltip>
        ) : isWarnChild ? (
          <Tooltip title="Revisar: padre tiene descuadre" arrow>
            <Box
              sx={(t) => ({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                color: alpha(t.palette.warning.main, 0.5),
              })}
            >
              <ErrorOutlineIcon sx={{ fontSize: '12px' }} />
            </Box>
          </Tooltip>
        ) : (
          <Box
            component="span"
            sx={{ fontSize: '10px', color: 'success.main' }}
          >
            &#10003;
          </Box>
        )}
      </div>

      {/* Col 6: Actions */}
      <div style={{ ...cellBase, justifyContent: 'center', padding: 0 }}>
        <Box
          className="row-actions"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
        >
          <Tooltip title="Editar monto" arrow>
            <IconButton
              size="small"
              onClick={() => montoRef.current?.startEdit()}
              disabled={loading || showPicker}
              sx={(t) => ({
                width: 24,
                height: 24,
                borderRadius: '4px',
                color: t.meridian.text.tx4,
                transition: 'all 120ms',
                '&:hover': {
                  bgcolor: alpha(t.palette.primary.main, 0.08),
                  color: 'primary.main',
                },
              })}
            >
              <EditOutlinedIcon sx={{ fontSize: '12px' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar línea" arrow>
            <IconButton
              size="small"
              onClick={() => onEliminar(fila._clientId)}
              disabled={loading}
              sx={(t) => ({
                width: 24,
                height: 24,
                borderRadius: '4px',
                color: t.meridian.text.tx4,
                transition: 'all 120ms',
                '&:hover': {
                  bgcolor: alpha(t.palette.error.main, 0.1),
                  color: 'error.main',
                },
              })}
            >
              <DeleteOutlineIcon sx={{ fontSize: '12px' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </div>
    </Box>
  );
};

// ─── Custom areEqual: solo re-renderiza cuando cambian datos visibles ────────

function areRowPropsEqual(
  prev: PresupuestoDetalleRowProps,
  next: PresupuestoDetalleRowProps,
): boolean {
  // Datos de la fila que afectan el render
  if (prev.fila._clientId !== next.fila._clientId) return false;
  if (prev.fila.montoAnual !== next.fila.montoAnual) return false;
  if (prev.fila.cuentaId !== next.fila.cuentaId) return false;
  if (prev.fila.nivel !== next.fila.nivel) return false;
  if (prev.fila.isNew !== next.fila.isNew) return false;
  if (prev.fila.cuenta?.codigo !== next.fila.cuenta?.codigo) return false;
  if (prev.fila.cuenta?.nombre !== next.fila.cuenta?.nombre) return false;
  if (prev.fila.centroCosto?.codigo !== next.fila.centroCosto?.codigo)
    return false;

  // Flags visuales
  if (prev.discrepanciaDelta !== next.discrepanciaDelta) return false;
  if (prev.isWarnChild !== next.isWarnChild) return false;
  if (prev.isDeleteTarget !== next.isDeleteTarget) return false;
  if (prev.loading !== next.loading) return false;
  if (prev.tipoTab !== next.tipoTab) return false;

  return true;
}

export default memo(PresupuestoDetalleRow, areRowPropsEqual);
