/**
 * AuthLayout — Split-panel MERIDIAN
 *
 * Left: BrandingPanel (void + orbs)
 * Right: Form content (ground background)
 *
 * Responsive: stacks vertically on tablet/mobile.
 */

import { Box, keyframes, styled } from "@mui/material";
import { type ReactNode, memo } from "react";
import { BrandingPanel } from "./BrandingPanel";

// ── Animations ──────────────────────────────────────────────────────────────

const rootExit = keyframes`
  to { opacity: 0; }
`;

// ── Layout ──────────────────────────────────────────────────────────────────

const LayoutRoot = styled(Box)<{ ownerState: { exiting: boolean } }>(
	({ theme, ownerState }) => ({
		position: "fixed",
		inset: 0,
		display: "grid",
		gridTemplateColumns: "1fr 1fr",
		background: theme.meridian.surfaces.void,
		fontFamily: theme.typography.fontFamily,
		color: theme.palette.text.primary,

		...(ownerState.exiting && {
			animation: `${rootExit} 400ms ease-in forwards`,
		}),

		[theme.breakpoints.down("lg")]: {
			gridTemplateColumns: "40% 1fr",
		},

		[theme.breakpoints.down("md")]: {
			gridTemplateColumns: "1fr",
			gridTemplateRows: "auto 1fr",
		},

		"@media (min-width: 1440px)": {
			gridTemplateColumns: "1fr 1fr",
		},

		"@media (prefers-reduced-motion: reduce)": {
			animationDuration: "0.01ms !important",
		},
	}),
);

const FormPanel = styled(Box)(({ theme }) => ({
	position: "relative",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	background: theme.meridian.surfaces.ground,
	padding: "32px 48px",
	overflowY: "auto",
	overflowX: "hidden",

	// Custom scrollbar
	"&::-webkit-scrollbar": { width: 3 },
	"&::-webkit-scrollbar-track": { background: "transparent" },
	"&::-webkit-scrollbar-thumb": {
		background: "rgba(255,255,255,0.08)",
		borderRadius: 2,
	},

	[theme.breakpoints.down("lg")]: {
		padding: "24px 32px",
	},

	[theme.breakpoints.down("md")]: {
		padding: "32px 24px",
		alignItems: "flex-start",
		paddingTop: 40,
	},

	[theme.breakpoints.down("sm")]: {
		padding: "24px 20px",
		paddingTop: 32,
	},

	"@media (min-width: 1440px)": {
		padding: "48px 72px",
	},
}));

const FormContainer = styled(Box)(() => ({
	width: "100%",
	maxWidth: 400,
	position: "relative",
	zIndex: 1,

	"@media (min-width: 1440px)": {
		maxWidth: 440,
	},

	"@media (max-width: 767px)": {
		maxWidth: "100%",
	},
}));

// ── Component ───────────────────────────────────────────────────────────────

interface AuthLayoutProps {
	readonly children: ReactNode;
	readonly exiting?: boolean;
}

export const AuthLayout = memo(function AuthLayout({
	children,
	exiting = false,
}: AuthLayoutProps) {
	return (
		<LayoutRoot ownerState={{ exiting }}>
			<BrandingPanel />
			<FormPanel>
				<FormContainer>{children}</FormContainer>
			</FormPanel>
		</LayoutRoot>
	);
});
