/**
 * NavPanel — Panel lateral de navegación MERIDIAN (reemplaza sidebar)
 *
 * Slide-in desde la derecha, 360px ancho.
 * Glassmorphism + backdrop clickable para cerrar.
 * Secciones: Header (user+sistema), Menu (recursivo), Footer (prefs+logout).
 * Z-index: navPanel (960).
 * Animación: translateX(100%) → 0 en 250ms ease-out.
 */

import { alpha, styled } from "@mui/material/styles";
import { useMenu } from "../../hooks/useMenu";
import NavPanelFooter from "./NavPanelFooter";
import NavPanelHeader from "./NavPanelHeader";
import NavPanelMenu from "./NavPanelMenu";

// ─── Types ──────────────────────────────────────────────────────

interface NavPanelProps {
	isOpen: boolean;
	onClose: () => void;
	/** Callback para abrir el Compass (cambiar sistema) */
	onChangeSistema?: () => void;
	/** Callback para abrir el ThemeCustomizer */
	onOpenCustomizer?: () => void;
}

// ─── Constants ──────────────────────────────────────────────────

const PANEL_WIDTH = 360;

// ─── Styled Components ──────────────────────────────────────────

const Backdrop = styled("div", {
	shouldForwardProp: (prop) => prop !== "visible",
})<{ visible: boolean }>(({ theme, visible }) => {
	const isDark = theme.palette.mode === "dark";
	return {
		position: "fixed",
		inset: 0,
		zIndex: theme.meridian.zIndex.navPanel - 1,
		background: isDark
			? alpha(theme.meridian.surfaces.void, 0.4)
			: alpha(theme.palette.common.white, 0.5),
		backdropFilter: "blur(4px)",
		WebkitBackdropFilter: "blur(4px)",
		opacity: visible ? 1 : 0,
		pointerEvents: visible ? "all" : "none",
		transition: `opacity 250ms ${theme.meridian.easings.out}`,
	};
});

const PanelRoot = styled("aside", {
	shouldForwardProp: (prop) => prop !== "isOpen",
})<{ isOpen: boolean }>(({ theme, isOpen }) => {
	const isDark = theme.palette.mode === "dark";
	return {
		position: "fixed",
		top: 0,
		right: 0,
		bottom: 0,
		width: PANEL_WIDTH,
		maxWidth: "100vw",
		zIndex: theme.meridian.zIndex.navPanel,
		background: alpha(theme.meridian.surfaces.s1, isDark ? 0.97 : 0.98),
		backdropFilter: "blur(20px)",
		WebkitBackdropFilter: "blur(20px)",
		borderLeft: `1px solid ${theme.meridian.borders.muted}`,
		boxShadow: isOpen ? theme.meridian.shadows.lg : "none",
		display: "flex",
		flexDirection: "column",
		transform: isOpen ? "translateX(0)" : "translateX(100%)",
		transition: `transform 250ms ${theme.meridian.easings.out}`,
		willChange: "transform",

		// Mobile: full width
		[theme.breakpoints.down("sm")]: {
			width: "100vw",
		},
	};
});

const EmptyState = styled("div")(({ theme }) => ({
	flex: 1,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: 40,
	textAlign: "center",
	color: theme.palette.text.disabled,
	fontSize: 13,
	fontFamily: theme.typography.fontFamily,
}));

// ─── Component ──────────────────────────────────────────────────

function NavPanel({
	isOpen,
	onClose,
	onChangeSistema,
	onOpenCustomizer,
}: NavPanelProps) {
	const { menu, nombreSistema } = useMenu();

	return (
		<>
			<Backdrop visible={isOpen} onClick={onClose} />

			<PanelRoot
				isOpen={isOpen}
				role="dialog"
				aria-label="Panel de navegación"
				aria-modal="true"
				aria-hidden={!isOpen}
			>
				<NavPanelHeader onClose={onClose} onChangeSistema={onChangeSistema} />

				{menu && menu.length > 0 ? (
					<NavPanelMenu
						items={menu}
						nombreSistema={nombreSistema}
						onNavigate={onClose}
					/>
				) : (
					<EmptyState>
						Selecciona un sistema para ver el menú de navegación
					</EmptyState>
				)}

				<NavPanelFooter onClose={onClose} onOpenCustomizer={onOpenCustomizer} />
			</PanelRoot>
		</>
	);
}

export default NavPanel;
