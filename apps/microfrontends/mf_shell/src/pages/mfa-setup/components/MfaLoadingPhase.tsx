import { CircularProgress, Stack, Typography } from "@mui/material";
import { memo } from "react";

export const MfaLoadingPhase = memo(function MfaLoadingPhase() {
	return (
		<Stack alignItems="center" spacing={2} py={4}>
			<CircularProgress size={48} />
			<Typography variant="body2" color="text.secondary">
				Preparando tu configuración MFA...
			</Typography>
		</Stack>
	);
});
