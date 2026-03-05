import { Box, Card, CardContent, Typography } from "@mui/material";
import { Users } from "lucide-react";

export default function UsuariosPerfilesPage() {
	return (
		<Box>
			<Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
				Usuarios y perfiles
			</Typography>
			<Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
				<CardContent sx={{ p: 4, textAlign: "center" }}>
					<Users size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
					<Typography variant="h6" color="text.secondary" gutterBottom>
						Próximamente
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Administración de usuarios del sistema: creación, asignación de perfiles y permisos.
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
}
