/**
 * LoginActions — Botones MERIDIAN
 *
 * Primary button usa accent del tema (no hardcoded).
 * Ghost button para "Volver".
 * Supports dynamic steps (0-3) for MFA setup inline flow.
 */

import { Box, alpha, keyframes, styled } from "@mui/material";
import {
	ArrowLeft,
	ArrowRight,
	Check,
	LogIn,
	QrCode,
	ShieldCheck,
} from "lucide-react";
import { memo, useMemo } from "react";
import type { StepConfig } from "../types";
import type { LoginStep } from "../types";

// ── Spinner (matches prototype .spin) ────────────────────────────────────────

const spin = keyframes`
	to { transform: rotate(360deg); }
`;

const Spinner = styled("span")(({ theme }) => {
	const contrast = theme.palette.primary.contrastText;

	return {
		width: 14,
		height: 14,
		borderRadius: "50%",
		border: `1.5px solid ${alpha(contrast, 0.3)}`,
		borderTopColor: contrast,
		animation: `${spin} 0.65s linear infinite`,
		flexShrink: 0,
	};
});

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
	3: <LogIn size={15} />,
};

// ── Component ───────────────────────────────────────────────────────────────

interface LoginActionsProps {
	readonly activeStep: LoginStep;
	readonly disabled: boolean;
	readonly isSubmitting?: boolean;
	readonly loginSuccess?: boolean;
	readonly config: StepConfig;
	readonly onNext: () => void;
	readonly onBack: () => void;
}

export const LoginActions = memo(function LoginActions({
	activeStep,
	disabled,
	isSubmitting,
	loginSuccess,
	config,
	onNext,
	onBack,
}: LoginActionsProps) {
	const icon = STEP_ICONS[activeStep];

	// Step 1: row layout (ghost compact + primary flex)
	// Step 0: single primary button
	// Step 2/3: single primary button (back link is inline in MfaStep)
	const showBackButton = activeStep === 1 && !loginSuccess && !isSubmitting;

	const buttonContent = useMemo(() => {
		if (loginSuccess) {
			return (
				<>
					<Check size={16} />
					<span>Acceso concedido</span>
				</>
			);
		}
		if (isSubmitting) {
			return (
				<>
					<Spinner />
					<span>Verificando…</span>
				</>
			);
		}
		return (
			<>
				{activeStep > 0 && icon}
				<span>{config.buttonLabel}</span>
				{activeStep === 0 && icon}
			</>
		);
	}, [loginSuccess, isSubmitting, activeStep, icon, config.buttonLabel]);

	const buttonContentRow = useMemo(() => {
		if (loginSuccess) {
			return (
				<>
					<Check size={16} />
					<span>Acceso concedido</span>
				</>
			);
		}
		if (isSubmitting) {
			return (
				<>
					<Spinner />
					<span>Verificando…</span>
				</>
			);
		}
		return (
			<>
				{icon}
				<span>{config.buttonLabel}</span>
			</>
		);
	}, [loginSuccess, isSubmitting, icon, config.buttonLabel]);

	const isDisabled = (disabled && !loginSuccess) || isSubmitting;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2.5 }}>
			{showBackButton ? (
				<Box sx={{ display: "flex", gap: 1 }}>
					<GhostButton
						onClick={onBack}
						type="button"
						style={{
							flex: "0 0 auto",
							padding: "12px 16px",
							width: "auto",
						}}
					>
						<ArrowLeft size={15} />
						Volver
					</GhostButton>
					<PrimaryButton
						onClick={onNext}
						disabled={isDisabled}
						type="button"
						className={loginSuccess ? "success" : undefined}
					>
						{buttonContentRow}
					</PrimaryButton>
				</Box>
			) : (
				<PrimaryButton
					onClick={onNext}
					disabled={isDisabled}
					type="button"
					className={loginSuccess ? "success" : undefined}
				>
					{buttonContent}
				</PrimaryButton>
			)}
		</Box>
	);
});
