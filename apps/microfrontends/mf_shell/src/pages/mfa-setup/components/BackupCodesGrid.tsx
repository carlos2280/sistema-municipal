import { Box, Typography, styled } from "@mui/material";
import { memo } from "react";

const CodeCell = styled(Box)(({ theme }) => ({
	padding: 12,
	background: theme.palette.background.default,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 8,
	fontFamily: '"JetBrains Mono", "Fira Code", monospace',
	fontSize: "0.8125rem",
	fontWeight: 600,
	color: theme.palette.text.primary,
	letterSpacing: "0.06em",
	textAlign: "center",
}));

interface BackupCodesGridProps {
	codes: string[];
}

export const BackupCodesGrid = memo(function BackupCodesGrid({
	codes,
}: BackupCodesGridProps) {
	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gap: 1,

				"@media (max-width: 639px)": {
					gridTemplateColumns: "1fr",
				},
			}}
		>
			{codes.map((code) => (
				<CodeCell key={code}>{code}</CodeCell>
			))}
		</Box>
	);
});
