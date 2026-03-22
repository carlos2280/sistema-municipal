import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import type { ThemeMode } from '@/App'
import { pageTransition } from '@/theme/motion'
import Header from './Header'
import Sidebar, { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from './Sidebar'

interface AdminLayoutProps {
  mode: ThemeMode
  toggleTheme: () => void
}

const DETAIL_PATTERNS = [/^\/tenants\/\d+/, /^\/mesa-ayuda\/tickets\/.+/]

function isDetailPage(pathname: string): boolean {
  return DETAIL_PATTERNS.some((pattern) => pattern.test(pathname))
}

export default function AdminLayout({ mode, toggleTheme }: AdminLayoutProps) {
  const theme = useTheme()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED
  const pagePadding = isDetailPage(location.pathname) ? 2.5 : 4

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: theme.meridian.surfaces.ground,
      }}
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />

      <Header mode={mode} toggleTheme={toggleTheme} sidebarWidth={sidebarWidth} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${sidebarWidth}px`,
          mt: '48px',
          p: pagePadding,
          minHeight: 'calc(100vh - 48px)',
          bgcolor: theme.meridian.surfaces.ground,
          transition: `margin-left 150ms ${theme.meridian.easings.out}, padding 250ms ${theme.meridian.easings.out}`,
          overflow: 'auto',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  )
}
