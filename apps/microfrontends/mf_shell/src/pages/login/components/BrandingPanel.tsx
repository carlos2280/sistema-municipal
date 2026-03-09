import { Box, Typography, styled } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import {
	selectTenantLogoUrl,
	selectTenantNombre,
	useAppSelector,
} from "mf_store/store";

// ── Types ────────────────────────────────────────────────────────────────────

export interface BrandingFeature {
	icon: LucideIcon;
	title: string;
	description: string;
}

interface BrandingPanelProps {
	features?: BrandingFeature[];
}

// ── Styled components ────────────────────────────────────────────────────────

const Panel = styled(Box)(({ theme }) => ({
	flex: "0 0 480px",
	background:
		"linear-gradient(160deg, #0a5249 0%, #0d6b5e 40%, #3730a3 100%)",
	color: "#fff",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	padding: "48px 32px",
	position: "relative",
	overflow: "hidden",

	// Decorative radial gradients
	"&::before": {
		content: '""',
		position: "absolute",
		top: "-20%",
		right: "-20%",
		width: "80%",
		height: "160%",
		background:
			"radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 55%)",
		pointerEvents: "none",
	},
	"&::after": {
		content: '""',
		position: "absolute",
		bottom: "-20%",
		left: "-15%",
		width: "60%",
		height: "120%",
		background:
			"radial-gradient(circle, rgba(55, 48, 163, 0.15) 0%, transparent 50%)",
		pointerEvents: "none",
	},

	// Dark mode: slightly deeper gradient
	...(theme.palette.mode === "dark" && {
		background:
			"linear-gradient(160deg, #073b35 0%, #0a5249 40%, #2b2890 100%)",
	}),

	// Large screens
	"@media (min-width: 1536px)": {
		flex: "0 0 540px",
	},

	// Tablet landscape
	"@media (max-width: 1199px)": {
		flex: "0 0 400px",
		padding: "32px 24px",
	},

	// Tablet portrait — collapse to top bar
	"@media (max-width: 899px)": {
		flex: "none",
		padding: "32px 20px",
		minHeight: "auto",
	},

	// Mobile
	"@media (max-width: 639px)": {
		padding: "20px 16px",
	},
}));

const BrandContent = styled(Box)({
	position: "relative",
	zIndex: 1,
	textAlign: "center",
	maxWidth: 320,

	"@media (max-width: 899px)": {
		display: "flex",
		alignItems: "center",
		gap: 16,
		textAlign: "left",
		maxWidth: "none",
	},
});

const LogoBox = styled(Box)({
	width: 96,
	height: 96,
	borderRadius: 16,
	background: "rgba(255, 255, 255, 0.15)",
	backdropFilter: "blur(12px)",
	WebkitBackdropFilter: "blur(12px)",
	border: "1px solid rgba(255, 255, 255, 0.2)",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	margin: "0 auto 24px",
	overflow: "hidden",

	"& img": {
		width: 64,
		height: 64,
		objectFit: "contain",
	},

	"@media (max-width: 899px)": {
		width: 56,
		height: 56,
		margin: 0,
		borderRadius: 12,
		"& img": { width: 38, height: 38 },
	},

	"@media (max-width: 639px)": {
		width: 48,
		height: 48,
		borderRadius: 8,
		"& img": { width: 32, height: 32 },
	},
});

const LogoFallback = styled(Typography)({
	fontWeight: 800,
	fontSize: "2.5rem",
	letterSpacing: "-0.04em",
	color: "#fff",

	"@media (max-width: 899px)": { fontSize: "1.5rem" },
	"@media (max-width: 639px)": { fontSize: "1.25rem" },
});

const BrandName = styled(Typography)({
	fontWeight: 700,
	fontSize: "1.5rem",
	letterSpacing: "-0.03em",
	marginBottom: 4,
	color: "#fff",

	"@media (max-width: 899px)": { fontSize: "1.125rem", marginBottom: 0 },
	"@media (max-width: 639px)": { fontSize: "1rem" },
});

const BrandSubtitle = styled(Typography)({
	fontSize: "0.8125rem",
	fontWeight: 500,
	letterSpacing: "0.12em",
	textTransform: "uppercase",
	opacity: 0.7,
	marginBottom: 32,
	color: "#fff",

	"@media (max-width: 899px)": {
		marginBottom: 0,
		fontSize: "0.6875rem",
	},
	"@media (max-width: 639px)": {
		fontSize: "0.625rem",
		letterSpacing: "0.08em",
	},
});

const FeaturesWrapper = styled(Box)({
	display: "flex",
	flexDirection: "column",
	gap: 16,
	textAlign: "left",
	position: "relative",
	zIndex: 1,

	"@media (max-width: 1199px)": { display: "none" },
});

const FeatureRow = styled(Box)({
	display: "flex",
	alignItems: "flex-start",
	gap: 12,
});

const FeatureIconBox = styled(Box)({
	width: 36,
	height: 36,
	borderRadius: 8,
	background: "rgba(255, 255, 255, 0.12)",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
});

const DeveloperFooter = styled(Box)({
	position: "absolute",
	bottom: 24,
	left: 0,
	right: 0,
	textAlign: "center",
	zIndex: 1,

	"@media (max-width: 899px)": { display: "none" },
});

// ── Component ────────────────────────────────────────────────────────────────

export const BrandingPanel = memo(function BrandingPanel({
	features = [],
}: BrandingPanelProps) {
	const tenantNombre = useAppSelector(selectTenantNombre);
	const tenantLogoUrl = useAppSelector(selectTenantLogoUrl);

	const initials = (tenantNombre || "SM")
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<Panel>
			<BrandContent>
				<LogoBox>
					{tenantLogoUrl ? (
						<img src={tenantLogoUrl} alt={tenantNombre || "Logo"} />
					) : (
						<LogoFallback>{initials}</LogoFallback>
					)}
				</LogoBox>
				<Box>
					<BrandName>{tenantNombre || "Sistema Municipal"}</BrandName>
					<BrandSubtitle>Sistema Municipal</BrandSubtitle>
				</Box>
			</BrandContent>

			{features.length > 0 && (
				<FeaturesWrapper>
					{features.map((feat) => (
						<FeatureRow key={feat.title}>
							<FeatureIconBox>
								<feat.icon size={18} color="#fff" />
							</FeatureIconBox>
							<Box>
								<Typography
									sx={{
										fontWeight: 600,
										fontSize: "0.875rem",
										mb: "2px",
										color: "#fff",
									}}
								>
									{feat.title}
								</Typography>
								<Typography
									sx={{
										fontSize: "0.8125rem",
										lineHeight: 1.5,
										opacity: 0.9,
										color: "#fff",
									}}
								>
									{feat.description}
								</Typography>
							</Box>
						</FeatureRow>
					))}
				</FeaturesWrapper>
			)}

			<DeveloperFooter>
				<Box
					sx={{
						fontSize: "0.6875rem",
						opacity: 0.4,
						letterSpacing: "0.04em",
						color: "#fff",
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						"&:hover": { opacity: 0.6 },
						transition: "opacity 100ms ease",
					}}
				>
					<Box
						sx={{
							width: 8,
							height: 8,
							borderRadius: "3px",
							background: "rgba(255, 255, 255, 0.4)",
						}}
					/>
					Desarrollado por CrisCar
				</Box>
			</DeveloperFooter>
		</Panel>
	);
});
