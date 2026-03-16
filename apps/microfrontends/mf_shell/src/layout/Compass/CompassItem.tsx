/**
 * CompassItem — Item individual del Compass Dock (molécula del layout)
 *
 * Círculo 44px con ícono Lucide dinámico, tooltip label + kbd shortcut.
 * La magnificación CSS (1.32 / 1.12 / 1.04) se aplica desde el contenedor padre.
 */

import { styled, alpha } from "@mui/material/styles";
import { LayoutGrid } from "lucide-react";
import * as icons from "lucide-react";
import type { LucideProps } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface CompassItemProps {
	/** Nombre del ícono Lucide (desde la BD) */
	icon: string | null;
	/** Nombre visible del módulo */
	label: string;
	/** Atajo de teclado (ej: "Alt+1") */
	shortcut: string;
	/** Si este módulo está activo */
	isActive: boolean;
	/** Handler de click */
	onClick: () => void;
}

// ─── Safe Lucide Icon ───────────────────────────────────────────

/** Convierte kebab-case a PascalCase para lookup en lucide-react */
function toPascalCase(str: string): string {
	return str
		.split("-")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join("");
}

/** Renderiza un ícono Lucide por nombre (kebab-case o PascalCase), con fallback seguro */
function SafeLucideIcon({
	name,
	size = 20,
	strokeWidth = 1.5,
}: {
	name: string | null;
	size?: number;
	strokeWidth?: number;
}) {
	if (!name) return <LayoutGrid size={size} strokeWidth={strokeWidth} />;

	const pascalName = toPascalCase(name);
	const IconComponent = (icons as unknown as Record<string, React.ComponentType<LucideProps>>)[pascalName];

	if (!IconComponent) return <LayoutGrid size={size} strokeWidth={strokeWidth} />;

	return <IconComponent size={size} strokeWidth={strokeWidth} />;
}

// ─── Styled Components ──────────────────────────────────────────

const ItemRoot = styled("button")(({ theme }) => ({
	// Reset
	border: `1px solid ${theme.meridian.borders.default}`,
	padding: 0,
	font: "inherit",

	width: 44,
	height: 44,
	borderRadius: "50%",
	background: theme.meridian.surfaces.s3,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	cursor: "pointer",
	position: "relative",
	flexShrink: 0,
	color: theme.palette.text.secondary,
	boxShadow: theme.meridian.shadows.sm,
	transition: [
		`opacity 180ms ease`,
		`transform 280ms ${theme.meridian.easings.spring}`,
		`background 150ms ease`,
		`border-color 150ms ease`,
		`box-shadow 180ms ease`,
	].join(", "),

	"&:hover": {
		background: theme.meridian.surfaces.s4,
		borderColor: theme.palette.primary.main,
		color: theme.palette.primary.main,
		boxShadow: [
			`0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
			`0 8px 24px ${alpha(theme.palette.common.black, 0.35)}`,
		].join(", "),
	},

	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: 3,
	},

	// Tooltip label — aparece al hover
	"&:hover .compass-label": {
		opacity: 1,
		transform: "translateX(0)",
	},
}));

const ActiveDot = styled("span")(({ theme }) => ({
	position: "absolute",
	bottom: -2,
	right: -2,
	width: 10,
	height: 10,
	borderRadius: "50%",
	background: theme.palette.primary.main,
	border: `2px solid ${theme.meridian.surfaces.s3}`,
}));

const Label = styled("span")(({ theme }) => ({
	position: "absolute",
	right: 56,
	background: theme.meridian.surfaces.s5,
	border: `1px solid ${theme.meridian.borders.strong}`,
	padding: "5px 12px",
	borderRadius: 4,
	fontSize: 12,
	fontWeight: 500,
	color: theme.palette.text.primary,
	letterSpacing: "0.01em",
	whiteSpace: "nowrap",
	pointerEvents: "none",
	fontFamily: theme.typography.fontFamily,
	transition: "opacity 150ms ease, transform 180ms ease",
	opacity: 0,
	transform: "translateX(6px)",
	display: "flex",
	alignItems: "center",
	gap: 8,
}));

const Kbd = styled("kbd")(({ theme }) => ({
	display: "inline-block",
	padding: "1px 5px",
	borderRadius: 3,
	background: theme.meridian.surfaces.s3,
	border: `1px solid ${theme.meridian.borders.default}`,
	fontSize: 10,
	fontFamily: theme.typography.mono.fontFamily,
	color: theme.palette.text.disabled,
	verticalAlign: "middle",
	lineHeight: 1.4,
}));

// ─── Component ──────────────────────────────────────────────────

function CompassItem({
	icon,
	label,
	shortcut,
	isActive,
	onClick,
}: CompassItemProps) {
	return (
		<ItemRoot
			onClick={onClick}
			title={label}
			type="button"
			aria-label={`${label} (${shortcut})`}
			sx={
				isActive
					? (theme) => ({
							borderColor: theme.palette.primary.main,
							boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
							background: theme.meridian.surfaces.s4,
							color: theme.palette.primary.main,
						})
					: undefined
			}
		>
			{/* Ícono Lucide dinámico desde la BD, fallback genérico */}
			<SafeLucideIcon name={icon} size={20} strokeWidth={1.5} />

			{/* Active module indicator dot */}
			{isActive && <ActiveDot />}

			{/* Tooltip label con kbd shortcut */}
			<Label className="compass-label">
				{label}
				<Kbd>{shortcut}</Kbd>
			</Label>
		</ItemRoot>
	);
}

export default CompassItem;
