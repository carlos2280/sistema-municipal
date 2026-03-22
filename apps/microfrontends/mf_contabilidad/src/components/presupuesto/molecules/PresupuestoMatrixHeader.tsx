import type { SubprogramaItem } from '@/types/presupuesto.types';
import { Box } from '@mui/material';
import { memo } from 'react';
import AreaDot from '../atoms/AreaDot';

interface PresupuestoMatrixHeaderProps {
  areasVisibles: SubprogramaItem[];
  gridTemplate: string;
  totalesPorArea: Map<number, number>;
  totalGeneral: number;
}

const formatCLP = (value: number): string =>
  Math.floor(value).toLocaleString('es-CL');

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

function PresupuestoMatrixHeader({
  areasVisibles,
  gridTemplate,
  totalesPorArea,
  totalGeneral,
}: PresupuestoMatrixHeaderProps) {
  return (
    <Box
      sx={(t) => ({
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        flexShrink: 0,
        bgcolor: t.meridian?.surfaces?.s1 ?? t.palette.background.paper,
        borderBottom: `2px solid ${t.palette.primary.main}`,
      })}
    >
      <Box sx={{ ...headerCellBase }}>Cuenta</Box>
      <Box sx={{ ...headerCellBase }}>Nombre Cuenta</Box>

      {/* Area columns */}
      {areasVisibles.map((area) => {
        const totalArea = totalesPorArea.get(area.id) ?? 0;
        const pct =
          totalGeneral > 0
            ? ((totalArea / totalGeneral) * 100).toFixed(1)
            : '0.0';
        return (
          <Box
            key={area.id}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: '7px',
            }}
          >
            <AreaDot
              color={area.color}
              abreviatura={area.abreviatura}
              nombre={area.nombre}
              tooltipExtra={`$${formatCLP(totalArea)} (${pct}% del total)`}
            />
          </Box>
        );
      })}

      <Box sx={{ ...headerCellBase, justifyContent: 'flex-end' }}>
        Total Anual ($)
      </Box>
      <Box />
      <Box />
    </Box>
  );
}

export default memo(PresupuestoMatrixHeader);
