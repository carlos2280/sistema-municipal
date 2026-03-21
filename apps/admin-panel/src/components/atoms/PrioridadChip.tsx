import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
interface PrioridadChipProps {
  codigo: string
  nombre: string
  color: string
  size?: 'small' | 'medium'
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
      }}
    />
  )
}
