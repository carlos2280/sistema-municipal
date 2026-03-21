import CategoryIcon from '@mui/icons-material/Category'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DomainIcon from '@mui/icons-material/Domain'
import ExtensionIcon from '@mui/icons-material/Extension'
import SettingsIcon from '@mui/icons-material/Settings'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import TimerIcon from '@mui/icons-material/Timer'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useLocation, useNavigate } from 'react-router-dom'
import { useModules } from '@/hooks/useModules'

const DRAWER_WIDTH = 240

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Municipalidades', path: '/tenants', icon: <DomainIcon /> },
  { label: 'Modulos', path: '/modules', icon: <ExtensionIcon /> },
]

const MESA_AYUDA_ITEMS: NavItem[] = [
  {
    label: 'Dashboard Global',
    path: '/mesa-ayuda',
    icon: <DashboardIcon fontSize="small" />,
  },
  {
    label: 'Todos los Tickets',
    path: '/mesa-ayuda/tickets',
    icon: <ConfirmationNumberIcon fontSize="small" />,
  },
  {
    label: 'Monitoreo SLA',
    path: '/mesa-ayuda/sla',
    icon: <TimerIcon fontSize="small" />,
  },
  {
    label: 'Categorías',
    path: '/mesa-ayuda/categorias',
    icon: <CategoryIcon fontSize="small" />,
  },
  {
    label: 'Configuración SLA',
    path: '/mesa-ayuda/sla-config',
    icon: <SettingsIcon fontSize="small" />,
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: modules } = useModules()

  const hasMesaAyuda = modules?.some(
    (m) => m.codigo === 'mesa_ayuda',
  )

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap fontWeight={700}>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            selected={
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)
            }
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Collapse in={hasMesaAyuda} unmountOnExit>
        <Divider />
        <List
          subheader={
            <ListSubheader
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                lineHeight: '36px',
              }}
            >
              <SupportAgentIcon fontSize="small" />
              Mesa de Ayuda
            </ListSubheader>
          }
        >
          {MESA_AYUDA_ITEMS.map((item) => (
            <ListItemButton
              key={item.path}
              selected={
                item.path === '/mesa-ayuda'
                  ? location.pathname === '/mesa-ayuda'
                  : location.pathname.startsWith(item.path)
              }
              onClick={() => navigate(item.path)}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </Drawer>
  )
}

export { DRAWER_WIDTH }
