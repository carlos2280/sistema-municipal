import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

interface TenantBadgeProps {
  nombre: string
  slug: string
}

export function TenantBadge({ nombre }: TenantBadgeProps) {
  const theme = useTheme()

  return (
    <Chip
      label={nombre}
      size="small"
      sx={{
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
        fontWeight: 600,
        borderRadius: 1,
      }}
    />
  )
}
