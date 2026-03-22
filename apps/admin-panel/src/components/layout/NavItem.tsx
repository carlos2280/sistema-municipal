import Box from '@mui/material/Box'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme } from '@mui/material/styles'

interface NavItemProps {
  label: string
  path: string
  icon: React.ReactNode
  active: boolean
  collapsed: boolean
  indent?: boolean
  onClick: () => void
}

export default function NavItem({
  label,
  path: _path,
  icon,
  active,
  collapsed,
  indent = false,
  onClick,
}: NavItemProps) {
  const theme = useTheme()

  const button = (
    <ListItemButton
      onClick={onClick}
      sx={{
        mx: 1,
        mb: 0.25,
        borderRadius: `${theme.shape.borderRadius}px`,
        pl: collapsed ? 1.5 : indent ? 3.5 : 1.5,
        minHeight: 40,
        position: 'relative',
        transition: 'background-color 150ms ease-out',
        bgcolor: active
          ? alpha(theme.palette.primary.main, 0.12)
          : 'transparent',
        '&::before': active
          ? {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '15%',
              bottom: '15%',
              width: 3,
              borderRadius: 2,
              bgcolor: 'primary.main',
            }
          : {},
        '&:hover': {
          bgcolor: active
            ? alpha(theme.palette.primary.main, 0.16)
            : alpha(theme.palette.text.primary, 0.06),
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
        [theme.breakpoints.down('md')]: { minHeight: 44 },
      }}
    >
      {/* Sub-item vertical connector */}
      {indent && !collapsed && (
        <Box
          sx={{
            position: 'absolute',
            left: 20,
            top: 0,
            bottom: 0,
            width: '1px',
            bgcolor: theme.meridian.borders.muted,
          }}
        />
      )}

      <ListItemIcon
        sx={{
          minWidth: collapsed ? 'unset' : 36,
          color: active ? 'primary.main' : 'text.secondary',
          transition: 'color 150ms ease-out, transform 150ms ease-out',
          transform: active ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        {icon}
      </ListItemIcon>

      <ListItemText
        primary={label}
        sx={{
          opacity: collapsed ? 0 : 1,
          transition: `opacity ${collapsed ? '100ms' : '250ms'} ease-out`,
          overflow: 'hidden',
          m: 0,
        }}
        slotProps={{
          primary: {
            variant: 'body2',
            fontWeight: active ? 600 : 400,
            color: active ? 'primary.main' : 'text.primary',
            noWrap: true,
          },
        }}
      />
    </ListItemButton>
  )

  if (collapsed) {
    return (
      <Box>
        <Tooltip title={label} placement="right">
          {button}
        </Tooltip>
      </Box>
    )
  }

  return button
}
