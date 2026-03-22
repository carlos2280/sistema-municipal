import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

interface DistribucionItem {
  label: string
  count: number
  color: string
}

interface DistribucionListProps {
  items: DistribucionItem[]
}

type PaletteKey =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
const PALETTE_KEYS = new Set<string>([
  'primary',
  'secondary',
  'error',
  'warning',
  'info',
  'success',
])

function resolveColor(color: string, theme: Theme): string {
  return PALETTE_KEYS.has(color)
    ? theme.palette[color as PaletteKey].main
    : color
}

export function DistribucionList({ items }: DistribucionListProps) {
  const theme = useTheme()
  const total = items.reduce((acc, item) => acc + item.count, 0)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {items.map((item) => {
        const resolved = resolveColor(item.color, theme)
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
        const barWidth = total > 0 ? (item.count / total) * 100 : 0

        return (
          <Box key={item.label}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: resolved,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2">{item.label}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ color: resolved }}
                >
                  {item.count}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {pct}%
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: alpha(resolved, 0.12),
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${barWidth}%`,
                  borderRadius: 2,
                  backgroundColor: resolved,
                  transition: 'width 600ms cubic-bezier(0.4, 0.0, 0.2, 1.0)',
                }}
              />
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
