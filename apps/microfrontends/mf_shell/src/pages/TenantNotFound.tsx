import { Box, Typography, styled } from "@mui/material";
import { SearchX } from "lucide-react";

const Wrapper = styled(Box)(({ theme }) => ({
	minHeight: "100vh",
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	backgroundColor:
		theme.palette.mode === "light"
			? theme.palette.grey[100]
			: theme.palette.grey[900],
	padding: theme.spacing(3),
	textAlign: "center",
}));

export default function TenantNotFound() {
	return (
		<Wrapper>
			<SearchX size={64} style={{ opacity: 0.4, marginBottom: 16 }} />
			<Typography variant="h5" fontWeight={600} gutterBottom>
				Municipalidad no encontrada
			</Typography>
			<Typography variant="body1" color="text.secondary">
				La dirección ingresada no corresponde a ninguna municipalidad registrada.
			</Typography>
		</Wrapper>
	);
}
