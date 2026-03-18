/**
 * Stage — Área de contenido MERIDIAN
 *
 * Ocupa desde el Eyebrow (28px desktop / 44px mobile) hasta el bottom.
 * Sin sidebar — contenido ocupa 100% del ancho.
 * Renderiza <Outlet /> para las rutas de microfrontends.
 * Padding inferior extra para dejar espacio al Compass FAB.
 */

import { alpha, styled } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { EYEBROW_HEIGHT, EYEBROW_HEIGHT_MOBILE } from "../Eyebrow";

// ─── Constants ──────────────────────────────────────────────────

const STAGE_PADDING_TOP = 40;
const STAGE_PADDING_HORIZONTAL = 48;
const STAGE_PADDING_BOTTOM = 80; // espacio para Compass FAB

// ─── Styled Components ──────────────────────────────────────────

const StageRoot = styled("main")(({ theme }) => ({
	position: "fixed",
	top: EYEBROW_HEIGHT,
	left: 0,
	right: 0,
	bottom: 0,
	overflowY: "auto",
	overflowX: "hidden",
	overscrollBehavior: "contain",
	backgroundColor: theme.palette.background.default,
	padding: `${STAGE_PADDING_TOP}px ${STAGE_PADDING_HORIZONTAL}px ${STAGE_PADDING_BOTTOM}px`,

	// Scrollbar MERIDIAN
	"&::-webkit-scrollbar": { width: 6 },
	"&::-webkit-scrollbar-track": { background: "transparent" },
	"&::-webkit-scrollbar-thumb": {
		background: alpha(theme.palette.text.primary, 0.12),
		borderRadius: 3,
		"&:hover": {
			background: alpha(theme.palette.text.primary, 0.25),
		},
	},
	scrollbarWidth: "thin",
	scrollbarColor: `${alpha(theme.palette.text.primary, 0.12)} transparent`,

	// Mobile: ajustar top al eyebrow mobile + padding reducido
	[theme.breakpoints.down("md")]: {
		top: EYEBROW_HEIGHT_MOBILE,
		padding: `24px 16px ${STAGE_PADDING_BOTTOM}px`,
	},
}));

// ─── Component ──────────────────────────────────────────────────

function Stage() {
	return (
		<StageRoot>
			<Outlet />
		</StageRoot>
	);
}

export { STAGE_PADDING_TOP, STAGE_PADDING_HORIZONTAL, STAGE_PADDING_BOTTOM };
export default Stage;
