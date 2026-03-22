import Chip from '@mui/material/Chip'
import { alpha, useTheme } from '@mui/material/styles'

interface TenantBadgeProps {
  nombre: string
  /** @deprecated ignorado — se mantiene por compatibilidad */
  slug?: string
}

export function TenantBadge({ nombre }: TenantBadgeProps) {
  const theme = useTheme()

  return (
    <Chip
      label={nombre}
      size="small"
      sx={{
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        color: theme.palette.primary.main,
        fontWeight: 600,
        borderRadius: '4px',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    />
  )
}
