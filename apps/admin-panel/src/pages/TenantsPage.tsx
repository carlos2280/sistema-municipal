import { EmptyState } from '@/components/shared/EmptyState'
import { useCreateTenant, useTenants } from '@/hooks/useTenants'
import type { CreateTenantInput } from '@/types'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { Building2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CrearTenantDialog } from './components/CrearTenantDialog'

type FilterMode = 'todos' | 'activos' | 'inactivos'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY_FORM: CreateTenantInput = {
  nombre: '',
  slug: '',
  dominioBase: '',
  adminEmail: '',
  adminNombre: '',
}

export default function TenantsPage() {
  const { data: tenants, isLoading, error } = useTenants()
  const createTenant = useCreateTenant()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<CreateTenantInput>({ ...EMPTY_FORM })
  const [createError, setCreateError] = useState('')

  const filtered = tenants?.filter((t) => {
    const matchesSearch =
      !search ||
      t.nombre.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'todos' ||
      (filter === 'activos' && t.activo !== false) ||
      (filter === 'inactivos' && t.activo === false)
    return matchesSearch && matchesFilter
  })

  const handleCreate = async () => {
    if (!form.nombre || !form.slug || !form.dominioBase) {
      setCreateError('Nombre, slug y dominio son requeridos')
      return
    }
    if (!form.adminNombre) {
      setCreateError('El nombre del administrador es requerido')
      return
    }
    if (!EMAIL_REGEX.test(form.adminEmail)) {
      setCreateError('El email del administrador no es válido')
      return
    }
    setCreateError('')
    try {
      const created = await createTenant.mutateAsync(form)
      setDialogOpen(false)
      setForm({ ...EMPTY_FORM })
      navigate(`/tenants/${created.id}`)
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Error al crear municipalidad',
      )
    }
  }

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  if (error) return <Alert severity="error">Error: {error.message}</Alert>

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Municipalidades
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Nueva Municipalidad
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar por nombre o slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 300 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <ToggleButtonGroup
          size="small"
          value={filter}
          exclusive
          onChange={(_, v) => v && setFilter(v)}
        >
          <ToggleButton value="todos">Todos</ToggleButton>
          <ToggleButton value="activos">Activos</ToggleButton>
          <ToggleButton value="inactivos">Inactivos</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {filtered?.length === 0 ? (
        <EmptyState
          icon={Building2}
          message="No se encontraron municipalidades"
          ctaLabel="Nueva Municipalidad"
          onCta={() => setDialogOpen(true)}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Dominio</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Creado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered?.map((t) => (
              <TableRow
                key={t.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/tenants/${t.id}`)}
              >
                <TableCell>{t.nombre}</TableCell>
                <TableCell>{t.slug}</TableCell>
                <TableCell>{t.dominioBase}</TableCell>
                <TableCell>
                  <Chip
                    label={t.activo !== false ? 'Activa' : 'Inactiva'}
                    color={t.activo !== false ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat('es-CL').format(
                    new Date(t.createdAt),
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CrearTenantDialog
        open={dialogOpen}
        form={form}
        error={createError}
        isPending={createTenant.isPending}
        onClose={() => {
          setDialogOpen(false)
          setCreateError('')
        }}
        onChange={setForm}
        onSubmit={handleCreate}
      />
    </Box>
  )
}
