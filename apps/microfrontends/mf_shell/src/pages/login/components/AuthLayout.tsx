import { Box, styled } from "@mui/material";
import { memo, type ReactNode } from "react";
import {
	BrandingPanel,
	type BrandingFeature,
} from "./BrandingPanel";

// ── Split-panel layout ───────────────────────────────────────────────────────

const LayoutRoot = styled(Box)({
	display: "flex",
	minHeight: "100vh",
	overflow: "hidden",

	// Tablet portrait — stack vertically
	"@media (max-width: 899px)": {
		flexDirection: "column",
	},
});

const FormPanel = styled(Box)(({ theme }) => ({
	flex: 1,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	padding: 32,
	backgroundColor: theme.palette.background.default,
	position: "relative",
	overflowY: "auto",

	// Tablet portrait
	"@media (max-width: 899px)": {
		padding: "32px 20px",
		justifyContent: "flex-start",
		paddingTop: 32,
	},

	// Mobile
	"@media (max-width: 639px)": {
		padding: "24px 16px",
		paddingTop: 24,
	},
}));

const FormContainer = styled(Box)({
	width: "100%",
	maxWidth: 400,
});

interface AuthLayoutProps {
	children: ReactNode;
	features?: BrandingFeature[];
}

export const AuthLayout = memo(function AuthLayout({
	children,
	features,
}: AuthLayoutProps) {
	return (
		<LayoutRoot>
			<BrandingPanel features={features} />
			<FormPanel>
				<FormContainer>{children}</FormContainer>
			</FormPanel>
		</LayoutRoot>
	);
});
