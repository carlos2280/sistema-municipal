/**
 * LoginActions — Botones MERIDIAN
 *
 * Primary button usa accent del tema (no hardcoded).
 * Ghost button para "Volver".
 * Keyboard hint integrado.
 */

import { Box, alpha, styled } from "@mui/material";
import { ArrowLeft, ArrowRight, Check, LogIn, ShieldCheck } from "lucide-react";
import { memo, useMemo } from "react";
import { STEP_CONFIG } from "../constants";
import type { LoginStep } from "../types";

// ── Styled ──────────────────────────────────────────────────────────────────

const PrimaryButton = styled("button")(({ theme }) => {
	const accent = theme.palette.primary.main;
	const accentRgb = theme.meridian.moduleAccent.rgb;

	return {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: 7,
		width: "100%",
		padding: "12px 20px",
		borderRadius: 8,
		fontSize: 13.5,
		fontWeight: 600,
		fontFamily: theme.typography.fontFamily,
		cursor: "pointer",
		border: "none",
		transition: "all 150ms",
		letterSpacing: "0.005em",
		whiteSpace: "nowrap",
		background: accent,
		color: "#08081A",

		"&:not(:disabled):hover": {
			background: alpha(accent, 0.85),
			boxShadow: `0 4px 20px rgba(${accentRgb}, 0.35)`,
			transform: "translateY(-1px)",
		},

		"&:active:not(:disabled)": {
			transform: "scale(0.98)",
		},

		"&:disabled": {
			opacity: 0.4,
			cursor: "not-allowed",
			transform: "none",
		},

		"&:focus-visible": {
			outline: `2px solid ${accent}`,
			outlineOffset: 2,
		},

		"& svg": {
			width: 15,
			height: 15,
			strokeWidth: 2,
			flexShrink: 0,
		},

		"&.success": {
			background: theme.palette.success.main,
			color: "#071810",
			pointerEvents: "none",
			opacity: 1,
		},
	};
});

const GhostButton = styled("button")(({ theme }) => ({
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 7,
	width: "100%",
	padding: "12px 20px",
	borderRadius: 8,
	fontSize: 13.5,
	fontWeight: 600,
	fontFamily: theme.typography.fontFamily,
	cursor: "pointer",
	transition: "all 150ms",
	whiteSpace: "nowrap",
	background: theme.meridian.surfaces.s2,
	color: theme.palette.text.secondary,
	border: `1.5px solid ${theme.palette.divider}`,

	"&:not(:disabled):hover": {
		borderColor: theme.meridian.borders.strong,
		color: theme.palette.text.primary,
		background: theme.meridian.surfaces.s3,
	},

	"& svg": {
		width: 15,
		height: 15,
		strokeWidth: 2,
		flexShrink: 0,
	},
}));

// ── Step → Icon mapping ─────────────────────────────────────────────────────

const STEP_ICONS: Readonly<Record<LoginStep, React.ReactNode>> = {
	0: <ArrowRight size={15} />,
	1: <LogIn size={15} />,
	2: <ShieldCheck size={15} />,
};

// ── Component ───────────────────────────────────────────────────────────────

interface LoginActionsProps {
	readonly activeStep: LoginStep;
	readonly disabled: boolean;
	readonly loginSuccess?: boolean;
	readonly onNext: () => void;
	readonly onBack: () => void;
}

export const LoginActions = memo(function LoginActions({
	activeStep,
	disabled,
	loginSuccess,
	onNext,
	onBack,
}: LoginActionsProps) {
	const config = useMemo(() => STEP_CONFIG[activeStep], [activeStep]);
	const icon = STEP_ICONS[activeStep];

	// Step 1: row layout (ghost compact + primary flex) matching prototype
	// Step 0: single primary button
	// Step 2: single primary button (back link is inline in MfaStep)
	const showBackButton = activeStep === 1 && !loginSuccess;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2.5 }}>
			{showBackButton ? (
				<Box sx={{ display: "flex", gap: 1 }}>
					<GhostButton
						onClick={onBack}
						type="button"
						style={{ flex: "0 0 auto", padding: "12px 16px", width: "auto" }}
					>
						<ArrowLeft size={15} />
						Volver
					</GhostButton>
					<PrimaryButton
						onClick={onNext}
						disabled={disabled && !loginSuccess}
						type="button"
						className={loginSuccess ? "success" : undefined}
					>
						{loginSuccess ? (
							<>
								<Check size={16} />
								<span>Acceso concedido</span>
							</>
						) : (
							<>
								{icon}
								<span>{config.buttonLabel}</span>
							</>
						)}
					</PrimaryButton>
				</Box>
			) : (
				<PrimaryButton
					onClick={onNext}
					disabled={disabled && !loginSuccess}
					type="button"
					className={loginSuccess ? "success" : undefined}
				>
					{loginSuccess ? (
						<>
							<Check size={16} />
							<span>Acceso concedido</span>
						</>
					) : (
						<>
							{activeStep > 0 && icon}
							<span>{config.buttonLabel}</span>
							{activeStep === 0 && icon}
						</>
					)}
				</PrimaryButton>
			)}
		</Box>
	);
});
