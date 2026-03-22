import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

interface SidebarNavGroupLabelProps {
  icon: React.ReactNode
  label: string
  collapsed: boolean
}

export default function SidebarNavGroupLabel({ icon, label, collapsed }: SidebarNavGroupLabelProps) {
  const theme = useTheme()
  return (
    <Box
      sx={{
        maxHeight: collapsed ? 0 : 32,
        opacity: collapsed ? 0 : 1,
        overflow: 'hidden',
        transition: `max-height 150ms ${theme.meridian.easings.out}, opacity ${collapsed ? '100ms' : '250ms'} ease-out`,
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 2.5,
        mb: 0.5,
      }}
    >
      {icon}
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 10, fontWeight: 600 }}
      >
        {label}
      </Typography>
    </Box>
  )
}
