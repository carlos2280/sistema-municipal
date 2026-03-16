/**
 * BrandingPanel — Left panel MERIDIAN
 *
 * Void background con orbs ambientales, grain texture,
 * identidad municipal, quote, módulos disponibles y reloj.
 */

import { Box, Typography, alpha, keyframes, styled, useTheme } from "@mui/material";
import { memo, useEffect, useState } from "react";
import {
	selectTenantNombre,
	useAppSelector,
} from "mf_store/store";

// ── Animations ──────────────────────────────────────────────────────────────

const orbPulse = keyframes`
  0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.0); }
  50%      { opacity: 1;   transform: translate(-50%, -50%) scale(1.06); }
`;

const orbPulse2 = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(1.0); }
  50%      { opacity: 1;   transform: scale(1.08); }
`;

const dotPulse = keyframes`
  0%, 100% { opacity: 0.7; }
  50%      { opacity: 1; }
`;

// ── Styled Components ───────────────────────────────────────────────────────

const Panel = styled(Box)(({ theme }) => {
	const m = theme.meridian;
	const accent = theme.palette.primary.main;
	const accentRgb = m.moduleAccent.rgb;

	return {
		position: "relative",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		padding: "40px 48px",
		background: m.surfaces.void,
		overflow: "hidden",

		// Orb ambiental principal
		"&::before": {
			content: '""',
			position: "absolute",
			top: "40%",
			left: "50%",
			width: 600,
			height: 600,
			transform: "translate(-50%, -50%)",
			borderRadius: "50%",
			background: `radial-gradient(circle, rgba(${accentRgb}, 0.11) 0%, rgba(${accentRgb}, 0.04) 40%, transparent 70%)`,
			pointerEvents: "none",
			animation: `${orbPulse} 7s ease-in-out infinite`,
		},

		// Segundo orb desplazado
		"&::after": {
			content: '""',
			position: "absolute",
			bottom: "20%",
			right: "10%",
			width: 280,
			height: 280,
			borderRadius: "50%",
			background: `radial-gradient(circle, ${alpha(accent, 0.06)} 0%, transparent 65%)`,
			pointerEvents: "none",
			animation: `${orbPulse2} 11s ease-in-out 2s infinite`,
		},

		// Tablet landscape
		[theme.breakpoints.down("lg")]: {
			padding: "32px 32px",
		},

		// Tablet portrait → top strip
		[theme.breakpoints.down("md")]: {
			padding: "20px 24px",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			borderBottom: `1px solid ${m.borders.muted}`,
			minHeight: "auto",
			"&::before, &::after": { display: "none" },
		},

		"@media (prefers-reduced-motion: reduce)": {
			"&::before, &::after": { animation: "none" },
		},
	};
});

const GrainOverlay = styled(Box)(({ theme }) => ({
	position: "absolute",
	inset: 0,
	pointerEvents: "none",
	backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E")`,
	backgroundSize: 256,

	[theme.breakpoints.down("md")]: { display: "none" },
}));

const EdgeLine = styled(Box)(({ theme }) => {
	const accentRgb = theme.meridian.moduleAccent.rgb;

	return {
		position: "absolute",
		right: 0,
		top: 0,
		bottom: 0,
		width: 1,
		background: `linear-gradient(180deg, transparent 0%, rgba(${accentRgb}, 0.12) 30%, rgba(${accentRgb}, 0.18) 55%, rgba(${accentRgb}, 0.10) 75%, transparent 100%)`,

		[theme.breakpoints.down("md")]: { display: "none" },
	};
});

// ── Top section: Logo + Wordmark ────────────────────────────────────────────

const BrandTop = styled(Box)(({ theme }) => ({
	position: "relative",
	zIndex: 1,
	display: "flex",
	alignItems: "center",
	gap: 10,

	[theme.breakpoints.down("md")]: {
		flexDirection: "column",
		alignItems: "flex-start",
		gap: 2,
	},
	[theme.breakpoints.down("sm")]: {
		flexDirection: "row",
	},
}));

const Wordmark = styled(Typography)(({ theme }) => ({
	fontFamily: theme.meridian ? theme.typography.fontFamily : "monospace",
	fontSize: 11,
	letterSpacing: "0.22em",
	textTransform: "uppercase" as const,
	fontWeight: 500,
	color: theme.palette.text.disabled,
}));

const CcAttribution = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 6,
	marginLeft: 4,

	[theme.breakpoints.down("md")]: { display: "none" },
}));

const CcSeparator = styled(Box)(({ theme }) => ({
	width: 1,
	height: 11,
	background: theme.meridian.borders.strong,
	opacity: 0.3,
	flexShrink: 0,
	margin: "0 3px",
}));

