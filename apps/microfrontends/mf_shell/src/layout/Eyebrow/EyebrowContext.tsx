/**
 * EyebrowContext — Zona central del Eyebrow
 *
 * Contiene: Nombre del módulo activo (clickable) + breadcrumb sección
 * Priority+: P1 (módulo), P4 (sección)
 */

import { alpha, styled } from "@mui/material/styles";
import { useTheme as useMeridianTheme } from "mf_ui/theme";
import { MODULE_ACCENTS } from "mf_ui/theme";
import { useLocation } from "react-router-dom";
import { useMenu } from "../../hooks/useMenu";

// ─── Types ──────────────────────────────────────────────────────

interface EyebrowContextProps {
	onModuleClick?: () => void;
}

// ─── Styled Components ──────────────────────────────────────────

const CenterContainer = styled("div")({
	display: "flex",
	alignItems: "center",
	gap: 6,
	fontSize: 11.5,
	justifyContent: "center",
	transition: "opacity 300ms",
	minWidth: 0,
	padding: "0 8px",
});

const ModuleName = styled("button")(({ theme }) => ({
	// Reset button styles
	border: "none",
	background: "none",
	font: "inherit",

	color: theme.palette.text.primary,
	fontWeight: 500,
	fontSize: 11.5,
	letterSpacing: "0.01em",
	cursor: "pointer",
	transition: "color 200ms, background 200ms",
	display: "inline-flex",
	alignItems: "center",
	gap: 3,
	padding: "2px 6px 2px 7px",
	borderRadius: 4,
	margin: "-2px -6px -2px -7px", // expanded click target
	flexShrink: 0,
	whiteSpace: "nowrap",
	fontFamily: theme.typography.fontFamily,

	"&::after": {
		content: '"\\25BE"', // ▾ down triangle
		fontSize: 9,
		color: theme.meridian.text.tx4,
		transition: "color 200ms, transform 150ms",
		lineHeight: 1,
		marginTop: 1,
	},

	"&:hover": {
		color: theme.palette.primary.main,
		background: alpha(theme.palette.primary.main, 0.09),
	},

	"&:hover::after": {
		color: theme.palette.primary.main,
		transform: "translateY(1px)",
	},

	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: 2,
	},
}));

const Separator = styled("span")(({ theme }) => ({
	color: theme.meridian.text.tx4,
	flexShrink: 0,
	// P4: oculto en tablet y mobile
	[theme.breakpoints.down("lg")]: {
		display: "none",
	},
}));

const SectionName = styled("span")(({ theme }) => ({
	color: theme.palette.text.disabled,
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
	// P4: oculto en tablet y mobile
	[theme.breakpoints.down("lg")]: {
		display: "none",
	},
}));

// ─── Helpers ────────────────────────────────────────────────────

function getSectionFromPath(pathname: string): string | null {
	// Extraer la última parte del path como nombre de sección legible
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 0) return "Inicio";
	const last = segments[segments.length - 1];
	// Convertir kebab-case a Title Case
	return last
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

// ─── Component ──────────────────────────────────────────────────

function EyebrowContext({ onModuleClick }: EyebrowContextProps) {
	const { activeModule } = useMeridianTheme();
	const { nombreSistema } = useMenu();
	const location = useLocation();

	const moduleName =
		nombreSistema || MODULE_ACCENTS[activeModule]?.name || "Inicio";
	const section = getSectionFromPath(location.pathname);

	return (
		<CenterContainer>
			<ModuleName
				onClick={onModuleClick}
				aria-haspopup="true"
				aria-label="Abrir navegación de módulos"
				type="button"
			>
				{moduleName}
			</ModuleName>

			{section && section !== moduleName && (
				<>
					<Separator aria-hidden="true">&middot;</Separator>
					<SectionName>{section}</SectionName>
				</>
			)}
		</CenterContainer>
	);
}

export default EyebrowContext;
