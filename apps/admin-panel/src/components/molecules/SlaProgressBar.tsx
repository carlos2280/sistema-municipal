import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

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
        value={Math.min(compliance, 100)}
        sx={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.palette.action.hover,
          '& .MuiLinearProgress-bar': { backgroundColor: barColor, borderRadius: 4 },
        }}
      />
      <Typography variant="caption" fontWeight={600} sx={{ color: barColor, minWidth: 38 }}>
        {compliance}%
      </Typography>
    </Box>
  )
}
