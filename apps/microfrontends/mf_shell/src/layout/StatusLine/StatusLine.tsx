/**
 * StatusLine — Línea de estado MERIDIAN (reemplaza StatusBar)
 *
 * Línea de 2px en el bottom del viewport con color accent del módulo activo.
 * Z-index: statusLine (700).
 */

import { styled } from "@mui/material/styles";

// ─── Styled Component ───────────────────────────────────────────

const Line = styled("div")(({ theme }) => ({
	position: "fixed",
	bottom: 0,
	left: 0,
	right: 0,
	height: 2,
	background: theme.palette.primary.main,
	zIndex: theme.meridian.zIndex.statusLine,
	transition: `background ${theme.meridian.durations.slow} ${theme.meridian.easings.out}`,
	pointerEvents: "none",
}));

// ─── Component ──────────────────────────────────────────────────

function StatusLine() {
	return <Line role="presentation" />;
}

export default StatusLine;
