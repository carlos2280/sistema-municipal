import { Box } from "@mui/material";
import { Lock } from "lucide-react";
import { memo } from "react";

export const AuthFooter = memo(function AuthFooter() {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: "6px",
				mt: 2.5,
				fontSize: "0.6875rem",
				color: "text.disabled",
			}}
		>
			<Lock size={12} />
			Acceso seguro con encriptación
		</Box>
	);
});
