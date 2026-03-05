import { Box, Card, CardContent, Typography } from "@mui/material";
import { Network } from "lucide-react";

export default function EstructuraOrgPage() {
	return (
		<Box>
			<Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
				Estructura organizacional
			</Typography>
			<Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
				<CardContent sx={{ p: 4, textAlign: "center" }}>
					<Network size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
					<Typography variant="h6" color="text.secondary" gutterBottom>
						Próximamente
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Gestión del organigrama municipal: áreas, departamentos, oficinas y jerarquías.
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
}
