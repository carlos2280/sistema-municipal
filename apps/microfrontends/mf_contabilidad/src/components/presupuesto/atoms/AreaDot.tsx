import { Box, Tooltip, Typography } from '@mui/material';
import { memo } from 'react';

interface AreaDotProps {
  /** Token semántico MUI: "primary", "info", "secondary", etc. */
  color: string;
  /** Abreviatura de 4 chars max */
  abreviatura: string;
  /** Nombre completo para tooltip */
  nombre: string;
  /** Texto extra para tooltip (ej: "M$ 2.780 (51.0% del total)") */
  tooltipExtra?: string;
}

function AreaDot({ color, abreviatura, nombre, tooltipExtra }: AreaDotProps) {
  const tooltipTitle = tooltipExtra ? `${nombre} — ${tooltipExtra}` : nombre;
  const paletteColor = color === 'default' ? 'text.disabled' : `${color}.main`;

  return (
    <Tooltip title={tooltipTitle} arrow placement="top">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.25,
          cursor: 'default',
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: paletteColor,
          }}
        />
        <Typography
          sx={{
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'text.disabled',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {abreviatura}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default memo(AreaDot);
