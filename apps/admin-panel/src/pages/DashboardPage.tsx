import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DomainIcon from '@mui/icons-material/Domain'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { containerStagger, itemFadeUp } from '@/theme/motion'
import { useTenants } from '@/hooks/useTenants'
import { StatCard } from './components/StatCard'

export default function DashboardPage() {
  const { data: tenants, isLoading, error } = useTenants()
  const navigate = useNavigate()

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">Error al cargar datos: {error.message}</Alert>

  const total = tenants?.length ?? 0
  const activas = tenants?.filter((t) => t.activo !== false).length ?? 0
  const inactivas = total - activas
  const recientes = tenants?.slice(0, 5) ?? []

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Dashboard</Typography>

      <Box component={motion.div} variants={containerStagger} initial="initial" animate="animate">
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box component={motion.div} variants={itemFadeUp}>
              <StatCard title="Total Municipalidades" value={total} icon={<DomainIcon fontSize="inherit" />} color="primary.main" />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box component={motion.div} variants={itemFadeUp}>
              <StatCard title="Activas" value={activas} icon={<CheckCircleIcon fontSize="inherit" />} color="success.main" />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box component={motion.div} variants={itemFadeUp}>
              <StatCard title="Inactivas" value={inactivas} icon={<RemoveCircleIcon fontSize="inherit" />} color="error.main" />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Municipalidades recientes</Typography>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Dominio</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recientes.map((t) => (
              <TableRow key={t.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/tenants/${t.id}`)}>
                <TableCell>{t.nombre}</TableCell>
                <TableCell>{t.slug}</TableCell>
                <TableCell>{t.dominioBase}</TableCell>
                <TableCell>
                  <Chip label={t.activo !== false ? 'Activa' : 'Inactiva'} color={t.activo !== false ? 'success' : 'default'} size="small" />
                </TableCell>
              </TableRow>
            ))}
            {recientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No hay municipalidades registradas</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  )
}
