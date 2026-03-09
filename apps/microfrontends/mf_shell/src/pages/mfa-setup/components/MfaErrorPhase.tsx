import { Box, Button, Stack, Typography } from "@mui/material";
import { AlertCircle } from "lucide-react";
import { memo } from "react";

interface MfaErrorPhaseProps {
	message: string;
	onBack: () => void;
}

export const MfaErrorPhase = memo(function MfaErrorPhase({
	message,
	onBack,
}: MfaErrorPhaseProps) {
	return (
		<Stack alignItems="center" spacing={3}>
			<Box sx={{ color: "error.main" }}>
				<AlertCircle size={56} />
			</Box>
			<Typography variant="body2" color="text.secondary" textAlign="center">
				{message}
			</Typography>
			<Button
				variant="contained"
				fullWidth
				onClick={onBack}
				sx={{
					borderRadius: 2,
					textTransform: "none",
					fontWeight: 600,
				}}
			>
				Volver al inicio de sesión
			</Button>
		</Stack>
	);
});
