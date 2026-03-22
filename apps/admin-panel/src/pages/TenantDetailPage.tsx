import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { SuccessSnackbar } from '@/components/shared/SuccessSnackbar'
import { useModules } from '@/hooks/useModules'
import {
  useCreateSubscription,
  useSubscriptions,
  useUpdateSubscriptionEstado,
} from '@/hooks/useSubscriptions'
import {
  useDeactivateTenant,
  useTenant,
  useUpdateTenant,
} from '@/hooks/useTenants'
import type { EstadoSuscripcion, UpdateTenantInput } from '@/types'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ActivarModuloDialog } from './components/ActivarModuloDialog'
import { CambiarEstadoSuscripcionDialog } from './components/CambiarEstadoSuscripcionDialog'
import { EditTenantDialog } from './components/EditTenantDialog'
import { TenantInfoRow } from './components/TenantInfoRow'
import { TenantSuscripcionesCard } from './components/TenantSuscripcionesCard'

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const tenantId = Number(id)
  const navigate = useNavigate()

  const { data: tenant, isLoading, error } = useTenant(tenantId)
  const { data: subs, isLoading: subsLoading } = useSubscriptions(tenantId)
  const { data: allModules } = useModules()
  const updateTenant = useUpdateTenant(tenantId)
  const deactivateTenant = useDeactivateTenant()
  const createSubscription = useCreateSubscription(tenantId)
  const updateEstado = useUpdateSubscriptionEstado(tenantId)

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<UpdateTenantInput>({})
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [addSubOpen, setAddSubOpen] = useState(false)
  const [newSubModuloId, setNewSubModuloId] = useState<number>(0)
  const [estadoDialogOpen, setEstadoDialogOpen] = useState(false)
  const [selectedSubId, setSelectedSubId] = useState(0)
  const [newEstado, setNewEstado] = useState<EstadoSuscripcion>('activa')
  const [motivo, setMotivo] = useState('')
  const [actionError, setActionError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  if (error || !tenant)
    return <Alert severity="error">Municipalidad no encontrada</Alert>

  const subscribedIds = new Set(subs?.map((s) => s.modulo.id) ?? [])
  const availableModules =
    allModules?.filter((m) => !subscribedIds.has(m.id) && m.activo !== false) ??
    []

  const openEdit = () => {
    setEditForm({
      nombre: tenant.nombre,
      dominioBase: tenant.dominioBase,
      rut: tenant.rut ?? undefined,
      direccion: tenant.direccion ?? undefined,
      telefono: tenant.telefono ?? undefined,
      emailContacto: tenant.emailContacto ?? undefined,
      maxUsuarios: tenant.maxUsuarios ?? undefined,
    })
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    setActionError('')
    try {
      await updateTenant.mutateAsync(editForm)
      setEditOpen(false)
      setSuccessMsg('Municipalidad actualizada')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  const handleDeactivate = async () => {
    try {
      await deactivateTenant.mutateAsync(tenantId)
      navigate('/tenants')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al desactivar')
    }
  }

  const handleAddSubscription = async () => {
    if (!newSubModuloId) return
    setActionError('')
    try {
      await createSubscription.mutateAsync({
        tenantId,
        moduloId: newSubModuloId,
        activadoPor: 'admin',
      })
      setAddSubOpen(false)
      setNewSubModuloId(0)
      setSuccessMsg('Módulo activado')
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Error al activar módulo',
      )
    }
  }

  const openEstadoDialog = (
    subId: number,
    currentEstado: EstadoSuscripcion,
  ) => {
    setSelectedSubId(subId)
    setNewEstado(currentEstado)
    setMotivo('')
    setEstadoDialogOpen(true)
  }

  const handleUpdateEstado = async () => {
    setActionError('')
    try {
      await updateEstado.mutateAsync({
        id: selectedSubId,
        data: {
          estado: newEstado,
          motivo: motivo || undefined,
          ejecutadoPor: 'admin',
        },
      })
      setEstadoDialogOpen(false)
      setSuccessMsg('Estado actualizado')
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Error al cambiar estado',
      )
    }
  }

  const isActive = tenant.activo !== false

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/tenants')}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>
      {actionError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setActionError('')}
        >
          {actionError}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" fontWeight={700}>
            {tenant.nombre}
          </Typography>
          <Chip
            label={isActive ? 'Activa' : 'Inactiva'}
            color={isActive ? 'success' : 'default'}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            onClick={openEdit}
          >
            Editar
          </Button>
          {isActive && (
            <Button
              color="error"
              variant="outlined"
              onClick={() => setDeactivateOpen(true)}
            >
              Desactivar
            </Button>
          )}
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TenantInfoRow label="Slug" value={tenant.slug} />
          <TenantInfoRow label="DB Name" value={tenant.dbName} />
          <TenantInfoRow label="Dominio" value={tenant.dominioBase} />
          <TenantInfoRow label="RUT" value={tenant.rut} />
          <TenantInfoRow label="Dirección" value={tenant.direccion} />
          <TenantInfoRow label="Teléfono" value={tenant.telefono} />
          <TenantInfoRow label="Email" value={tenant.emailContacto} />
          <TenantInfoRow label="Max Usuarios" value={tenant.maxUsuarios} />
          <TenantInfoRow
            label="Creado"
            value={new Intl.DateTimeFormat('es-CL', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(tenant.createdAt))}
          />
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />

      <TenantSuscripcionesCard
        subs={subs}
        isLoading={subsLoading}
        canAddModule={availableModules.length > 0}
        onAddModule={() => setAddSubOpen(true)}
        onChangeEstado={openEstadoDialog}
      />

      <EditTenantDialog
        open={editOpen}
        form={editForm}
        isPending={updateTenant.isPending}
        onClose={() => setEditOpen(false)}
        onChange={setEditForm}
        onSave={handleUpdate}
      />
      <ActivarModuloDialog
        open={addSubOpen}
        modulos={availableModules}
        selectedId={newSubModuloId}
        isPending={createSubscription.isPending}
        onClose={() => setAddSubOpen(false)}
        onSelect={setNewSubModuloId}
        onActivar={handleAddSubscription}
      />
      <CambiarEstadoSuscripcionDialog
        open={estadoDialogOpen}
        estado={newEstado}
        motivo={motivo}
        isPending={updateEstado.isPending}
        onClose={() => setEstadoDialogOpen(false)}
        onEstadoChange={setNewEstado}
        onMotivoChange={setMotivo}
        onConfirm={handleUpdateEstado}
      />
      <ConfirmDialog
        open={deactivateOpen}
        title="Desactivar Municipalidad"
        message={`¿Estás seguro de desactivar "${tenant.nombre}"? La base de datos no se eliminará.`}
        confirmLabel="Desactivar"
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateOpen(false)}
        loading={deactivateTenant.isPending}
      />
      <SuccessSnackbar
        open={!!successMsg}
        message={successMsg}
        onClose={() => setSuccessMsg('')}
      />
    </Box>
  )
}
