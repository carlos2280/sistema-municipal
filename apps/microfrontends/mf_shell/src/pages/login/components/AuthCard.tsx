/**
 * AuthCard — Wrapper transparente MERIDIAN
 *
 * El prototipo MERIDIAN no usa card visible en el form panel.
 * Este wrapper mantiene la API pero sin borde/sombra visual.
 * La animación de entrada sigue el spec (entryCard).
 */

import { Box, keyframes, styled } from "@mui/material";
import { memo, type ReactNode } from "react";

const entryCard = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const CardRoot = styled(Box)(({ theme }) => ({
	animation: `${entryCard} 500ms ${theme.transitions.easing.easeOut} both`,

	"@media (prefers-reduced-motion: reduce)": {
		animation: "none",
	},
}));

interface AuthCardProps {
	readonly children: ReactNode;
}

export const AuthCard = memo(function AuthCard({ children }: AuthCardProps) {
	return <CardRoot>{children}</CardRoot>;
});
