import { Box, Typography } from '@mui/material';
import { memo, useMemo } from 'react';
import type {
  CentrosCostoItem,
  CuentaPresupuestaria,
  FilaDisplay,
} from '../../../types/presupuesto.types';
import PresupuestoDetalleRow from '../molecules/PresupuestoDetalleRow';

interface PresupuestoGridProps {
  filas: FilaDisplay[];
  cuentasDisponibles: CuentaPresupuestaria[];
  centrosCosto: CentrosCostoItem[];
  cuentasEnUso: number[];
  discrepanciasMap: Map<string, number | null>;
  deleteTargetIds: Set<string>;
  tipoTab: 'ingresos' | 'gastos';
  searchFilter: string;
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
  isSaving?: boolean;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/**
 * CSS Grid template para columnas (compartido con el Row).
 * Cuenta(180) | Nombre(1fr) | ÁreaGestión(150) | Monto(170) | Status(36) | Actions(70)
 */
export const GRID_TEMPLATE = '180px 1fr 150px 170px 36px 70px';

const headerCellBase = {
  fontSize: '9.5px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'primary.main',
  py: '7px',
  px: '14px',
  whiteSpace: 'nowrap' as const,
  display: 'flex',
  alignItems: 'center',
};

/**
 * Organism: grilla del detalle presupuestario.
 *
 * Usa content-visibility: auto en cada fila para que el browser
 * salte layout/paint de filas fuera del viewport.
 * - Zero secciones negras: todas las filas están en el DOM
 * - Zero flickering: no hay mount/unmount durante scroll
 * - Dark/light switch rápido: browser solo re-pinta filas visibles
 * - Compatible con cualquier resolución/pantalla
 */
const PresupuestoGrid = ({
  filas,
  cuentasDisponibles,
  centrosCosto,
  cuentasEnUso,
  discrepanciasMap,
  deleteTargetIds,
  tipoTab,
  searchFilter,
  onCuentaChange,
  onCentroCostoChange,
  onMontoConfirm,
  onRecalcular,
  onEliminar,
  onTab,
  loading = false,
  isSaving = false,
}: PresupuestoGridProps) => {
  const filasFiltradas = useMemo(() => {
    if (!searchFilter.trim()) return filas;
    const q = searchFilter.toLowerCase();
    return filas.filter(
      (f) =>
        f.cuenta?.codigo?.toLowerCase().includes(q) ||
        f.cuenta?.nombre?.toLowerCase().includes(q),
    );
  }, [filas, searchFilter]);

  // Set de descendientes de padres con discrepancia — O(n) con Map lookup
  const warnChildIds = useMemo(() => {
    const ids = new Set<string>();

    const filaMap = new Map<string, FilaDisplay>();
    for (const f of filas) filaMap.set(f._clientId, f);

    const warnParentCodes: string[] = [];
    for (const [clientId, delta] of discrepanciasMap) {
      if (delta !== null && delta !== 0) {
        const fila = filaMap.get(clientId);
        if (fila?.cuenta?.codigo) warnParentCodes.push(fila.cuenta.codigo);
      }
    }
    if (warnParentCodes.length === 0) return ids;

    warnParentCodes.sort((a, b) => a.length - b.length);

    for (const f of filas) {
      if (!f.cuenta?.codigo) continue;
      const code = f.cuenta.codigo;
      for (const parentCode of warnParentCodes) {
        if (code.length > parentCode.length && code.startsWith(parentCode)) {
          ids.add(f._clientId);
          break;
        }
      }
    }
    return ids;
  }, [filas, discrepanciasMap]);

  if (filasFiltradas.length === 0 && !loading) {
    return (
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
          color: 'text.disabled',
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2">
          {searchFilter
            ? 'Sin resultados para la búsqueda'
            : `Sin líneas de ${tipoTab}. Use "Agregar línea" para comenzar.`}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Header fijo ── */}
      <Box
        sx={(t) => ({
          display: 'grid',
          gridTemplateColumns: GRID_TEMPLATE,
          flexShrink: 0,
          bgcolor: t.meridian.surfaces.s1,
          borderBottom: `2px solid ${t.palette.primary.main}`,
        })}
      >
        <Box sx={{ ...headerCellBase }}>Cuenta</Box>
        <Box sx={{ ...headerCellBase }}>Nombre Cuenta</Box>
        <Box sx={{ ...headerCellBase, justifyContent: 'center' }}>
          Área Gestión
        </Box>
        <Box sx={{ ...headerCellBase, justifyContent: 'flex-end' }}>
          Total Anual ($)
        </Box>
        <Box />
        <Box />
      </Box>

      {/* ── Body scrollable ── */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        {filasFiltradas.map((fila) => (
          <PresupuestoDetalleRow
            key={fila._clientId}
            fila={fila}
            cuentasDisponibles={cuentasDisponibles}
            centrosCosto={centrosCosto}
            cuentasEnUso={cuentasEnUso}
            discrepanciaDelta={discrepanciasMap.get(fila._clientId) ?? null}
            isWarnChild={warnChildIds.has(fila._clientId)}
            isDeleteTarget={deleteTargetIds.has(fila._clientId)}
            tipoTab={tipoTab}
            onCuentaChange={onCuentaChange}
            onCentroCostoChange={onCentroCostoChange}
            onMontoConfirm={onMontoConfirm}
            onRecalcular={onRecalcular}
            onEliminar={onEliminar}
            onTab={onTab}
            loading={isSaving}
          />
        ))}
      </Box>
    </Box>
  );
};

export default memo(PresupuestoGrid);
