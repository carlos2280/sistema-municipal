import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import type { ReactNode } from 'react'

interface KpiCardProps {
  icon: ReactNode
  value: number | string
  label: string
  color?: string
  format?: 'number' | 'percent' | 'hours'
}

function formatValue(value: number | string, format: KpiCardProps['format']): string {
  if (typeof value === 'string') return value
  if (format === 'percent') return `${value}%`
  if (format === 'hours') return `${value}h`
  return String(value)
}

export function KpiCard({ icon, value, label, color, format = 'number' }: KpiCardProps) {
  const theme = useTheme()
  const resolvedColor = color ?? theme.palette.primary.main

  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: alpha(resolvedColor, 0.12),
            color: resolvedColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700} color={resolvedColor}>
            {formatValue(value, format)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
