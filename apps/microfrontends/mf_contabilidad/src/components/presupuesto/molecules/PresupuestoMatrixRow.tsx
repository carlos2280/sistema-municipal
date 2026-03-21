import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { type Theme, alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { memo, useCallback, useRef } from 'react';
import type { FilaMatrix, SubprogramaItem } from '@/types/presupuesto.types';
import MontoAreaInput, { type MontoAreaInputHandle } from '../atoms/MontoAreaInput';
import MontoInput, { type MontoInputHandle } from '../atoms/MontoInput';

interface PresupuestoMatrixRowProps {
  fila: FilaMatrix;
  areasVisibles: SubprogramaItem[];
  gridTemplate: string;
  discrepanciaDelta: number | null;
  isWarnChild: boolean;
  isDeleteTarget: boolean;
  onMontoConfirm: (clientId: string, monto: number) => void;
  onMontoAreaConfirm: (clientId: string, subprogramaId: number, montoPesos: number) => void;
  onRecalcular: (clientId: string) => void;
  onEliminar: (clientId: string) => void;
  onTab: (clientId: string, shiftKey: boolean) => void;
  onTabArea: (clientId: string, currentAreaIndex: number, shiftKey: boolean) => void;
  onEnterArea: (clientId: string, areaIndex: number) => void;
  loading?: boolean;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const NIVEL_INDENT = 18;

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

// ─── Helpers de estilo ────────────────────────────────────────────────────────

function getRowSx(
  depth: number,
  hasDiscrepancia: boolean,
  isWarnChild: boolean,
  isDeleteTarget: boolean,
  gridTemplate: string,
) {
  return (t: Theme) => ({
    display: 'grid',
    gridTemplateColumns: gridTemplate,
    alignItems: 'center',
    height: '34px',
    contentVisibility: 'auto',
    containIntrinsicSize: 'auto 34px',
    borderBottom: `1px solid ${t.meridian?.borders?.default ?? t.palette.divider}`,
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
          '&:hover': { bgcolor: t.meridian?.surfaces?.s3 ?? alpha(t.palette.action.hover, 1) },
        }),
    }),
    '& .row-actions': { opacity: 0, transition: 'opacity 120ms' },
    '&:hover .row-actions': { opacity: 1 },
    '&:hover .area-bar': { opacity: 1 },
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

// ─── Componente ──────────────────────────────────────────────────────────────

function PresupuestoMatrixRow({
  fila,
  areasVisibles,
  gridTemplate,
  discrepanciaDelta,
  isWarnChild,
  isDeleteTarget,
  onMontoConfirm,
  onMontoAreaConfirm,
  onRecalcular,
  onEliminar,
  onTab,
  onTabArea,
  onEnterArea,
  loading = false,
}: PresupuestoMatrixRowProps) {
  const montoRef = useRef<MontoInputHandle>(null);
  const areaRefs = useRef<Map<number, MontoAreaInputHandle>>(new Map());
  const depth = fila.nivel;
  const isLeaf = depth >= 4;
  const hasDiscrepancia = discrepanciaDelta !== null && discrepanciaDelta !== 0;

  const handleMontoConfirm = useCallback(
    (monto: number) => onMontoConfirm(fila._clientId, monto),
    [fila._clientId, onMontoConfirm],
  );

  const handleTabMonto = useCallback(
    (shiftKey: boolean) => onTab(fila._clientId, shiftKey),
    [fila._clientId, onTab],
  );

  const handleAreaConfirm = useCallback(
    (subprogramaId: number, montoPesos: number) => {
      onMontoAreaConfirm(fila._clientId, subprogramaId, montoPesos);
    },
    [fila._clientId, onMontoAreaConfirm],
  );

  const handleTabArea = useCallback(
    (areaIndex: number, shiftKey: boolean) => {
      onTabArea(fila._clientId, areaIndex, shiftKey);
    },
    [fila._clientId, onTabArea],
  );

  const handleEnterArea = useCallback(
    (areaIndex: number) => {
      onEnterArea(fila._clientId, areaIndex);
    },
    [fila._clientId, onEnterArea],
  );

  return (
    <Box sx={getRowSx(depth, hasDiscrepancia, isWarnChild, isDeleteTarget, gridTemplate)}>
      {/* Col 1: Código */}
      <div
        style={{ ...cellBase, paddingLeft: `${14 + depth * NIVEL_INDENT}px` }}
      >
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
          {fila.cuenta?.codigo ?? '—'}
        </Typography>
      </div>

      {/* Col 2: Nombre */}
      <div style={{ ...cellBase }}>
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
          {fila.cuenta?.nombre ?? ''}
        </Typography>
      </div>

      {/* Area columns (solo si hay subprogramas) */}
      {areasVisibles.map((area, idx) => {
        const monto = fila.distribucion.get(area.id) ?? 0;
        const paletteColor = area.color === 'default' ? 'grey' : area.color;
        return (
          <Box
            key={area.id}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: 0.5,
              height: '100%',
            }}
          >
            {monto > 0 && (
              <Box
                className="area-bar"
                sx={(t) => ({
                  position: 'absolute',
                  left: 0,
                  top: '25%',
                  bottom: '25%',
                  width: 3,
                  borderRadius: 1,
                  bgcolor: alpha(
                    (t.palette[paletteColor as keyof typeof t.palette] as { main: string })?.main ??
                      t.palette.primary.main,
                    0.4,
                  ),
                  opacity: 0,
                  transition: 'none',
                })}
              />
            )}
            <MontoAreaInput
              ref={(handle) => {
                if (handle) areaRefs.current.set(area.id, handle);
                else areaRefs.current.delete(area.id);
              }}
              value={monto}
              areaColor={area.color}
              onConfirm={(v) => handleAreaConfirm(area.id, v)}
              onTab={(shift) => handleTabArea(idx, shift)}
              onEnter={() => handleEnterArea(idx)}
            />
          </Box>
        );
      })}

      {/* Col: Monto Total (mismo formato que INGRESOS) */}
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
            onTab={handleTabMonto}
            readOnly={false}
            hasError={hasDiscrepancia}
          />
        </Box>
      </div>

      {/* Col: Status */}
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

      {/* Col: Actions (mismo que INGRESOS) */}
      <div style={{ ...cellBase, justifyContent: 'center', padding: 0 }}>
        <Box
          className="row-actions"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
        >
          <Tooltip title="Editar monto" arrow>
            <IconButton
              size="small"
              onClick={() => montoRef.current?.startEdit()}
              disabled={loading}
              sx={(t) => ({
                width: 24,
                height: 24,
                borderRadius: '4px',
                color: t.meridian?.text?.tx4 ?? t.palette.text.disabled,
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
                color: t.meridian?.text?.tx4 ?? t.palette.text.disabled,
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
}

// ─── Custom areEqual ─────────────────────────────────────────────────────────

function areRowPropsEqual(
  prev: PresupuestoMatrixRowProps,
  next: PresupuestoMatrixRowProps,
): boolean {
  if (prev.fila._clientId !== next.fila._clientId) return false;
  if (prev.fila.montoAnual !== next.fila.montoAnual) return false;
  if (prev.fila.totalDistribucion !== next.fila.totalDistribucion) return false;
  if (prev.fila.distribucion !== next.fila.distribucion) return false;
  if (prev.fila.cuentaId !== next.fila.cuentaId) return false;
  if (prev.fila.nivel !== next.fila.nivel) return false;
  if (prev.fila.cuenta?.codigo !== next.fila.cuenta?.codigo) return false;
  if (prev.fila.cuenta?.nombre !== next.fila.cuenta?.nombre) return false;
  if (prev.discrepanciaDelta !== next.discrepanciaDelta) return false;
  if (prev.isWarnChild !== next.isWarnChild) return false;
  if (prev.isDeleteTarget !== next.isDeleteTarget) return false;
  if (prev.gridTemplate !== next.gridTemplate) return false;
  if (prev.areasVisibles !== next.areasVisibles) return false;
  if (prev.loading !== next.loading) return false;
  return true;
}

export default memo(PresupuestoMatrixRow, areRowPropsEqual);
