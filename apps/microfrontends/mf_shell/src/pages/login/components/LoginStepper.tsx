/**
 * LoginStepper — 3-step indicator MERIDIAN
 *
 * Numbered circles + labels + connectors.
 * Active step uses accent from theme. Completed steps use accent with opacity.
 */

import { Box, alpha, styled } from "@mui/material";
import { Check } from "lucide-react";
import { memo } from "react";
import { STEPPER_LABELS } from "../constants";
import type { LoginStep } from "../types";

// ── Types ───────────────────────────────────────────────────────────────────

type StepStatus = "pending" | "active" | "completed";

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

interface LoginStepperProps {
	readonly activeStep: LoginStep;
	readonly mfaSetupPending: boolean;
}

export const LoginStepper = memo(function LoginStepper({
	activeStep,
	mfaSetupPending,
}: LoginStepperProps) {
	if (mfaSetupPending) return null;

	return (
		<StepperRoot>
			{STEPPER_LABELS.map((label, idx) => {
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
							<StepLabel ownerState={{ status }}>{label}</StepLabel>
						</StepGroup>
					</Box>
				);
			})}
		</StepperRoot>
	);
});
