import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { KpiCard } from '@/components/atoms'
import { DistribucionList } from '@/components/molecules'
import { TendenciaChart, TenantSummaryTable } from '@/components/organisms'
import { useMesaAyudaDashboard } from '@/hooks/useMesaAyudaDashboard'
import type { CategoriaResumen, PrioridadResumen } from '@/types/mesa-ayuda'

export default function MesaAyudaDashboardPage() {
  const theme = useTheme()
  const { data, isLoading, error } = useMesaAyudaDashboard()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">Error al cargar dashboard: {error.message}</Alert>
    )
  }

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

      {/* KPIs principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Tickets Totales"
            value={global.totalTickets}
            icon={<AssignmentIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Abiertos"
            value={global.abiertos}
            icon={<AssignmentLateIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Vencidos SLA"
            value={global.vencidosSla}
            icon={<AccessTimeIcon />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="SLA Compliance"
            value={global.slaCompliance}
            icon={<CheckCircleIcon />}
            color={theme.palette.success.main}
            format="percent"
          />
        </Grid>
      </Grid>

      {/* KPIs secundarios */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            label="En Progreso"
            value={global.enProgreso}
            icon={<TrendingUpIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            label="En Espera"
            value={global.enEspera}
            icon={<PauseCircleIcon />}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            label="Tiempo Promedio"
            value={global.tiempoPromedioHoras}
            icon={<HourglassEmptyIcon />}
            color={theme.palette.text.secondary}
            format="hours"
          />
        </Grid>
      </Grid>

      {/* Grid inferior */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <TendenciaChart data={tendenciaData} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Por Municipalidad
              </Typography>
              <TenantSummaryTable data={porTenant} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Por Categoría
              </Typography>
              <DistribucionList items={categoriaItems} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Por Prioridad
              </Typography>
              <DistribucionList items={prioridadItems} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
