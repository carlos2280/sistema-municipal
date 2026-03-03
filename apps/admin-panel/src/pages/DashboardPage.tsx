import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DomainIcon from "@mui/icons-material/Domain";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { useTenants } from "../hooks/useTenants";

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ color, fontSize: 40, display: "flex" }}>{icon}</Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: tenants, isLoading, error } = useTenants();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar datos: {error.message}</Alert>;
  }

  const total = tenants?.length ?? 0;
  const activas = tenants?.filter((t) => t.activo !== false).length ?? 0;
  const inactivas = total - activas;
  const recientes = tenants?.slice(0, 5) ?? [];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Total Municipalidades"
            value={total}
            icon={<DomainIcon fontSize="inherit" />}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Activas"
            value={activas}
            icon={<CheckCircleIcon fontSize="inherit" />}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Inactivas"
            value={inactivas}
            icon={<RemoveCircleIcon fontSize="inherit" />}
            color="error.main"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Municipalidades recientes
      </Typography>
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
              </TableRow>
            ))}
            {recientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay municipalidades registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
