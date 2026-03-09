import { Box, Stack, Typography, styled } from "@mui/material";
import { CheckCircle2, LogIn } from "lucide-react";
import { memo } from "react";
import { BackupCodesGrid } from "./BackupCodesGrid";

// ── Styled ───────────────────────────────────────────────────────────────────

const NoticeBox = styled(Box)(({ theme }) => ({
	padding: 20,
	background:
		theme.palette.mode === "light"
			? "rgba(5, 150, 105, 0.06)"
			: "rgba(5, 150, 105, 0.08)",
	border: "1px solid",
	borderColor:
		theme.palette.mode === "light"
			? "rgba(5, 150, 105, 0.15)"
			: "rgba(5, 150, 105, 0.2)",
	borderRadius: 12,
	textAlign: "center",
	marginBottom: 20,
}));

const NoticeIcon = styled(Box)({
	width: 56,
	height: 56,
	borderRadius: "50%",
	background: "rgba(5, 150, 105, 0.12)",
	color: "#059669",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	margin: "0 auto 16px",
});

const CountdownBox = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 8,
	padding: 12,
	fontSize: "0.8125rem",
	color: theme.palette.text.secondary,
}));

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
	"&:hover": {
		background: "#0a5249",
		transform: "translateY(-1px)",
		boxShadow: "0 4px 12px rgba(13, 107, 94, 0.3)",
	},
	"&:active": { transform: "translateY(0)" },
	...(theme.palette.mode === "dark" && {
		"&:hover": {
			background: "#0a5249",
			transform: "translateY(-1px)",
			boxShadow: "0 4px 12px rgba(16, 137, 122, 0.35)",
		},
	}),
}));

// ── Component ────────────────────────────────────────────────────────────────

interface MfaSuccessPhaseProps {
	backupCodes: string[];
	countdown: number;
	onGoToLogin: () => void;
}

export const MfaSuccessPhase = memo(function MfaSuccessPhase({
	backupCodes,
	countdown,
	onGoToLogin,
}: MfaSuccessPhaseProps) {
	return (
		<Stack spacing={2.5}>
			<NoticeBox>
				<NoticeIcon>
					<CheckCircle2 size={28} />
				</NoticeIcon>
				<Typography sx={{ fontWeight: 700, fontSize: "1.0625rem", mb: 1 }}>
					MFA activado correctamente
				</Typography>
				<Typography
					sx={{
						fontSize: "0.8125rem",
						color: "text.secondary",
						lineHeight: 1.6,
					}}
				>
					Guarda estos códigos de respaldo en un lugar seguro. Cada código
					solo puede ser usado una vez.
				</Typography>
			</NoticeBox>

			{backupCodes.length > 0 && <BackupCodesGrid codes={backupCodes} />}

			<CountdownBox>
				Redirigiendo en{" "}
				<Box
					component="span"
					sx={{
						fontFamily: '"JetBrains Mono", monospace',
						fontWeight: 700,
						color: "#0d6b5e",
					}}
				>
					{countdown}
				</Box>{" "}
				segundos
			</CountdownBox>

			<PrimaryButton type="button" onClick={onGoToLogin}>
				<LogIn size={18} />
				<span>Ir al login ahora</span>
			</PrimaryButton>
		</Stack>
	);
});
