import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { DistribucionList } from '@/components/molecules'
import { TendenciaChart, TenantSummaryTable } from '@/components/organisms'
import { useMesaAyudaDashboard } from '@/hooks/useMesaAyudaDashboard'
import type { CategoriaResumen, PrioridadResumen } from '@/types/mesa-ayuda'
import { DashboardKpis } from './components/DashboardKpis'

export default function MesaAyudaDashboardPage() {
  const theme = useTheme()
  const { data, isLoading, error } = useMesaAyudaDashboard()

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">Error al cargar dashboard: {error.message}</Alert>
  if (!data) return null

  const global = data.global ?? {
    totalTickets: data.totalTickets ?? 0,
    abiertos: data.abiertos ?? 0,
    enProgreso: data.enProgreso ?? 0,
    enEspera: data.enEspera ?? 0,
    vencidosSla: data.vencidosSla ?? 0,
    slaCompliance: data.slaCompliance ?? 0,
    tiempoPromedioHoras: data.tiempoPromedioHoras ?? 0,
  }

  const tendenciaData = data.tendencia ?? data.tendencia30Dias ?? []
  const porTenant = data.porTenant ?? []

  const categoriaItems = data.porCategoria.map((c: CategoriaResumen) => ({
    label: c.categoriaNombre ?? c.categoria ?? '',
    count: c.totalTickets ?? c.cantidad ?? 0,
    color: c.categoriaColor ?? theme.palette.primary.main,
  }))

  const prioridadItems = data.porPrioridad.map((p: PrioridadResumen) => ({
    label: p.prioridadNombre ?? p.prioridad ?? '',
    count: p.totalTickets ?? p.cantidad ?? 0,
    color: p.prioridadColor ?? theme.palette.secondary.main,
  }))

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Mesa de Ayuda — Dashboard Global
      </Typography>

      <DashboardKpis global={global} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent><TendenciaChart data={tendenciaData} /></CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Por Municipalidad</Typography>
              <TenantSummaryTable data={porTenant} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Por Categoría</Typography>
              <DistribucionList items={categoriaItems} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Por Prioridad</Typography>
              <DistribucionList items={prioridadItems} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
