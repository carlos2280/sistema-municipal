/**
 * MeridianLogo - Átomo
 *
 * Logo SVG del sistema MERIDIAN (globo con meridiano).
 * Reutilizable en Eyebrow, login, about, splash screens, etc.
 */

import { styled } from "@mui/material/styles";

// ============================================================================
// TYPES
// ============================================================================

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface MeridianLogoProps {
	/** Tamaño del logo */
	size?: LogoSize;
	/** Color del logo — por defecto hereda del accent activo via CSS var */
	color?: string;
	/** Clase CSS adicional */
	className?: string;
}

// ============================================================================
// SIZE CONFIG
// ============================================================================

const sizeMap: Record<LogoSize, number> = {
	xs: 12,
	sm: 14,
	md: 20,
	lg: 28,
	xl: 40,
};

// ============================================================================
// STYLED COMPONENT
// ============================================================================

const LogoSvg = styled("svg")(({ theme }) => ({
	display: "block",
	flexShrink: 0,
	color: theme.palette.primary.main,
	transition: "color 400ms ease, filter 200ms ease",
}));

// ============================================================================
// COMPONENT
// ============================================================================

function MeridianLogo({ size = "sm", color, className }: MeridianLogoProps) {
	const dimension = sizeMap[size];

	return (
		<LogoSvg
			className={className}
			viewBox="0 0 16 16"
			width={dimension}
			height={dimension}
			fill="none"
			aria-hidden="true"
			sx={color ? { color } : undefined}
		>
			{/* Órbita exterior */}
			<circle
				cx="8"
				cy="8"
				r="6.2"
				stroke="currentColor"
				strokeWidth="1"
				opacity="0.35"
			/>
			{/* Línea meridiano (vertical) */}
			<ellipse
				cx="8"
				cy="8"
				rx="2.8"
				ry="6.2"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			{/* Ecuador (horizontal) */}
			<line
				x1="1.8"
				y1="8"
				x2="14.2"
				y2="8"
				stroke="currentColor"
				strokeWidth="1"
				opacity="0.35"
			/>
			{/* Punto central */}
			<circle cx="8" cy="8" r="1.4" fill="currentColor" />
		</LogoSvg>
	);
}

export { MeridianLogo };
export type { MeridianLogoProps };
export default MeridianLogo;
