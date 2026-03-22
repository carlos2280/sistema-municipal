import type { ThemeMode } from '@/App'
import { useAuth } from '@/hooks/useAuth'
import { useMesaAyudaSla } from '@/hooks/useMesaAyudaSla'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LogoutIcon from '@mui/icons-material/Logout'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import LogoutDialog from './LogoutDialog'

interface HeaderProps {
  mode: ThemeMode
  toggleTheme: () => void
  sidebarWidth: number
}

const PAGE_TITLES: Record<string, string> = {
  '/': 'Panel de Control',
  '/tenants': 'Municipalidades',
  '/modules': 'Módulos del Sistema',
  '/mesa-ayuda': 'Dashboard Mesa de Ayuda',
  '/mesa-ayuda/tickets': 'Todos los Tickets',
  '/mesa-ayuda/sla': 'Monitoreo SLA',
  '/mesa-ayuda/categorias': 'Categorías',
  '/mesa-ayuda/sla-config': 'Configuración SLA',
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/tenants/')) return 'Detalle Municipalidad'
  if (pathname.startsWith('/mesa-ayuda/tickets/')) return 'Detalle Ticket'
  const segments = pathname.replace(/^\//, '').split('/')
  return segments
    .map((s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' › ')
}

function formatBreadcrumb(pathname: string): string {
  if (pathname === '/') return 'Inicio'
  const segments = pathname.replace(/^\//, '').split('/')
  return segments
    .map((s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' › ')
}

export default function Header({
  mode,
  toggleTheme,
  sidebarWidth,
}: HeaderProps) {
  const theme = useTheme()
  const { logout } = useAuth()
  const location = useLocation()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const { data: slaData } = useMesaAyudaSla()

  const alertCount =
    (slaData?.ticketsVencidos?.length ?? 0) +
    (slaData?.ticketsEnRiesgo?.length ?? 0)

  const iconBtnSx = {
    color: 'text.secondary' as const,
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
    [theme.breakpoints.down('md')]: { minWidth: 44, minHeight: 44 },
  }

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: sidebarWidth,
          right: 0,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          bgcolor: alpha(theme.meridian.surfaces.s1, 0.92),
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${theme.meridian.borders.muted}`,
          zIndex: theme.zIndex.appBar,
          transition: `left 150ms ${theme.meridian.easings.out}`,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 500, letterSpacing: 0.1, minWidth: 80 }}
        >
          {formatBreadcrumb(location.pathname)}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: 600,
            fontSize: '0.9375rem',
            whiteSpace: 'nowrap',
          }}
        >
          {getPageTitle(location.pathname)}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip
            title={
              alertCount > 0 ? `${alertCount} alertas SLA` : 'Sin alertas SLA'
            }
          >
            <IconButton
              size="small"
              aria-label="Alertas SLA"
              sx={{
                ...iconBtnSx,
                color: alertCount > 0 ? 'error.main' : 'text.secondary',
              }}
            >
              <Badge
                badgeContent={alertCount || undefined}
                color="error"
                max={99}
              >
                <NotificationsOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={mode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
            <IconButton
              size="small"
              aria-label={
                mode === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'
              }
              onClick={toggleTheme}
              sx={iconBtnSx}
            >
              {mode === 'light' ? (
                <DarkModeIcon fontSize="small" />
              ) : (
                <LightModeIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Cerrar sesión">
            <IconButton
              size="small"
              aria-label="Cerrar sesión"
              onClick={() => setLogoutOpen(true)}
              sx={iconBtnSx}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={logout}
      />
    </>
  )
}