const CcName = styled(Typography)(() => ({
	fontSize: 9,
	letterSpacing: "0.13em",
	textTransform: "uppercase" as const,
	fontWeight: 500,
}));

// ── Mid section: Identity + Quote + Modules ─────────────────────────────────

const BrandMid = styled(Box)(({ theme }) => ({
	position: "relative",
	zIndex: 1,
	display: "flex",
	flexDirection: "column",
	gap: 32,

	[theme.breakpoints.down("lg")]: { gap: 20 },
	[theme.breakpoints.down("md")]: { display: "none" },
}));

const MuniLabel = styled(Typography)(({ theme }) => ({
	fontSize: 10,
	letterSpacing: "0.14em",
	textTransform: "uppercase" as const,
	fontWeight: 600,
	color: theme.meridian.text.tx4,
	marginBottom: 8,
}));

const MuniName = styled(Typography)(({ theme }) => ({
	fontFamily: theme.typography.h1?.fontFamily,
	fontSize: "clamp(22px, 2.8vw, 34px)",
	fontWeight: 700,
	lineHeight: 1.15,
	letterSpacing: "-0.025em",
	color: theme.palette.text.primary,

	[theme.breakpoints.down("lg")]: {
		fontSize: "clamp(18px, 3vw, 26px)",
	},
}));

const MuniSub = styled(Typography)(({ theme }) => ({
	fontSize: 13,
	color: theme.palette.text.secondary,
	marginTop: 6,
	lineHeight: 1.5,
}));

const QuoteBlock = styled(Box)(({ theme }) => ({
	borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
	paddingLeft: 16,
}));

const QuoteText = styled(Typography)(({ theme }) => ({
	fontFamily: theme.typography.h1?.fontFamily,
	fontSize: 15,
	fontWeight: 400,
	lineHeight: 1.55,
	color: theme.palette.text.secondary,
	fontStyle: "italic",
}));

const QuoteAuthor = styled(Typography)(({ theme }) => ({
	fontSize: 11,
	color: theme.meridian.text.tx4,
	marginTop: 6,
	letterSpacing: "0.04em",
}));

const ModulesLabel = styled(Typography)(({ theme }) => ({
	fontSize: 10,
	letterSpacing: "0.12em",
	textTransform: "uppercase" as const,
	color: theme.meridian.text.tx4,
	fontWeight: 600,
}));

const ModuleChip = styled(Box)(({ theme }) => {
	const accentRgb = theme.meridian.moduleAccent.rgb;

	return {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		padding: "5px 10px",
		background: alpha(theme.palette.common.white, 0.03),
		border: `1px solid ${theme.meridian.borders.muted}`,
		borderRadius: 100,
		fontSize: 11,
		color: theme.palette.text.disabled,
		transition: "all 200ms",

		"&:hover": {
			borderColor: `rgba(${accentRgb}, 0.3)`,
			color: theme.palette.primary.main,
		},
	};
});

// ── Bottom section: Clock ───────────────────────────────────────────────────

const BrandBot = styled(Box)(({ theme }) => ({
	position: "relative",
	zIndex: 1,
	display: "flex",
	flexDirection: "column",
	gap: 4,

	[theme.breakpoints.down("md")]: { display: "none" },
}));

const ClockText = styled(Typography)(({ theme }) => ({
	fontFamily: theme.typography.number?.fontFamily,
	fontSize: 40,
	fontWeight: 400,
	letterSpacing: "-0.03em",
	color: theme.palette.text.primary,
	fontFeatureSettings: "'tnum' 1",
	lineHeight: 1,
	opacity: 0.9,

	[theme.breakpoints.down("lg")]: { fontSize: 32 },
	"@media (min-width: 1440px)": { fontSize: 52 },
}));

const DateText = styled(Typography)(({ theme }) => ({
	fontSize: 12,
	color: theme.palette.text.disabled,
	letterSpacing: "0.02em",
}));

const StatusRow = styled(Box)(() => ({
	display: "flex",
	alignItems: "center",
	gap: 6,
	marginTop: 8,
}));

const StatusDot = styled(Box)(({ theme }) => ({
	width: 6,
	height: 6,
	borderRadius: "50%",
	background: theme.palette.success.main,
	boxShadow: `0 0 6px ${alpha(theme.palette.success.main, 0.5)}`,
	animation: `${dotPulse} 3s ease-in-out infinite`,

	"@media (prefers-reduced-motion: reduce)": { animation: "none" },
}));

const StatusText = styled(Typography)(({ theme }) => ({
	fontSize: 11,
	color: theme.palette.text.disabled,
}));

// ── MeridianLogo SVG ────────────────────────────────────────────────────────

