import { Box, styled } from "@mui/material";
import { ArrowLeft, ArrowRight, LogIn, ShieldCheck } from "lucide-react";
import { memo, useMemo } from "react";
import { STEP_CONFIG } from "../constants";
import type { LoginStep } from "../types";

// ── Styled buttons matching prototype ────────────────────────────────────────

const PrimaryButton = styled("button")(({ theme }) => ({
	width: "100%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 8,
	padding: "12px 20px",
	border: "none",
	borderRadius: 8,
	background: "#0d6b5e",
	color: "#fff",
	fontFamily: "inherit",
	fontSize: "0.875rem",
	fontWeight: 600,
	cursor: "pointer",
	transition: "all 100ms ease",

	"&:hover:not(:disabled)": {
		background: "#0a5249",
		transform: "translateY(-1px)",
		boxShadow: "0 4px 12px rgba(13, 107, 94, 0.3)",
	},

	"&:active:not(:disabled)": {
		transform: "translateY(0)",
	},

	"&:disabled": {
		opacity: 0.5,
		cursor: "not-allowed",
	},

	"&:focus-visible": {
		outline: "2px solid #0d6b5e",
		outlineOffset: 2,
	},

	...(theme.palette.mode === "dark" && {
		"&:hover:not(:disabled)": {
			background: "#0a5249",
			transform: "translateY(-1px)",
			boxShadow: "0 4px 12px rgba(16, 137, 122, 0.35)",
		},
	}),
}));

const SecondaryButton = styled("button")(({ theme }) => ({
	width: "100%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 8,
	padding: "10px 20px",
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 8,
	background: "transparent",
	color: theme.palette.text.secondary,
	fontFamily: "inherit",
	fontSize: "0.8125rem",
	fontWeight: 500,
	cursor: "pointer",
	transition: "all 100ms ease",

	"&:hover": {
		background: theme.palette.background.default,
		borderColor: theme.palette.mode === "light" ? "#cbd5e1" : "#30363d",
		color: theme.palette.text.primary,
	},
}));

const STEP_ICONS: Record<LoginStep, React.ReactNode> = {
	0: <ArrowRight size={18} />,
	1: <LogIn size={18} />,
	2: <ShieldCheck size={18} />,
};

interface LoginActionsProps {
	activeStep: LoginStep;
	disabled: boolean;
	onNext: () => void;
	onBack: () => void;
}

export const LoginActions = memo(function LoginActions({
	activeStep,
	disabled,
	onNext,
	onBack,
}: LoginActionsProps) {
	const config = useMemo(() => STEP_CONFIG[activeStep], [activeStep]);
	const icon = STEP_ICONS[activeStep];

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 3 }}>
			<PrimaryButton onClick={onNext} disabled={disabled} type="button">
				{activeStep > 0 && icon}
				<span>{config.buttonLabel}</span>
				{activeStep === 0 && icon}
			</PrimaryButton>

			{activeStep > 0 && (
				<SecondaryButton onClick={onBack} type="button">
					<ArrowLeft size={16} />
					<span>Volver</span>
				</SecondaryButton>
			)}
		</Box>
	);
});
