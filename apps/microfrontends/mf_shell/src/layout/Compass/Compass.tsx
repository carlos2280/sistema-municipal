/**
 * Compass — FAB Dock de navegación MERIDIAN (reemplaza sidebar)
 *
 * FAB circular 48px bottom-right → expande dock vertical con sistemas del usuario.
 * Los sistemas vienen de `useMisSistemasQuery()` (identidad.sistemas).
 * Íconos Lucide dinámicos desde la BD.
 * Animación spring stagger bottom→top, magnificación tipo macOS.
 * Z-index: 900 (zIndexLayout.compass)
 */

import { alpha, styled } from "@mui/material/styles";
import { Compass as CompassIcon, LayoutGrid, X } from "lucide-react";
import * as icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import CompassItem from "./CompassItem";
import useCompass from "./useCompass";

// ─── Types ──────────────────────────────────────────────────────

interface CompassProps {
	/** Ocultar el compass (cuando NavPanel o CommandPalette están abiertos) */
	hidden?: boolean;
	/** Total de mensajes de chat sin leer (para dot en CompassItem del chat) */
	chatUnreadCount?: number;
}

// ─── Styled Components ──────────────────────────────────────────

const CompassContainer = styled("div", {
	shouldForwardProp: (prop) => prop !== "hidden",
})<{ hidden?: boolean }>(({ theme, hidden }) => ({
	position: "fixed",
	bottom: 24,
	right: 24,
	zIndex: theme.meridian.zIndex.compass,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",

	// Auto-hide
	...(hidden && {
		opacity: 0,
		pointerEvents: "none",
		transform: "translateY(16px) scale(0.85)",
		transition: "opacity 200ms ease, transform 200ms ease",
	}),

	// Mobile
	[theme.breakpoints.down("sm")]: {
		bottom: 16,
		right: 16,
	},
}));

const Backdrop = styled("div", {
	shouldForwardProp: (prop) => prop !== "visible",
})<{ visible: boolean }>(({ theme, visible }) => {
	const isDark = theme.palette.mode === "dark";
	return {
		position: "fixed",
		inset: 0,
		zIndex: theme.meridian.zIndex.compass - 2,
		background: isDark
			? alpha(theme.meridian.surfaces.void, 0.3)
			: alpha(theme.palette.common.white, 0.45),
		backdropFilter: "blur(6px)",
		WebkitBackdropFilter: "blur(6px)",
		opacity: visible ? 1 : 0,
		pointerEvents: visible ? "all" : "none",
		transition: "opacity 280ms ease",
	};
});

const Ring = styled("div", {
	shouldForwardProp: (prop) => prop !== "isOpen" && prop !== "itemCount",
})<{ isOpen: boolean; itemCount: number }>(({ theme, isOpen, itemCount }) => {
	// Generar stagger delays dinámicamente (bottom → top)
	const staggerStyles = isOpen
		? Array.from({ length: itemCount }, (_, i) => {
				const delay = Math.round(
					((itemCount - 1 - i) / Math.max(itemCount - 1, 1)) * 125,
				);
				return {
					[`& > button:nth-of-type(${i + 1})`]: {
						opacity: 1,
						transform: "scale(1) translateY(0)",
						transitionDelay: `${delay}ms`,
					},
				};
			}).reduce((acc: Record<string, unknown>, style) => {
				Object.assign(acc, style);
				return acc;
			}, {})
		: {};

	return {
		display: "flex",
		flexDirection: "column",
		gap: 10,
		position: "absolute",
		bottom: 58,
		right: 0,
		alignItems: "center",
		pointerEvents: isOpen ? "all" : "none",

		// Stagger dinámico
		...staggerStyles,

		// Estado cerrado: items colapsados
		...(!isOpen && {
			"& > button": {
				opacity: 0,
				transform: "scale(0.3) translateY(40px)",
				pointerEvents: "none",
				transitionDelay: "0ms",
			},
		}),

		// ── Magnification CSS (tipo macOS Dock) ──────────────────
		...(isOpen && {
			"& > button:hover": {
				transform: "scale(1.32)",
				zIndex: 3,
			},
			"& > button:hover + button": {
				transform: "scale(1.12)",
				zIndex: 2,
			},
			"& > button:has(+ button:hover)": {
				transform: "scale(1.12)",
				zIndex: 2,
			},
			"& > button:hover + button + button": {
				transform: "scale(1.04)",
			},
			"& > button:has(+ button + button:hover)": {
				transform: "scale(1.04)",
			},
		}),

		// Mobile
		[theme.breakpoints.down("sm")]: {
			gap: 8,
			bottom: 52,
		},
	};
});

