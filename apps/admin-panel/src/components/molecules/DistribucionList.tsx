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

type PaletteKey = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
const PALETTE_KEYS = new Set<string>(['primary', 'secondary', 'error', 'warning', 'info', 'success'])

function resolveColor(color: string, theme: Theme): string {
  return PALETTE_KEYS.has(color) ? theme.palette[color as PaletteKey].main : color
}

export function DistribucionList({ items }: DistribucionListProps) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((item) => {
        const resolved = resolveColor(item.color, theme)
        return (
          <Box
            key={item.label}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: resolved,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {item.label}
            </Typography>
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                backgroundColor: alpha(resolved, theme.palette.mode === 'dark' ? 0.2 : 0.1),
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ color: resolved }}>
                {item.count}
              </Typography>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
