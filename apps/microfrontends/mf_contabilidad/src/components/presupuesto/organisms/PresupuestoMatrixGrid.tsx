import { Box, Typography } from '@mui/material';
import { memo, useMemo } from 'react';
import type { FilaMatrix, SubprogramaItem } from '@/types/presupuesto.types';
import PresupuestoMatrixHeader from '../molecules/PresupuestoMatrixHeader';
import PresupuestoMatrixRow from '../molecules/PresupuestoMatrixRow';

// ─── Grid Template Builder ──────────────────────────────────────────────────

const FROZEN_LEFT = '180px 1fr';
const AREA_COL = '100px';
const FROZEN_RIGHT = '170px 36px 70px';

function buildGridTemplate(areasVisibles: SubprogramaItem[]): string {
  const areaCols = areasVisibles.map(() => AREA_COL).join(' ');
  return `${FROZEN_LEFT} ${areaCols} ${FROZEN_RIGHT}`;
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface PresupuestoMatrixGridProps {
  filas: FilaMatrix[];
  subprogramas: SubprogramaItem[];
  discrepanciasMap: Map<string, number | null>;
  deleteTargetIds: Set<string>;
  searchFilter: string;
  onMontoConfirm: (clientId: string, monto: number) => void;
  onMontoAreaConfirm: (clientId: string, subprogramaId: number, montoPesos: number) => void;
  onRecalcular: (clientId: string) => void;
  onEliminar: (clientId: string) => void;
  onTab: (clientId: string, shiftKey: boolean) => void;
  onTabArea: (clientId: string, currentAreaIndex: number, shiftKey: boolean) => void;
  onEnterArea: (clientId: string, areaIndex: number) => void;
  loading?: boolean;
  isSaving?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

function PresupuestoMatrixGrid({
  filas,
  subprogramas,
  discrepanciasMap,
  deleteTargetIds,
  searchFilter,
  onMontoConfirm,
  onMontoAreaConfirm,
  onRecalcular,
  onEliminar,
  onTab,
  onTabArea,
  onEnterArea,
  loading = false,
  isSaving = false,
}: PresupuestoMatrixGridProps) {
  // Show all active subprogramas as columns (users need to see them to populate data)
  const areasVisibles = useMemo(() => {
    return subprogramas.filter((s) => s.codigo !== 'SIN_ASIG');
  }, [subprogramas]);

  // Grid template based on visible areas
  const gridTemplate = useMemo(
    () => buildGridTemplate(areasVisibles),
    [areasVisibles],
  );

  // Totals per area
  const totalesPorArea = useMemo(() => {
    const map = new Map<number, number>();
    for (const fila of filas) {
      // Only sum root-level rows (nivel 0) to avoid double counting
      if (fila.nivel !== 0) continue;
      for (const [subId, monto] of fila.distribucion) {
        map.set(subId, (map.get(subId) ?? 0) + monto);
      }
    }
    return map;
  }, [filas]);

  // Total general (sum of root-level rows)
  const totalGeneral = useMemo(() => {
    let total = 0;
    for (const fila of filas) {
      if (fila.nivel === 0) total += fila.montoAnual;
    }
    return total;
  }, [filas]);

  // Filter by search
  const filasFiltradas = useMemo(() => {
    if (!searchFilter.trim()) return filas;
    const q = searchFilter.toLowerCase();
    return filas.filter(
      (f) =>
        f.cuenta?.codigo?.toLowerCase().includes(q) ||
        f.cuenta?.nombre?.toLowerCase().includes(q),
    );
  }, [filas, searchFilter]);

  // Warn children (descendants of parents with discrepancies)
  const warnChildIds = useMemo(() => {
    const ids = new Set<string>();
    const filaMap = new Map<string, FilaMatrix>();
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
            : 'Sin líneas de gastos. Use "Agregar línea" para comenzar.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <PresupuestoMatrixHeader
        areasVisibles={areasVisibles}
        gridTemplate={gridTemplate}
        totalesPorArea={totalesPorArea}
        totalGeneral={totalGeneral}
      />

      {/* Scrollable body */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        {filasFiltradas.map((fila) => (
          <PresupuestoMatrixRow
            key={fila._clientId}
            fila={fila}
            areasVisibles={areasVisibles}
            gridTemplate={gridTemplate}
            discrepanciaDelta={discrepanciasMap.get(fila._clientId) ?? null}
            isWarnChild={warnChildIds.has(fila._clientId)}
            isDeleteTarget={deleteTargetIds.has(fila._clientId)}
            onMontoConfirm={onMontoConfirm}
            onMontoAreaConfirm={onMontoAreaConfirm}
            onRecalcular={onRecalcular}
            onEliminar={onEliminar}
            onTab={onTab}
            onTabArea={onTabArea}
            onEnterArea={onEnterArea}
            loading={isSaving}
          />
        ))}
      </Box>
    </Box>
  );
}

export default memo(PresupuestoMatrixGrid);
