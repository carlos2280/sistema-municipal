/**
 * EyebrowBrand — Zona izquierda del Eyebrow (molécula del layout)
 *
 * CONSUME átomos de mf_ui: MeridianLogo, StatusDot, ClockDisplay
 * Contiene: Logo + wordmark + status dot + reloj + tenant
 * Priority+: P1 (logo), P2 (wordmark), P3 (dot, time, tenant)
 */

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useAppSelector, selectTenantNombre } from "mf_store/store";
import { MeridianLogo, StatusDot, ClockDisplay } from "mf_ui/components";

// ─── Styled Components ──────────────────────────────────────────

const BrandContainer = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 8,
	fontSize: 11,
	color: theme.palette.text.disabled,
	minWidth: 0,
}));

const BrandMark = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 5,
	paddingRight: 10,
	borderRight: `1px solid ${theme.meridian.borders.muted}`,
	flexShrink: 0,
	cursor: "default",
	"&:hover .ey-wordmark": {
		color: theme.palette.text.primary,
	},
	"&:hover .ey-logo": {
		filter: "brightness(1.2)",
	},
}));

const Wordmark = styled("span")(({ theme }) => ({
	fontFamily: theme.typography.mono.fontFamily,
	fontSize: 10,
	letterSpacing: "0.18em",
	textTransform: "uppercase",
	fontWeight: 500,
	color: theme.palette.text.secondary,
	transition: "color 200ms",
	// P2: oculto en mobile
	[theme.breakpoints.down("md")]: {
		display: "none",
	},
}));

/** Wrapper P3 — oculta elementos en tablet y mobile */
const P3Hidden = styled("span")(({ theme }) => ({
	display: "inline-flex",
	alignItems: "center",
	flexShrink: 0,
	[theme.breakpoints.down("lg")]: {
		display: "none",
	},
}));

const TenantSep = styled("span")(({ theme }) => ({
	color: theme.meridian.text.tx4,
	flexShrink: 0,
	[theme.breakpoints.down("lg")]: {
		display: "none",
	},
}));

const TenantContainer = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 4,
	flexShrink: 0,
	[theme.breakpoints.down("lg")]: {
		display: "none",
	},
}));

const TenantName = styled("span")(({ theme }) => ({
	fontSize: 10.5,
	color: theme.palette.text.disabled,
	letterSpacing: "0.01em",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
	maxWidth: 160,
}));

const TenantIcon = styled("svg")(({ theme }) => ({
	color: theme.meridian.text.tx4,
	width: 11,
	height: 11,
	transition: "color 200ms",
	flexShrink: 0,
}));

// ─── Component ──────────────────────────────────────────────────

function EyebrowBrand() {
	const tenantNombre = useAppSelector(selectTenantNombre);

	return (
		<BrandContainer>
			{/* Logo + Wordmark — P1/P2 */}
			<BrandMark title="MERIDIAN — Sistema Municipal" aria-label="MERIDIAN">
				<MeridianLogo size="sm" className="ey-logo" />
				<Wordmark className="ey-wordmark">MERIDIAN</Wordmark>
			</BrandMark>

			{/* Status dot — P3 (átomo reutilizado de mf_ui) */}
			<P3Hidden>
				<StatusDot color="success" size="small" pulse label="Sistema operativo" />
			</P3Hidden>

			{/* Reloj — P3 (átomo reutilizado de mf_ui) */}
			<P3Hidden>
				<ClockDisplay format="12h" />
			</P3Hidden>

			{/* Tenant — P3 */}
			{tenantNombre && (
				<>
					<TenantSep aria-hidden="true">&middot;</TenantSep>
					<TenantContainer title="Organización activa">
						<TenantIcon viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<Box
								component="path"
								d="M3 21V7l9-4 9 4v14H3z"
								sx={{
									stroke: "currentColor",
									strokeWidth: 1.5,
									strokeLinejoin: "round",
									fill: "none",
								}}
							/>
							<Box
								component="path"
								d="M9 21v-6h6v6"
								sx={{
									stroke: "currentColor",
									strokeWidth: 1.5,
									strokeLinecap: "round",
									strokeLinejoin: "round",
									fill: "none",
								}}
							/>
						</TenantIcon>
						<TenantName>{tenantNombre}</TenantName>
					</TenantContainer>
				</>
			)}
		</BrandContainer>
	);
}

export default EyebrowBrand;
