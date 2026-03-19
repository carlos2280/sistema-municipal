/**
 * LoginStepper — Dynamic step indicator MERIDIAN
 *
 * Steps adapt based on login flow:
 * - Normal: Credenciales → Área y sistema → Verificación
 * - MFA Setup: Credenciales → Área y sistema → Configurar MFA → Códigos
 * - No MFA: Credenciales → Área y sistema (no step 3)
 */

import { Box, alpha, styled } from "@mui/material";
import { Check } from "lucide-react";
import { memo, useMemo } from "react";
import {
	STEPPER_LABELS_BASE,
	STEPPER_LABEL_BACKUP,
	STEPPER_LABEL_MFA,
	STEPPER_LABEL_SETUP,
} from "../constants";
import type { LoginStep } from "../types";

// ── Types ───────────────────────────────────────────────────────────────────

type StepStatus = "pending" | "active" | "completed";

interface LoginStepperProps {
	readonly activeStep: LoginStep;
	readonly mfaSetupPending: boolean;
	/** Whether step 2 is MFA verification (true) or not shown yet (false) */
	readonly showMfaStep: boolean;
}

// ── Styled ──────────────────────────────────────────────────────────────────

const StepperRoot = styled(Box)(() => ({
	display: "flex",
	alignItems: "center",
	gap: 8,
	marginBottom: 32,
}));

const StepGroup = styled(Box)(() => ({
	display: "flex",
	alignItems: "center",
	gap: 8,
}));

const StepNum = styled(Box)<{ ownerState: { status: StepStatus } }>(
	({ theme, ownerState }) => {
		const accent = theme.palette.primary.main;
		const accentRgb = theme.meridian.moduleAccent.rgb;

		return {
			width: 22,
			height: 22,
			borderRadius: "50%",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: 10,
			fontWeight: 700,
			flexShrink: 0,
			transition: "all 300ms",

			...(ownerState.status === "pending" && {
				background: theme.meridian.surfaces.s3,
				border: `1px solid ${theme.palette.divider}`,
				color: theme.palette.text.disabled,
			}),

			...(ownerState.status === "active" && {
				background: accent,
				borderColor: accent,
				color: "#0A0A14",
				boxShadow: `0 0 12px rgba(${accentRgb}, 0.4)`,
			}),

			...(ownerState.status === "completed" && {
				background: alpha(accent, 0.15),
				border: `1px solid ${alpha(accent, 0.3)}`,
				color: accent,
			}),
		};
	},
);

const StepLabel = styled(Box)<{ ownerState: { status: StepStatus } }>(
	({ theme, ownerState }) => ({
		fontSize: 11,
		fontWeight: 500,
		whiteSpace: "nowrap",
		transition: "color 300ms",

		...(ownerState.status === "pending" && {
			color: theme.palette.text.disabled,
		}),
		...(ownerState.status === "active" && {
			color: theme.palette.text.primary,
		}),
		...(ownerState.status === "completed" && {
			color: theme.palette.primary.main,
		}),

		[theme.breakpoints.down("sm")]: { display: "none" },
	}),
);

const Connector = styled(Box)(({ theme }) => ({
	flex: 1,
	height: 1,
	background: `linear-gradient(90deg, ${theme.palette.divider} 0%, ${theme.meridian.borders.muted} 100%)`,
	minWidth: 12,
}));

// ── Component ───────────────────────────────────────────────────────────────

export const LoginStepper = memo(function LoginStepper({
	activeStep,
	mfaSetupPending,
	showMfaStep,
}: LoginStepperProps) {
	const labels = useMemo(() => {
		const base: string[] = [...STEPPER_LABELS_BASE];

		if (mfaSetupPending) {
			// MFA setup inline flow: base + "Configurar MFA" + "Códigos"
			base.push(STEPPER_LABEL_SETUP, STEPPER_LABEL_BACKUP);
		} else if (showMfaStep) {
			// Normal MFA verification flow
			base.push(STEPPER_LABEL_MFA);
		}
		// else: no MFA step (disabled/optional without MFA) — just 2 steps

		return base;
	}, [mfaSetupPending, showMfaStep]);

	return (
		<StepperRoot>
			{labels.map((label, idx) => {
				const status: StepStatus =
					idx < activeStep
						? "completed"
						: idx === activeStep
							? "active"
							: "pending";

				return (
					<Box key={label} sx={{ display: "contents" }}>
						{idx > 0 && <Connector />}
						<StepGroup>
							<StepNum ownerState={{ status }}>
								{status === "completed" ? (
									<Check size={12} strokeWidth={3} />
								) : (
									idx + 1
								)}
							</StepNum>
							<StepLabel ownerState={{ status }}>
								{label}
							</StepLabel>
						</StepGroup>
					</Box>
				);
			})}
		</StepperRoot>
	);
});
