import type { TicketStats } from '@/types/mesa-ayuda.types'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'

interface StatItemConfig {
  label: string
  key: keyof TicketStats
  colorKey: 'info' | 'warning' | 'default' | 'success' | 'error'
}

const STAT_ITEMS: StatItemConfig[] = [
  { label: 'Abiertos', key: 'abiertos', colorKey: 'info' },
  { label: 'En Progreso', key: 'enProgreso', colorKey: 'warning' },
  { label: 'En Espera', key: 'enEspera', colorKey: 'default' },
  { label: 'Resueltos', key: 'resueltos', colorKey: 'success' },
  { label: 'Vencidos SLA', key: 'vencidosSla', colorKey: 'error' },
]

function getStatColor(
  colorKey: StatItemConfig['colorKey'],
  palette: ReturnType<typeof useTheme>['palette'],
): string {
  switch (colorKey) {
    case 'info':
      return palette.info.main
    case 'warning':
      return palette.warning.main
    case 'success':
      return palette.success.main
    case 'error':
      return palette.error.main
    default:
      return palette.text.secondary
  }
}

interface TicketStatsBarProps {
  stats: TicketStats | null
  isLoading: boolean
}

function TicketStatsBar({ stats, isLoading }: TicketStatsBarProps) {
  const theme = useTheme()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {STAT_ITEMS.map((item) => (
          <Skeleton key={item.key} variant="rounded" width={140} height={80} />
        ))}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      {STAT_ITEMS.map((item, index) => {
        const color = getStatColor(item.colorKey, theme.palette)
        const value = stats?.[item.key] ?? 0

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            style={{ flex: '1 1 140px', minWidth: 140 }}
          >
            <Card
              sx={{
                background: alpha(theme.meridian.surfaces.ground, 0.92),
                backdropFilter: 'blur(12px)',
                border: `1px solid ${theme.meridian.borders.muted}`,
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color, mt: 0.5 }}
                >
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </Box>
  )
}

export default TicketStatsBar
