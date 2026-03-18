/**
 * ClockDisplay - Átomo
 *
 * Reloj en tiempo real con tipografía monospace.
 * Reutilizable en Eyebrow, StatusBar, dashboards, etc.
 */

import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

type ClockFormat = "12h" | "24h";

interface ClockDisplayProps {
	/** Formato de hora */
	format?: ClockFormat;
	/** Mostrar segundos */
	showSeconds?: boolean;
	/** Intervalo de actualización en ms (default: 30000) */
	updateInterval?: number;
	/** Clase CSS adicional */
	className?: string;
}

// ============================================================================
// STYLED COMPONENT
// ============================================================================

const TimeText = styled("span")(({ theme }) => ({
	fontFamily: theme.typography.mono.fontFamily,
	fontSize: 11,
	letterSpacing: "0.02em",
	flexShrink: 0,
	color: "inherit",
}));

// ============================================================================
// HELPERS
// ============================================================================

function formatTime(
	date: Date,
	format: ClockFormat,
	showSeconds: boolean,
): string {
	return date.toLocaleTimeString("es-CL", {
		hour: "2-digit",
		minute: "2-digit",
		...(showSeconds && { second: "2-digit" }),
		hour12: format === "12h",
	});
}

// ============================================================================
// COMPONENT
// ============================================================================

function ClockDisplay({
	format = "12h",
	showSeconds = false,
	updateInterval = 30_000,
	className,
}: ClockDisplayProps) {
	const [time, setTime] = useState(() =>
		formatTime(new Date(), format, showSeconds),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setTime(formatTime(new Date(), format, showSeconds));
		}, updateInterval);
		return () => clearInterval(interval);
	}, [format, showSeconds, updateInterval]);

	return (
		<TimeText className={className} aria-live="off" aria-label="Hora actual">
			{time}
		</TimeText>
	);
}

export { ClockDisplay };
export type { ClockDisplayProps };
export default ClockDisplay;