function MeridianLogo({ size = 22 }: { readonly size?: number }) {
	const theme = useTheme();
	const accent = theme.palette.primary.main;

	return (
		<svg
			viewBox="0 0 16 16"
			width={size}
			height={size}
			fill="none"
			aria-hidden="true"
			style={{ color: accent, display: "block", flexShrink: 0 }}
		>
			<circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth=".9" opacity=".3" />
			<ellipse cx="8" cy="8" rx="2.8" ry="6.2" stroke="currentColor" strokeWidth="1.5" />
			<line x1="1.8" y1="8" x2="14.2" y2="8" stroke="currentColor" strokeWidth=".9" opacity=".3" />
			<circle cx="8" cy="8" r="1.4" fill="currentColor" />
		</svg>
	);
}

// ── Clock hook ──────────────────────────────────────────────────────────────

function useClock() {
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const time = now.toLocaleTimeString("es-CL", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	const date = now.toLocaleDateString("es-CL", {
		weekday: "long",
		day: "numeric",
		month: "long",
	});

	return { time, date };
}

// ── C&C Logo SVG ────────────────────────────────────────────────────────────

function CcLogo() {
	return (
		<svg
			viewBox="0 0 48 48"
			width={14}
			height={14}
			fill="none"
			aria-hidden="true"
			style={{ flexShrink: 0, opacity: 0.7 }}
		>
			<polygon
				points="24,3 40.5,12.5 40.5,35.5 24,45 7.5,35.5 7.5,12.5"
				fill="#1A2840"
				stroke="rgba(0,188,212,0.4)"
				strokeWidth="1.2"
			/>
			<path
				d="M23,17 C17,17 14,20 14,24 C14,28 17,31 23,31"
				fill="none"
				stroke="#00bcd4"
				strokeWidth="2.2"
				strokeLinecap="round"
			/>
			<path
				d="M25,17 C31,17 34,20 34,24 C34,28 31,31 25,31"
				fill="none"
				stroke="#eef2f8"
				strokeWidth="2.2"
				strokeLinecap="round"
			/>
			<circle cx="24" cy="24" r="1.8" fill="#00bcd4" />
			<circle cx="24" cy="24" r="0.8" fill="#eef2f8" />
		</svg>
	);
}

// ── Módulos estáticos (pre-login, no hay sesión activa) ─────────────────────

const AVAILABLE_MODULES = [
	"Contabilidad",
	"Remuneraciones",
	"Tesorería",
	"Configuración",
] as const;

// ── Component ───────────────────────────────────────────────────────────────

export const BrandingPanel = memo(function BrandingPanel() {
	const theme = useTheme();
	const tenantNombre = useAppSelector(selectTenantNombre);
	const { time, date } = useClock();

	return (
		<Panel>
			<GrainOverlay />
			<EdgeLine />

			{/* Top: Logo + Wordmark + C&C */}
			<BrandTop>
				<MeridianLogo />
				<Wordmark sx={{ fontFamily: theme.typography.number?.fontFamily }}>
					MERIDIAN
				</Wordmark>
				<CcAttribution>
					<CcSeparator />
					<CcLogo />
					<CcName sx={{ color: theme.meridian.text.tx4, fontFamily: theme.typography.number?.fontFamily }}>
						C&amp;C Systems
					</CcName>
				</CcAttribution>
			</BrandTop>

			{/* Mid: Identity + Quote + Modules */}
			<BrandMid>
				<Box>
					<MuniLabel>Municipalidad</MuniLabel>
					<MuniName>
						{tenantNombre || "Sistema Integrado"}
						<br />
						de Gestión
					</MuniName>
					<MuniSub>
						Plataforma unificada para la gestión
						<br />
						de servicios municipales
					</MuniSub>
				</Box>

				<QuoteBlock>
					<QuoteText>
						&ldquo;La interfaz debe desaparecer.
						<br />
						Solo debe quedar el trabajo
						<br />
						y la persona que lo hace.&rdquo;
					</QuoteText>
					<QuoteAuthor>— MERIDIAN Design Manifesto</QuoteAuthor>
				</QuoteBlock>

				<Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
					<ModulesLabel>Sistemas disponibles</ModulesLabel>
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
						{AVAILABLE_MODULES.map((mod) => (
							<ModuleChip key={mod}>Sistema {mod}</ModuleChip>
						))}
					</Box>
				</Box>
			</BrandMid>

			{/* Bottom: Clock + Status */}
			<BrandBot>
				<ClockText>{time}</ClockText>
				<DateText>{date}</DateText>
				<StatusRow>
					<StatusDot />
					<StatusText>Sistema operativo · MERIDIAN v1.0</StatusText>
				</StatusRow>
			</BrandBot>
		</Panel>
	);
});
