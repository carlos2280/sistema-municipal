import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'
import { Building2 } from 'lucide-react'

interface SystemGroupBadgeProps {
  size?: 'small' | 'medium'
}

/**
 * Badge MERIDIAN para grupos del sistema (departamentos).
 * Sigue spec micro-components: DM Mono 10px, uppercase, padding 2px 8px, radius-sm.
 */
export function SystemGroupBadge({ size = 'small' }: SystemGroupBadgeProps) {
  const theme = useTheme()
  const accentColor = theme.palette.info.main
  const fontSize = size === 'small' ? '10px' : '11px'
  const iconSize = size === 'small' ? 10 : 12

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        fontSize,
        fontFamily: '"DM Mono", monospace',
        fontWeight: 500,
        textTransform: 'uppercase',
        px: 1,
        py: '2px',
        borderRadius: `${theme.shape.borderRadius / 2}px`,
        bgcolor: alpha(accentColor, 0.12),
        color: accentColor,
        border: `1px solid ${alpha(accentColor, 0.2)}`,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      <Building2 size={iconSize} />
      Departamento
    </Box>
  )
}
