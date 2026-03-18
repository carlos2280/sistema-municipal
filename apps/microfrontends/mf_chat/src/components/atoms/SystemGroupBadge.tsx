import Chip from '@mui/material/Chip'
import { Building2 } from 'lucide-react'

interface SystemGroupBadgeProps {
  size?: 'small' | 'medium'
}

export function SystemGroupBadge({ size = 'small' }: SystemGroupBadgeProps) {
  return (
    <Chip
      icon={<Building2 size={12} />}
      label="Departamento"
      size={size}
      variant="outlined"
      color="info"
      sx={{
        fontSize: 10,
        height: 20,
        '& .MuiChip-icon': { fontSize: 12, ml: 0.5 },
        '& .MuiChip-label': { px: 0.5 },
      }}
    />
  )
}
