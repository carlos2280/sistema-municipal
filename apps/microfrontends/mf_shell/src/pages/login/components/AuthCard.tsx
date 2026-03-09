import { Box, styled } from "@mui/material";
import { memo, type ReactNode } from "react";

const StyledCard = styled(Box)(({ theme }) => ({
	background: theme.palette.background.paper,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 16,
	padding: 32,
	boxShadow:
		theme.palette.mode === "light"
			? "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)"
			: "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
	transition: "box-shadow 200ms ease, border-color 200ms ease",

	"@media (min-width: 1536px)": {
		padding: 40,
	},

	"@media (max-width: 639px)": {
		padding: 24,
		borderRadius: 12,
	},

	"@media (max-width: 380px)": {
		padding: 20,
	},
}));

interface AuthCardProps {
	children: ReactNode;
	maxWidth?: number;
}

export const AuthCard = memo(function AuthCard({
	children,
	maxWidth,
}: AuthCardProps) {
	return (
		<StyledCard sx={maxWidth ? { maxWidth } : undefined}>
			{children}
		</StyledCard>
	);
});