const FabButton = styled("button", {
	shouldForwardProp: (prop) => prop !== "isOpen",
})<{ isOpen: boolean }>(({ theme, isOpen }) => ({
	// Reset
	border: `1px solid ${theme.meridian.borders.strong}`,
	padding: 0,
	font: "inherit",

	width: 48,
	height: 48,
	borderRadius: "50%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	cursor: "pointer",
	position: "relative",
	zIndex: 2,
	transition: `all 250ms ${theme.meridian.easings.spring}`,

	// Estado normal
	...(!isOpen && {
		background: theme.meridian.surfaces.s2,
		color: theme.palette.text.primary,
		boxShadow: [
			theme.meridian.shadows.md,
			`0 0 0 1px ${alpha(theme.palette.common.white, 0.04)}`,
		].join(", "),

		"&:hover": {
			transform: "scale(1.08)",
			boxShadow: [
				theme.meridian.shadows.lg,
				`0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`,
			].join(", "),
		},
	}),

	// Estado abierto
	...(isOpen && {
		background: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		transform: "rotate(45deg) scale(1.08)",
		boxShadow: [
			`0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}`,
			theme.meridian.shadows.lg,
		].join(", "),
	}),

	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: 3,
	},

	// Mobile: mantener 48px (spec: Compass 48px en todos los tamaños)
	[theme.breakpoints.down("sm")]: {
		// Touch target ya es 48px, no reducir
	},
}));

// ─── Safe Lucide Icon Lookup ────────────────────────────────────

function toPascalCase(str: string): string {
	return str
		.split("-")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join("");
}

function FabIcon({
	icon,
	isHome,
	isOpen,
}: {
	icon: string | null;
	isHome: boolean;
	isOpen: boolean;
}) {
	if (isOpen) return <X size={16} strokeWidth={2.5} />;
	if (isHome) return <CompassIcon size={20} strokeWidth={1.5} />;
	if (icon) {
		const pascalName = icon.includes("-")
			? toPascalCase(icon)
			: icon.charAt(0).toUpperCase() + icon.slice(1);
		const IconComp = (
			icons as unknown as Record<string, React.ComponentType<LucideProps>>
		)[pascalName];
		if (IconComp) return <IconComp size={20} strokeWidth={1.5} />;
	}
	return <LayoutGrid size={20} strokeWidth={1.5} />;
}

// ─── Component ──────────────────────────────────────────────────

function Compass({ hidden = false, chatUnreadCount = 0 }: CompassProps) {
	const { isOpen, toggle, close, goSistema, sistemaIdActual, sistemas } =
		useCompass();

	// Encontrar el sistema activo para el ícono del FAB
	const sistemaActivo = sistemas.find((s) => s.id === sistemaIdActual);

	return (
		<>
			<Backdrop visible={isOpen} onClick={close} />

			<CompassContainer hidden={hidden}>
				<Ring isOpen={isOpen} itemCount={sistemas.length}>
					{sistemas.map((sis, i) => (
						<CompassItem
							key={sis.id}
							icon={sis.icono}
							label={sis.nombre}
							shortcut={`Alt+${i + 1}`}
							isActive={
								sis.id === sistemaIdActual || (sis.isHome && !sistemaIdActual)
							}
							hasUnread={sis.icono === "message-square" && chatUnreadCount > 0}
							onClick={() => goSistema(sis.id)}
						/>
					))}
				</Ring>

				<FabButton
					isOpen={isOpen}
					onClick={toggle}
					title="Navegar sistemas"
					aria-label={isOpen ? "Cerrar navegación" : "Navegar sistemas"}
					aria-expanded={isOpen}
					type="button"
				>
					<FabIcon
						icon={sistemaActivo?.icono ?? null}
						isHome={sistemaActivo?.isHome ?? true}
						isOpen={isOpen}
					/>
				</FabButton>
			</CompassContainer>
		</>
	);
}

export default Compass;
