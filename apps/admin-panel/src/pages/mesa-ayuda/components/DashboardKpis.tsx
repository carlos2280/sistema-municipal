import { KpiCard } from '@/components/atoms'
import { containerStagger, itemFadeUp } from '@/theme/motion'
import type { GlobalDashboard } from '@/types/mesa-ayuda'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'

interface DashboardKpisProps {
  global: GlobalDashboard
}

export function DashboardKpis({ global }: DashboardKpisProps) {
  const theme = useTheme()

  return (
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
              label="Tickets Totales"
              value={global.totalTickets}
              icon={<AssignmentIcon />}
              color={theme.palette.primary.main}
              delay={0}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box component={motion.div} variants={itemFadeUp}>
            <KpiCard
              label="Abiertos"
              value={global.abiertos}
              icon={<AssignmentLateIcon />}
              color={theme.palette.warning.main}
              delay={60}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box component={motion.div} variants={itemFadeUp}>
            <KpiCard
              label="Vencidos SLA"
              value={global.vencidosSla}
              icon={<AccessTimeIcon />}
              color={theme.palette.error.main}
              delay={120}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box component={motion.div} variants={itemFadeUp}>
            <KpiCard
              label="SLA Compliance"
              value={global.slaCompliance}
              icon={<CheckCircleIcon />}
              color={theme.palette.success.main}
              format="percent"
              delay={180}
            />
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box component={motion.div} variants={itemFadeUp}>
            <KpiCard
              label="En Progreso"
              value={global.enProgreso}
              icon={<TrendingUpIcon />}
              color={theme.palette.info.main}
              delay={240}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box component={motion.div} variants={itemFadeUp}>
            <KpiCard
              label="En Espera"
              value={global.enEspera}
              icon={<PauseCircleIcon />}
              color={theme.palette.secondary.main}
              delay={300}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box component={motion.div} variants={itemFadeUp}>
            <KpiCard
              label="Tiempo Promedio"
              value={global.tiempoPromedioHoras}
              icon={<HourglassEmptyIcon />}
              color={theme.palette.text.secondary}
              format="hours"
              delay={360}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
