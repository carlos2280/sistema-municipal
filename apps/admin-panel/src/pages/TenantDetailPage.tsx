import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import StatusChip from "../components/shared/StatusChip";
import { useModules } from "../hooks/useModules";
import {
  useCreateSubscription,
  useSubscriptions,
  useUpdateSubscriptionEstado,
} from "../hooks/useSubscriptions";
import { useDeactivateTenant, useTenant, useUpdateTenant } from "../hooks/useTenants";
import type { EstadoSuscripcion, UpdateTenantInput } from "../types";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      <Grid size={{ xs: 4 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Grid>
      <Grid size={{ xs: 8 }}>
        <Typography variant="body2">{value || "—"}</Typography>
      </Grid>
    </Grid>
  );
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tenantId = Number(id);
  const navigate = useNavigate();

  const { data: tenant, isLoading, error } = useTenant(tenantId);
  const { data: subs, isLoading: subsLoading } = useSubscriptions(tenantId);
  const { data: allModules } = useModules();
  const updateTenant = useUpdateTenant(tenantId);
  const deactivateTenant = useDeactivateTenant();
  const createSubscription = useCreateSubscription(tenantId);
  const updateEstado = useUpdateSubscriptionEstado(tenantId);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<UpdateTenantInput>({});
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [addSubOpen, setAddSubOpen] = useState(false);
  const [newSubModuloId, setNewSubModuloId] = useState<number>(0);
  const [estadoDialogOpen, setEstadoDialogOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState(0);
  const [newEstado, setNewEstado] = useState<EstadoSuscripcion>("activa");
  const [motivo, setMotivo] = useState("");
  const [actionError, setActionError] = useState("");

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tenant) {
    return <Alert severity="error">Municipalidad no encontrada</Alert>;
  }

  const subscribedModuleIds = new Set(subs?.map((s) => s.modulo.id) ?? []);
  const availableModules =
    allModules?.filter((m) => !subscribedModuleIds.has(m.id) && m.activo !== false) ?? [];

  const openEdit = () => {
    setEditForm({
      nombre: tenant.nombre,
      dominioBase: tenant.dominioBase,
      rut: tenant.rut ?? undefined,
      direccion: tenant.direccion ?? undefined,
      telefono: tenant.telefono ?? undefined,
      emailContacto: tenant.emailContacto ?? undefined,
      maxUsuarios: tenant.maxUsuarios ?? undefined,
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    setActionError("");
    try {
      await updateTenant.mutateAsync(editForm);
      setEditOpen(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateTenant.mutateAsync(tenantId);
      navigate("/tenants");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al desactivar");
    }
  };

  const handleAddSubscription = async () => {
    if (!newSubModuloId) return;
    setActionError("");
    try {
      await createSubscription.mutateAsync({
        tenantId,
        moduloId: newSubModuloId,
        activadoPor: "admin",
      });
      setAddSubOpen(false);
      setNewSubModuloId(0);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al activar módulo");
    }
  };

  const openEstadoDialog = (subId: number, currentEstado: EstadoSuscripcion) => {
    setSelectedSubId(subId);
    setNewEstado(currentEstado);
    setMotivo("");
    setEstadoDialogOpen(true);
  };

  const handleUpdateEstado = async () => {
    setActionError("");
    try {
      await updateEstado.mutateAsync({
        id: selectedSubId,
        data: {
          estado: newEstado,
          motivo: motivo || undefined,
          ejecutadoPor: "admin",
        },
      });
      setEstadoDialogOpen(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al cambiar estado");
    }
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/tenants")}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>
          {actionError}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h4" fontWeight={700}>
            {tenant.nombre}
          </Typography>
          <Chip
            label={tenant.activo !== false ? "Activa" : "Inactiva"}
            color={tenant.activo !== false ? "success" : "default"}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button startIcon={<EditIcon />} variant="outlined" onClick={openEdit}>
            Editar
          </Button>
          {tenant.activo !== false && (
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
          <InfoRow label="Slug" value={tenant.slug} />
          <InfoRow label="DB Name" value={tenant.dbName} />
          <InfoRow label="Dominio" value={tenant.dominioBase} />
          <InfoRow label="RUT" value={tenant.rut} />
          <InfoRow label="Dirección" value={tenant.direccion} />
          <InfoRow label="Teléfono" value={tenant.telefono} />
          <InfoRow label="Email" value={tenant.emailContacto} />
          <InfoRow label="Max Usuarios" value={tenant.maxUsuarios} />
          <InfoRow
            label="Creado"
            value={new Intl.DateTimeFormat("es-CL", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(tenant.createdAt))}
          />
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Suscripciones
        </Typography>
        {availableModules.length > 0 && (
          <Button
            variant="contained"
            size="small"
            onClick={() => setAddSubOpen(true)}
          >
            Activar Módulo
          </Button>
        )}
      </Box>

      {subsLoading ? (
        <CircularProgress />
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Módulo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Precio Mensual</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subs?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.modulo.nombre}</TableCell>
                  <TableCell>
                    <StatusChip estado={s.estado} />
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("es-CL").format(
                      new Date(s.fechaInicio),
                    )}
                  </TableCell>
                  <TableCell>
                    {s.precioMensual
                      ? `$${Number(s.precioMensual).toLocaleString("es-CL")}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => openEstadoDialog(s.id, s.estado)}
                    >
                      Cambiar Estado
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!subs || subs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Sin suscripciones activas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog: Editar Tenant */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Municipalidad</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField
            label="Nombre"
            value={editForm.nombre ?? ""}
            onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
          />
          <TextField
            label="Dominio Base"
            value={editForm.dominioBase ?? ""}
            onChange={(e) => setEditForm({ ...editForm, dominioBase: e.target.value })}
          />
          <TextField
            label="RUT"
            value={editForm.rut ?? ""}
            onChange={(e) => setEditForm({ ...editForm, rut: e.target.value || undefined })}
          />
          <TextField
            label="Dirección"
            value={editForm.direccion ?? ""}
            onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value || undefined })}
          />
          <TextField
            label="Teléfono"
            value={editForm.telefono ?? ""}
            onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value || undefined })}
          />
          <TextField
            label="Email de Contacto"
            value={editForm.emailContacto ?? ""}
            onChange={(e) => setEditForm({ ...editForm, emailContacto: e.target.value || undefined })}
          />
          <TextField
            label="Max Usuarios"
            type="number"
            value={editForm.maxUsuarios ?? ""}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                maxUsuarios: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={updateTenant.isPending}
          >
            {updateTenant.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Activar Módulo */}
      <Dialog open={addSubOpen} onClose={() => setAddSubOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Activar Módulo</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Módulo</InputLabel>
            <Select
              value={newSubModuloId}
              label="Módulo"
              onChange={(e) => setNewSubModuloId(Number(e.target.value))}
            >
              {availableModules.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSubOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAddSubscription}
            disabled={!newSubModuloId || createSubscription.isPending}
          >
            {createSubscription.isPending ? "Activando..." : "Activar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Cambiar Estado */}
      <Dialog
        open={estadoDialogOpen}
        onClose={() => setEstadoDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Cambiar Estado</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              value={newEstado}
              label="Estado"
              onChange={(e) => setNewEstado(e.target.value as EstadoSuscripcion)}
            >
              <MenuItem value="activa">Activa</MenuItem>
              <MenuItem value="trial">Trial</MenuItem>
              <MenuItem value="suspendida">Suspendida</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Motivo (opcional)"
            multiline
            rows={2}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadoDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleUpdateEstado}
            disabled={updateEstado.isPending}
          >
            {updateEstado.isPending ? "Guardando..." : "Cambiar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Confirmar Desactivar */}
      <ConfirmDialog
        open={deactivateOpen}
        title="Desactivar Municipalidad"
        message={`¿Estás seguro de desactivar "${tenant.nombre}"? La base de datos no se eliminará.`}
        confirmLabel="Desactivar"
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateOpen(false)}
        loading={deactivateTenant.isPending}
      />
    </Box>
  );
}
