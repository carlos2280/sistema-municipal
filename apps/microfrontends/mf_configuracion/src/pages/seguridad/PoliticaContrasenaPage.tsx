import { Box, Card, CardContent, Typography } from "@mui/material";
import { KeyRound } from "lucide-react";

export default function PoliticaContrasenaPage() {
	return (
		<Box>
			<Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
				Política de contraseñas
			</Typography>
			<Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
				<CardContent sx={{ p: 4, textAlign: "center" }}>
					<KeyRound size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
					<Typography variant="h6" color="text.secondary" gutterBottom>
						Próximamente
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Configuración de políticas de contraseñas: longitud mínima, complejidad,
						vencimiento y reutilización.
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
}
