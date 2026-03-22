import type { SubprogramaItem } from '@/types/presupuesto.types';
import { Box, Tooltip, Typography, alpha } from '@mui/material';
import { memo } from 'react';

interface PresupuestoMatrixFooterProps {
  areasVisibles: SubprogramaItem[];
  gridTemplate: string;
  totalesPorArea: Map<number, number>;
  totalGeneral: number;
}

const NUM_FONT = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontFeatureSettings: "'tnum' 1, 'ss01' 1",
} as const;

const PCT_FONT = {
  fontFamily: "'DM Mono', monospace",
} as const;

const formatMiles = (pesos: number): string => {
  const miles = Math.round(pesos / 1000);
  return miles.toLocaleString('es-CL');
};

function PresupuestoMatrixFooter({
  areasVisibles,
  gridTemplate,
  totalesPorArea,
  totalGeneral,
}: PresupuestoMatrixFooterProps) {
  return (
    <Box
      sx={(t) => ({
        position: 'sticky',
        bottom: 0,
        zIndex: 3,
        bgcolor: t.meridian?.surfaces?.s1 ?? t.palette.background.paper,
        borderTop: `2px solid ${t.palette.primary.main}`,
      })}
    >
      {/* Totals row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          alignItems: 'center',
          minHeight: 38,
        }}
      >
        {/* Frozen left: empty (page footer shows "Total Gastos") */}
        <Box
          sx={{ position: 'sticky', left: 0, zIndex: 4, bgcolor: 'inherit' }}
        />
        <Box
          sx={{ position: 'sticky', left: 160, zIndex: 4, bgcolor: 'inherit' }}
        />

        {/* Area totals + percentages */}
        {areasVisibles.map((area) => {
          const total = totalesPorArea.get(area.id) ?? 0;
          const pct =
            totalGeneral > 0
              ? ((total / totalGeneral) * 100).toFixed(1)
              : '0.0';
          return (
            <Box
              key={area.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                px: 0.5,
                py: 0.25,
              }}
            >
              <Typography
                sx={{
                  ...NUM_FONT,
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'primary.main',
                  lineHeight: 1.2,
                }}
              >
                {total > 0 ? formatMiles(total) : null}
              </Typography>
              {total > 0 && (
                <Typography
                  sx={{
                    ...PCT_FONT,
                    fontSize: '9px',
                    fontWeight: 500,
                    color: 'text.disabled',
                    lineHeight: 1.2,
                  }}
                >
                  {pct}%
                </Typography>
              )}
            </Box>
          );
        })}

        {/* Frozen right: Total general */}
        <Box
          sx={{
            position: 'sticky',
            right: 84,
            zIndex: 4,
            bgcolor: 'inherit',
            textAlign: 'right',
            px: 1,
          }}
        >
          <Tooltip
            title={`M$ ${formatMiles(totalGeneral)} — $${Math.floor(totalGeneral).toLocaleString('es-CL')}`}
            arrow
          >
            <Typography
              sx={{
                ...NUM_FONT,
                fontSize: '15px',
                fontWeight: 700,
                color: 'primary.main',
              }}
            >
              {formatMiles(totalGeneral)}
            </Typography>
          </Tooltip>
        </Box>

        {/* Status + Actions empty */}
        <Box
          sx={{ position: 'sticky', right: 56, zIndex: 4, bgcolor: 'inherit' }}
        />
        <Box
          sx={{ position: 'sticky', right: 0, zIndex: 4, bgcolor: 'inherit' }}
        />
      </Box>

      {/* Stacked bar */}
      {totalGeneral > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            px: 0,
          }}
        >
          {/* Skip frozen left cols */}
          <Box
            sx={{ position: 'sticky', left: 0, zIndex: 4, bgcolor: 'inherit' }}
          />
          <Box
            sx={{
              position: 'sticky',
              left: 160,
              zIndex: 4,
              bgcolor: 'inherit',
            }}
          />

          {/* Bar spanning area columns */}
          <Box
            sx={{
              gridColumn: `3 / ${3 + areasVisibles.length}`,
              display: 'flex',
              height: 6,
              borderRadius: 3,
              overflow: 'hidden',
              mx: 0.5,
              mb: 1,
            }}
          >
            {areasVisibles.map((area) => {
              const total = totalesPorArea.get(area.id) ?? 0;
              const pct = totalGeneral > 0 ? (total / totalGeneral) * 100 : 0;
              if (pct === 0) return null;
              const paletteColor =
                area.color === 'default' ? 'grey' : area.color;
              return (
                <Tooltip
                  key={area.id}
                  title={`${area.nombre}: ${pct.toFixed(1)}%`}
                  arrow
                >
                  <Box
                    sx={(t) => ({
                      width: `${pct}%`,
                      bgcolor:
                        (
                          t.palette[paletteColor as keyof typeof t.palette] as {
                            main: string;
                          }
                        )?.main ?? t.palette.primary.main,
                      minWidth: 2,
                      '&:hover': {
                        opacity: 0.8,
                      },
                    })}
                  />
                </Tooltip>
              );
            })}
          </Box>

          {/* Skip frozen right cols */}
          <Box
            sx={{
              position: 'sticky',
              right: 84,
              zIndex: 4,
              bgcolor: 'inherit',
            }}
          />
          <Box
            sx={{
              position: 'sticky',
              right: 56,
              zIndex: 4,
              bgcolor: 'inherit',
            }}
          />
          <Box
            sx={{ position: 'sticky', right: 0, zIndex: 4, bgcolor: 'inherit' }}
          />
        </Box>
      )}
    </Box>
  );
}

export default memo(PresupuestoMatrixFooter);
