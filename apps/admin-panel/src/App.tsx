import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import { AuthContext, useAuth, useAuthProvider } from './hooks/useAuth'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import ModulesPage from './pages/ModulesPage'
import TenantDetailPage from './pages/TenantDetailPage'
import TenantsPage from './pages/TenantsPage'
import MesaAyudaCategoriasPage from './pages/mesa-ayuda/MesaAyudaCategoriasPage'
import MesaAyudaDashboardPage from './pages/mesa-ayuda/MesaAyudaDashboardPage'
import MesaAyudaSlaConfigPage from './pages/mesa-ayuda/MesaAyudaSlaConfigPage'
import MesaAyudaSlaPage from './pages/mesa-ayuda/MesaAyudaSlaPage'
import MesaAyudaTicketDetailPage from './pages/mesa-ayuda/MesaAyudaTicketDetailPage'
import MesaAyudaTicketsPage from './pages/mesa-ayuda/MesaAyudaTicketsPage'
import { darkTheme, lightTheme } from './theme/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

function RequireAuth() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export type ThemeMode = 'light' | 'dark'

export default function App() {
  const [mode, setMode] = useState<ThemeMode>('dark')
  const theme = useMemo(
    () => (mode === 'dark' ? darkTheme : lightTheme),
    [mode],
  )
  const authValue = useAuthProvider()
  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<RequireAuth />}>
                <Route
                  element={
                    <AdminLayout mode={mode} toggleTheme={toggleTheme} />
                  }
                >
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/tenants" element={<TenantsPage />} />
                  <Route path="/tenants/:id" element={<TenantDetailPage />} />
                  <Route path="/modules" element={<ModulesPage />} />
                  <Route
                    path="/mesa-ayuda"
                    element={<MesaAyudaDashboardPage />}
                  />
                  <Route
                    path="/mesa-ayuda/tickets"
                    element={<MesaAyudaTicketsPage />}
                  />
                  <Route
                    path="/mesa-ayuda/tickets/:tenantSlug/:ticketId"
                    element={<MesaAyudaTicketDetailPage />}
                  />
                  <Route
                    path="/mesa-ayuda/sla"
                    element={<MesaAyudaSlaPage />}
                  />
                  <Route
                    path="/mesa-ayuda/categorias"
                    element={<MesaAyudaCategoriasPage />}
                  />
                  <Route
                    path="/mesa-ayuda/sla-config"
                    element={<MesaAyudaSlaConfigPage />}
                  />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}
