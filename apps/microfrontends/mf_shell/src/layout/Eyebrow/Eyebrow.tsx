/**
 * Eyebrow — Barra superior MERIDIAN (reemplaza AppBar)
 *
 * Layout: fixed top, 28px desktop / 44px mobile
 * Grid: 1fr auto 1fr (left, center, right)
 * Glassmorphism: semi-transparent + backdrop-filter blur
 * Z-index: 800 (zIndexLayout.eyebrow)
 */

import { alpha, styled } from "@mui/material/styles";
import EyebrowActions from "./EyebrowActions";
import EyebrowBrand from "./EyebrowBrand";
import EyebrowContext from "./EyebrowContext";

// ─── Types ──────────────────────────────────────────────────────

interface EyebrowProps {
	/** Callback cuando se hace click en el nombre del módulo (abre NavPanel) */
	onModuleClick?: () => void;
	/** Callback cuando se hace click en notificaciones */
	onNotificationClick?: () => void;
	/** Callback cuando se hace click en el badge de chat */
	onChatClick?: () => void;
	/** Callback cuando se hace click en el avatar */
	onAvatarClick?: () => void;
	/** Cantidad de notificaciones no leídas */
	notificationCount?: number;
	/** Cantidad de mensajes de chat sin leer */
	chatUnreadCount?: number;
}

// ─── Constants ──────────────────────────────────────────────────

const EYEBROW_HEIGHT = 28;
const EYEBROW_HEIGHT_MOBILE = 44;

// ─── Styled Components ──────────────────────────────────────────

const EyebrowRoot = styled("header")(({ theme }) => {
	const isDark = theme.palette.mode === "dark";

	return {
		position: "fixed",
		top: 0,
		left: 0,
		right: 0,
		height: EYEBROW_HEIGHT,
		background: alpha(theme.meridian.surfaces.ground, isDark ? 0.92 : 0.94),
		backdropFilter: "blur(16px)",
		WebkitBackdropFilter: "blur(16px)",
		borderBottom: `1px solid ${theme.meridian.borders.muted}`,
		display: "grid",
		gridTemplateColumns: "1fr auto 1fr",
		alignItems: "center",
		padding: "0 16px",
		zIndex: theme.meridian.zIndex.eyebrow,
		userSelect: "none",
		transition: `height ${theme.meridian.durations.normal} ${theme.meridian.easings.out}, opacity ${theme.meridian.durations.normal} ${theme.meridian.easings.out}`,

		// Mobile: 44px height, touch-friendly
		[theme.breakpoints.down("md")]: {
			height: EYEBROW_HEIGHT_MOBILE,
			padding: "0 12px",
		},
	};
});

// ─── Component ──────────────────────────────────────────────────

function Eyebrow({
	onModuleClick,
	onNotificationClick,
	onChatClick,
	onAvatarClick,
	notificationCount = 0,
	chatUnreadCount = 0,
}: EyebrowProps) {
	return (
		<EyebrowRoot role="banner">
			<EyebrowBrand />
			<EyebrowContext onModuleClick={onModuleClick} />
			<EyebrowActions
				notificationCount={notificationCount}
				chatUnreadCount={chatUnreadCount}
				onNotificationClick={onNotificationClick}
				onChatClick={onChatClick}
				onAvatarClick={onAvatarClick}
			/>
		</EyebrowRoot>
	);
}

export { EYEBROW_HEIGHT, EYEBROW_HEIGHT_MOBILE };
export default Eyebrow;
