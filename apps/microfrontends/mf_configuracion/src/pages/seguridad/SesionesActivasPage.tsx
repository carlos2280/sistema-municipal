import { Box, Card, CardContent, Typography } from "@mui/material";
import { MonitorCheck } from "lucide-react";

export default function SesionesActivasPage() {
	return (
		<Box>
			<Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
				Sesiones activas
			</Typography>
			<Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
				<CardContent sx={{ p: 4, textAlign: "center" }}>
					<MonitorCheck size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
					<Typography variant="h6" color="text.secondary" gutterBottom>
						Próximamente
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Visualización y revocación de sesiones activas de usuarios en el sistema.
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
}
