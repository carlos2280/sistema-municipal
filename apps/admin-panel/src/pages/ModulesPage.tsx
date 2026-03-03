import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useModules } from "../hooks/useModules";

export default function ModulesPage() {
  const { data: modules, isLoading, error } = useModules();

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
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Módulos Disponibles
      </Typography>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>API Prefix</TableCell>
              <TableCell>MF Name</TableCell>
              <TableCell>Orden</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {modules?.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.nombre}</TableCell>
                <TableCell>
                  <Chip label={m.codigo} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{m.descripcion || "—"}</TableCell>
                <TableCell>{m.apiPrefix}</TableCell>
                <TableCell>{m.mfName || "—"}</TableCell>
                <TableCell>{m.orden}</TableCell>
                <TableCell>
                  <Chip
                    label={m.activo !== false ? "Activo" : "Inactivo"}
                    color={m.activo !== false ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
            {(!modules || modules.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay módulos configurados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
