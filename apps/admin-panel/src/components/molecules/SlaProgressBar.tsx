import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'

interface SlaProgressBarProps {
  compliance: number
}

type ComplianceLevel = 'error' | 'warning' | 'success'

function getLevel(compliance: number): ComplianceLevel {
  if (compliance < 50) return 'error'
  if (compliance < 80) return 'warning'
  return 'success'
}

export function SlaProgressBar({ compliance }: SlaProgressBarProps) {
  const theme = useTheme()
  const level = getLevel(compliance)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 50)
    return () => clearTimeout(id)
  }, [])

  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const displayValue = reducedMotion || animated ? Math.min(compliance, 100) : 0

  const colorMap: Record<ComplianceLevel, string> = {
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    success: theme.palette.success.main,
  }

  const barColor = colorMap[level]

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={displayValue}
        sx={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.meridian.surfaces.s3,
          '& .MuiLinearProgress-bar': {
            backgroundColor: barColor,
            borderRadius: 4,
            transition: reducedMotion
              ? 'none'
              : 'transform 600ms cubic-bezier(0.4, 0.0, 0.2, 1.0)',
          },
        }}
      />
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{ color: barColor, minWidth: 38 }}
      >
        {compliance}%
      </Typography>
    </Box>
  )
}
