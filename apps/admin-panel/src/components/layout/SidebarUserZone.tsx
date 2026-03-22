import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

interface SidebarUserZoneProps {
  collapsed: boolean
}

const DISPLAY_NAME = 'Administrador'
const DISPLAY_ROLE = 'Super Admin'
const DISPLAY_INITIALS = 'AD'

export default function SidebarUserZone({ collapsed }: SidebarUserZoneProps) {
  const theme = useTheme()

  const hoverSx = {
    transition: 'background-color 150ms ease-out',
    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  }

  const avatar = (
    <Avatar
      sx={{
        width: 32,
        height: 32,
        bgcolor: 'primary.main',
        flexShrink: 0,
        fontSize: '0.6875rem',
        fontWeight: 700,
      }}
    >
      {DISPLAY_INITIALS}
    </Avatar>
  )

  if (collapsed) {
    return (
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          justifyContent: 'center',
          borderRadius: `${theme.shape.borderRadius}px`,
          cursor: 'default',
          ...hoverSx,
        }}
      >
        <Tooltip title={`${DISPLAY_NAME} — ${DISPLAY_ROLE}`} placement="right">
          {avatar}
        </Tooltip>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: `${theme.shape.borderRadius}px`,
        cursor: 'default',
        ...hoverSx,
      }}
    >
      {avatar}
      <Box
        sx={{
          overflow: 'hidden',
          opacity: collapsed ? 0 : 1,
          transition: 'opacity 250ms ease-out',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {DISPLAY_NAME}
          </Typography>
          {/* Status dot — online */}
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: theme.palette.success.main,
              flexShrink: 0,
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap>
          {DISPLAY_ROLE}
        </Typography>
      </Box>
    </Box>
  )
}
