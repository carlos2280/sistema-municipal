import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { KpiCard } from '@/components/atoms'
import { SlaProgressBar } from '@/components/molecules'
import { useMesaAyudaSla } from '@/hooks/useMesaAyudaSla'

interface CompliancePrioridad {
  prioridadId: number
  prioridadNombre: string
  total: number
  vencidos: number
  compliance: number
}

interface ComplianceTenant {
  tenantId: number
  tenantSlug: string
  nombre: string
  total: number
  vencidos: number
  compliance: number
}

interface SlaResponse {
  vencidos: number
  enRiesgo: number
  compliancePorPrioridad: CompliancePrioridad[]
  compliancePorTenant: ComplianceTenant[]
}

export default function MesaAyudaSlaPage() {
  const theme = useTheme()
  const { data, isLoading, error } = useMesaAyudaSla()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">Error al cargar monitoreo SLA: {error.message}</Alert>
    )
  }

  if (!data) return null

  const sla = data as SlaResponse
  const totalTickets = sla.compliancePorPrioridad.reduce((sum, p) => sum + p.total, 0)
  const totalVencidos = sla.vencidos
  const complianceGlobal = totalTickets > 0
    ? Math.round(((totalTickets - totalVencidos) / totalTickets) * 100)
    : 100

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Mesa de Ayuda — Monitoreo SLA
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Tickets Activos"
            value={totalTickets}
            icon={<AssignmentLateIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Vencidos"
            value={sla.vencidos}
            icon={<ErrorIcon />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="En Riesgo"
            value={sla.enRiesgo}
            icon={<WarningIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="SLA Compliance"
            value={complianceGlobal}
            icon={<CheckCircleIcon />}
            color={theme.palette.success.main}
            format="percent"
          />
        </Grid>
      </Grid>

      {/* Grid principal */}
      <Grid container spacing={3}>
        {/* SLA por Prioridad */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                SLA por Prioridad
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Prioridad</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Vencidos</TableCell>
                    <TableCell sx={{ minWidth: 160 }}>Compliance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sla.compliancePorPrioridad.map((p) => (
                    <TableRow key={p.prioridadId}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {p.prioridadNombre}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{p.total}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color={p.vencidos > 0 ? 'error.main' : 'text.primary'}
                          fontWeight={p.vencidos > 0 ? 700 : 400}
                        >
                          {p.vencidos}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <SlaProgressBar compliance={p.compliance} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {sla.compliancePorPrioridad.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Sin datos
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* SLA por Municipalidad */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                SLA por Municipalidad
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Municipalidad</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Vencidos</TableCell>
                    <TableCell sx={{ minWidth: 160 }}>Compliance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sla.compliancePorTenant.map((t) => (
                    <TableRow key={t.tenantId}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={t.vencidos > 0 ? 'error.main' : 'text.primary'}
                        >
                          {t.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{t.total}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color={t.vencidos > 0 ? 'error.main' : 'text.primary'}
                          fontWeight={t.vencidos > 0 ? 700 : 400}
                        >
                          {t.vencidos}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <SlaProgressBar compliance={t.compliance} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {sla.compliancePorTenant.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Sin datos
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
