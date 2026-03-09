import { Box, styled } from "@mui/material";
import { Check } from "lucide-react";
import { memo } from "react";
import { STEPPER_LABELS } from "../constants";
import type { LoginStep } from "../types";

// ── Custom stepper matching prototype ────────────────────────────────────────

const StepperRoot = styled(Box)({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 8,
	marginBottom: 24,
});

const StepGroup = styled(Box)({
	display: "flex",
	alignItems: "center",
	gap: 8,
});

const StepDot = styled(Box)<{
	ownerState: { status: "pending" | "active" | "completed" };
}>(({ theme, ownerState }) => ({
	width: 28,
	height: 28,
	borderRadius: "50%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: "0.75rem",
	fontWeight: 700,
	transition: "all 200ms ease",

	...(ownerState.status === "pending" && {
		background: theme.palette.background.default,
		border: `2px solid ${theme.palette.divider}`,
		color: theme.palette.text.disabled,
	}),

	...(ownerState.status === "active" && {
		background: "#0d6b5e",
		border: "2px solid #0d6b5e",
		color: "#fff",
		boxShadow: "0 0 0 4px rgba(13, 107, 94, 0.15)",
	}),

	...(ownerState.status === "completed" && {
		background: "#0d6b5e",
		border: "2px solid #0d6b5e",
		color: "#fff",
	}),
}));

const StepLabel = styled(Box)<{
	ownerState: { status: "pending" | "active" | "completed" };
}>(({ theme, ownerState }) => ({
	fontSize: "0.6875rem",
	fontWeight: 600,
	transition: "color 200ms ease",

	...(ownerState.status === "pending" && {
		color: theme.palette.text.disabled,
	}),
	...(ownerState.status === "active" && {
		color: theme.palette.text.primary,
	}),
	...(ownerState.status === "completed" && {
		color: "#0d6b5e",
	}),
}));

const Connector = styled(Box)<{ ownerState: { filled: boolean } }>(
	({ theme, ownerState }) => ({
		width: 32,
		height: 2,
		borderRadius: 1,
		transition: "background 200ms ease",
		background: ownerState.filled ? "#0d6b5e" : theme.palette.divider,
	}),
);

interface LoginStepperProps {
	activeStep: LoginStep;
	mfaSetupPending: boolean;
}

export const LoginStepper = memo(function LoginStepper({
	activeStep,
	mfaSetupPending,
}: LoginStepperProps) {
	// Hide stepper on MFA step and MFA setup pending
	if (mfaSetupPending || activeStep === 2) return null;

	return (
		<StepperRoot>
			{STEPPER_LABELS.map((label, idx) => {
				const status: "pending" | "active" | "completed" =
					idx < activeStep
						? "completed"
						: idx === activeStep
							? "active"
							: "pending";

				return (
					<Box key={label} sx={{ display: "contents" }}>
						{idx > 0 && (
							<Connector
								ownerState={{ filled: idx <= activeStep }}
							/>
						)}
						<StepGroup>
							<StepDot ownerState={{ status }}>
								{status === "completed" ? (
									<Check size={14} />
								) : (
									idx + 1
								)}
							</StepDot>
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
