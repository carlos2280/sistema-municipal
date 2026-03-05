import { Box, Card, CardContent, Typography } from "@mui/material";
import { Landmark } from "lucide-react";

export default function DatosMunicipioPage() {
	return (
		<Box>
			<Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
				Datos del municipio
			</Typography>
			<Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
				<CardContent sx={{ p: 4, textAlign: "center" }}>
					<Landmark size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
					<Typography variant="h6" color="text.secondary" gutterBottom>
						Próximamente
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Información general del municipio: nombre, RUT, dirección, logo institucional.
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
}
