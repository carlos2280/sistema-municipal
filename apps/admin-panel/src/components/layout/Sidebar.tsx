import logoCriscarCompact from '@/assets/logo-criscar-compact.svg'
import logoCriscarLight from '@/assets/logo-criscar-light.svg'
import logoCriscarDark from '@/assets/logo-criscar.svg'
import { useModules } from '@/hooks/useModules'
import CategoryIcon from '@mui/icons-material/Category'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DomainIcon from '@mui/icons-material/Domain'
import ExtensionIcon from '@mui/icons-material/Extension'
import SettingsIcon from '@mui/icons-material/Settings'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import TimerIcon from '@mui/icons-material/Timer'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import NavItem from './NavItem'
import SidebarNavGroupLabel from './SidebarNavGroupLabel'
import SidebarUserZone from './SidebarUserZone'

export const SIDEBAR_WIDTH_COLLAPSED = 72
export const SIDEBAR_WIDTH_EXPANDED = 240

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}
interface NavItemDef {
  label: string
  path: string
  icon: React.ReactNode
}

const sm = 'small' as const

const NAV_ITEMS: NavItemDef[] = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon fontSize={sm} /> },
  {
    label: 'Municipalidades',
    path: '/tenants',
    icon: <DomainIcon fontSize={sm} />,
  },
  { label: 'Módulos', path: '/modules', icon: <ExtensionIcon fontSize={sm} /> },
]

const MESA_AYUDA_ITEMS: NavItemDef[] = [
  {
    label: 'Dashboard Global',
    path: '/mesa-ayuda',
    icon: <DashboardIcon fontSize={sm} />,
  },
  {
    label: 'Todos los Tickets',
    path: '/mesa-ayuda/tickets',
    icon: <ConfirmationNumberIcon fontSize={sm} />,
  },
  {
    label: 'Monitoreo SLA',
    path: '/mesa-ayuda/sla',
    icon: <TimerIcon fontSize={sm} />,
  },
  {
    label: 'Categorías',
    path: '/mesa-ayuda/categorias',
    icon: <CategoryIcon fontSize={sm} />,
  },
  {
    label: 'Configuración SLA',
    path: '/mesa-ayuda/sla-config',
    icon: <SettingsIcon fontSize={sm} />,
  },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: modules } = useModules()
  const isDark = theme.palette.mode === 'dark'
  const hasMesaAyuda = modules?.some((m) => m.codigo === 'mesa_ayuda')
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED
  const isActive = (path: string, exact = false) =>
    exact
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(`${path}/`)

  return (
    <Box
      component="nav"
      sx={{
        width,
        flexShrink: 0,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.meridian.surfaces.s2,
        borderRight: `1px solid ${theme.meridian.borders.default}`,
        overflow: 'hidden',
        transition: `width 150ms ${theme.meridian.easings.out}`,
        zIndex: theme.zIndex.drawer,
      }}
    >
      {/* Logo + toggle */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 0 : 2,
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <Tooltip title="CRISCAR Admin" placement="right">
            <Box
              component="img"
              src={logoCriscarCompact}
              alt="CRISCAR"
              sx={{ width: 32, height: 32 }}
            />
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={isDark ? logoCriscarLight : logoCriscarDark}
              alt="CRISCAR"
              sx={{ height: 28 }}
            />
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ lineHeight: 1.2 }}
            >
              Panel Admin
            </Typography>
          </Box>
        )}
        <Tooltip title={collapsed ? 'Expandir' : 'Colapsar'} placement="right">
          <IconButton
            size="small"
            onClick={onToggle}
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            sx={{
              color: 'text.secondary',
              ml: collapsed ? 0 : 'auto',
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            }}
          >
            {collapsed ? (
              <ChevronRightIcon fontSize={sm} />
            ) : (
              <ChevronLeftIcon fontSize={sm} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ borderColor: theme.meridian.borders.muted, mx: 1 }} />

      {/* Navigation */}
      <List
        sx={{ pt: 1, px: 0, flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            active={
              item.path === '/' ? isActive('/', true) : isActive(item.path)
            }
            collapsed={collapsed}
            onClick={() => navigate(item.path)}
          />
        ))}

        <Collapse in={hasMesaAyuda} unmountOnExit>
          <Divider
            sx={{ borderColor: theme.meridian.borders.muted, mx: 2, my: 1 }}
          />
          <SidebarNavGroupLabel
            icon={
              <SupportAgentIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            }
            label="Mesa de Ayuda"
            collapsed={collapsed}
          />
          {MESA_AYUDA_ITEMS.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={
                item.path === '/mesa-ayuda'
                  ? isActive('/mesa-ayuda', true)
                  : isActive(item.path)
              }
              collapsed={collapsed}
              indent={!collapsed}
              onClick={() => navigate(item.path)}
            />
          ))}
        </Collapse>
      </List>

      <Divider sx={{ borderColor: theme.meridian.borders.muted }} />
      <SidebarUserZone collapsed={collapsed} />
    </Box>
  )
}
