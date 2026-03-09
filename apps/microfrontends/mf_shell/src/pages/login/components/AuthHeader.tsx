import { Box, Typography, styled } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";

// ── Icon color variants (matching prototype) ─────────────────────────────────

type IconVariant = "jade" | "indigo" | "gold" | "success";

const variantColors: Record<IconVariant, { bg: string; color: string }> = {
	jade: { bg: "rgba(13, 107, 94, 0.10)", color: "#0d6b5e" },
	indigo: { bg: "rgba(55, 48, 163, 0.10)", color: "#3730a3" },
	gold: { bg: "rgba(180, 83, 9, 0.10)", color: "#b45309" },
	success: { bg: "rgba(5, 150, 105, 0.10)", color: "#059669" },
};

const IconBox = styled(Box)({
	width: 52,
	height: 52,
	borderRadius: 12,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	margin: "0 auto 16px",

	"@media (max-width: 380px)": {
		width: 44,
		height: 44,
	},
});

interface AuthHeaderProps {
	icon: LucideIcon;
	iconVariant?: IconVariant;
	title: string;
	subtitle?: string;
}

export const AuthHeader = memo(function AuthHeader({
	icon: Icon,
	iconVariant = "jade",
	title,
	subtitle,
}: AuthHeaderProps) {
	const colors = variantColors[iconVariant];

	return (
		<Box sx={{ textAlign: "center", mb: 3 }}>
			<IconBox sx={{ bgcolor: colors.bg, color: colors.color }}>
				<Icon size={24} />
			</IconBox>
			<Typography
				sx={{
					fontWeight: 700,
					fontSize: "1.375rem",
					letterSpacing: "-0.03em",
					mb: 0.5,
				}}
			>
				{title}
			</Typography>
			{subtitle && (
				<Typography
					sx={{
						fontSize: "0.8125rem",
						color: "text.secondary",
						lineHeight: 1.5,
					}}
				>
					{subtitle}
				</Typography>
			)}
		</Box>
	);
});
