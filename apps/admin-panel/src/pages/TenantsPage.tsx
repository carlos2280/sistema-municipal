import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTenant, useTenants } from "../hooks/useTenants";
import type { CreateTenantInput } from "../types";

type FilterMode = "todos" | "activos" | "inactivos";

const EMPTY_FORM: CreateTenantInput = {
  nombre: "",
  slug: "",
  dominioBase: "",
};

export default function TenantsPage() {
  const { data: tenants, isLoading, error } = useTenants();
  const createTenant = useCreateTenant();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateTenantInput>({ ...EMPTY_FORM });
  const [createError, setCreateError] = useState("");

  const filtered = tenants?.filter((t) => {
    const matchesSearch =
      !search ||
      t.nombre.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "todos" ||
      (filter === "activos" && t.activo !== false) ||
      (filter === "inactivos" && t.activo === false);
    return matchesSearch && matchesFilter;
  });

  const handleCreate = async () => {
    if (!form.nombre || !form.slug || !form.dominioBase) {
      setCreateError("Nombre, slug y dominio son requeridos");
      return;
    }
    setCreateError("");
    try {
      const created = await createTenant.mutateAsync(form);
      setDialogOpen(false);
      setForm({ ...EMPTY_FORM });
      navigate(`/tenants/${created.id}`);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Error al crear municipalidad",
      );
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error: {error.message}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
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

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Buscar por nombre o slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
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
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(`/tenants/${t.id}`)}
            >
              <TableCell>{t.nombre}</TableCell>
              <TableCell>{t.slug}</TableCell>
              <TableCell>{t.dominioBase}</TableCell>
              <TableCell>
                <Chip
                  label={t.activo !== false ? "Activa" : "Inactiva"}
                  color={t.activo !== false ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {new Intl.DateTimeFormat("es-CL").format(new Date(t.createdAt))}
              </TableCell>
            </TableRow>
          ))}
          {filtered?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No se encontraron municipalidades
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nueva Municipalidad</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          {createError && <Alert severity="error">{createError}</Alert>}
          <TextField
            label="Nombre"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <TextField
            label="Slug"
            required
            value={form.slug}
            onChange={(e) =>
              setForm({
                ...form,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
              })
            }
            helperText="Solo letras minúsculas, números y guiones"
          />
          <TextField
            label="Dominio Base"
            required
            value={form.dominioBase}
            onChange={(e) => setForm({ ...form, dominioBase: e.target.value })}
            helperText="Ej: santiago.plataforma.cl"
          />
          <TextField
            label="RUT (opcional)"
            value={form.rut ?? ""}
            onChange={(e) => setForm({ ...form, rut: e.target.value || undefined })}
          />
          <TextField
            label="Max Usuarios"
            type="number"
            value={form.maxUsuarios ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                maxUsuarios: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            helperText="Por defecto: 50"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={createTenant.isPending}
          >
            {createTenant.isPending ? "Creando..." : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
