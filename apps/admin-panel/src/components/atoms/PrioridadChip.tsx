import Chip from '@mui/material/Chip'
import { alpha, useTheme } from '@mui/material/styles'

interface PrioridadChipProps {
  nombre: string
  color: string
  size?: 'small' | 'medium'
  /** @deprecated ignorado — se mantiene por compatibilidad */
  codigo?: string
}

const PALETTE_KEYS = new Set(['primary', 'secondary', 'error', 'warning', 'info', 'success'])

export function PrioridadChip({ nombre, color, size = 'small' }: PrioridadChipProps) {
  const theme = useTheme()

  const resolved = !color
    ? theme.palette.text.primary
    : PALETTE_KEYS.has(color)
      ? theme.palette[color as 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'].main
      : color

  return (
    <Chip
      label={nombre}
      size={size}
      variant="outlined"
      sx={{
        borderColor: resolved,
        color: resolved,
        backgroundColor: alpha(resolved, theme.palette.mode === 'dark' ? 0.15 : 0.08),
        fontWeight: 600,
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    />
  )
}
