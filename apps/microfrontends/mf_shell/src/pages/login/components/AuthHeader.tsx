/**
 * AuthHeader — Título del paso MERIDIAN
 *
 * Display font (Bricolage Grotesque), sin icon box decorativo.
 * El prototipo usa fc-head con fc-title + fc-sub.
 */

import { Box, Typography, styled } from "@mui/material";
import { memo } from "react";

// ── Styled ──────────────────────────────────────────────────────────────────

const HeaderRoot = styled(Box)(() => ({
	marginBottom: 28,
}));

const Title = styled(Typography)(({ theme }) => ({
	fontFamily: theme.typography.h1?.fontFamily,
	fontSize: "clamp(22px, 2.5vw, 28px)",
	fontWeight: 700,
	letterSpacing: "-0.025em",
	lineHeight: 1.15,
	color: theme.palette.text.primary,
	marginBottom: 6,
}));

const Subtitle = styled(Typography)(({ theme }) => ({
	fontSize: 13,
	color: theme.palette.text.secondary,
	lineHeight: 1.55,
}));

// ── Component ───────────────────────────────────────────────────────────────

interface AuthHeaderProps {
	readonly title: string;
	readonly subtitle?: string;
}

export const AuthHeader = memo(function AuthHeader({
	title,
	subtitle,
}: AuthHeaderProps) {
	return (
		<HeaderRoot>
			<Title>{title}</Title>
			{subtitle && <Subtitle>{subtitle}</Subtitle>}
		</HeaderRoot>
	);
});
