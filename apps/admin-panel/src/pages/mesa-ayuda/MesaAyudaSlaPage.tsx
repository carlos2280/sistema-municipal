import { KpiCard } from '@/components/atoms'
import { useMesaAyudaSla } from '@/hooks/useMesaAyudaSla'
import { containerStagger, itemFadeUp } from '@/theme/motion'
import type { AdminSlaMonitoreo } from '@/types/mesa-ayuda'
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { SlaComplianceTable } from './components/SlaComplianceTable'

export default function MesaAyudaSlaPage() {
  const theme = useTheme()
  const { data, isLoading, error } = useMesaAyudaSla()

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  if (error)
    return (
      <Alert severity="error">
        Error al cargar monitoreo SLA:{' '}
        {error instanceof Error ? error.message : 'Error desconocido'}
      </Alert>
    )
  if (!data) return null

  const sla = data as AdminSlaMonitoreo
  const totalTickets = sla.porPrioridad.reduce(
    (sum, p) => sum + p.totalTickets,
    0,
  )
  const complianceGlobal = sla.global.complianceGlobal

  const prioridadRows = sla.porPrioridad.map((p, idx) => ({
    id: idx,
    nombre: p.prioridadNombre,
    total: p.totalTickets,
    vencidos: p.vencidos,
    compliance: p.compliance,
  }))
  const tenantRows = sla.porTenant.map((t) => ({
    id: t.tenantId,
    nombre: t.tenantNombre,
    total: t.totalTickets,
    vencidos: t.vencidos,
    compliance: t.compliance,
  }))

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Mesa de Ayuda — Monitoreo SLA
      </Typography>

      <Box
        component={motion.div}
        variants={containerStagger}
        initial="initial"
        animate="animate"
      >
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box component={motion.div} variants={itemFadeUp}>
              <KpiCard
                label="Tickets Activos"
                value={totalTickets}
                icon={<AssignmentLateIcon />}
                color={theme.palette.primary.main}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box component={motion.div} variants={itemFadeUp}>
              <KpiCard
                label="Vencidos"
                value={sla.global.totalVencidos}
                icon={<ErrorIcon />}
                color={theme.palette.error.main}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box component={motion.div} variants={itemFadeUp}>
              <KpiCard
                label="En Riesgo"
                value={sla.ticketsEnRiesgo.length}
                icon={<WarningIcon />}
                color={theme.palette.warning.main}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box component={motion.div} variants={itemFadeUp}>
              <KpiCard
                label="SLA Compliance"
                value={complianceGlobal}
                icon={<CheckCircleIcon />}
                color={theme.palette.success.main}
                format="percent"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SlaComplianceTable title="SLA por Prioridad" rows={prioridadRows} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SlaComplianceTable title="SLA por Municipalidad" rows={tenantRows} />
        </Grid>
      </Grid>
    </Box>
  )
}
