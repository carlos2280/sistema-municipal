import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

export default function ModuleUnavailablePage() {
	const navigate = useNavigate();

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "60vh",
				gap: 2,
				textAlign: "center",
				p: 3,
			}}
		>
			<Typography variant="h5" fontWeight={600}>
				Módulo No Disponible
			</Typography>
			<Typography variant="body1" color="text.secondary" maxWidth={420}>
				Este módulo no está activo para tu municipalidad. Si crees que esto es
				un error, contacta al administrador.
			</Typography>
			<Button variant="contained" onClick={() => navigate("/")}>
				Ir al Inicio
			</Button>
		</Box>
	);
}
