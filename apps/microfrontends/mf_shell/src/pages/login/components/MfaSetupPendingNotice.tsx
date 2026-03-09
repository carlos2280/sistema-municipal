import { Box, Typography, styled } from "@mui/material";
import { Clock, MailCheck } from "lucide-react";
import { memo } from "react";

// ── Notice matching prototype ────────────────────────────────────────────────

const NoticeBox = styled(Box)(({ theme }) => ({
	padding: 20,
	background:
		theme.palette.mode === "light"
			? "rgba(13, 107, 94, 0.06)"
			: "rgba(16, 137, 122, 0.08)",
	border: "1px solid",
	borderColor:
		theme.palette.mode === "light"
			? "rgba(13, 107, 94, 0.15)"
			: "rgba(16, 137, 122, 0.2)",
	borderRadius: 12,
	textAlign: "center",
}));

const NoticeIcon = styled(Box)({
	width: 56,
	height: 56,
	borderRadius: "50%",
	background: "rgba(13, 107, 94, 0.12)",
	color: "#0d6b5e",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	margin: "0 auto 16px",
});

const HighlightBadge = styled(Box)({
	fontFamily: '"JetBrains Mono", "Fira Code", monospace',
	fontSize: "0.75rem",
	fontWeight: 600,
	color: "#0d6b5e",
	padding: "4px 12px",
	background: "rgba(13, 107, 94, 0.08)",
	borderRadius: 20,
	display: "inline-flex",
	alignItems: "center",
	gap: 4,
});

export const MfaSetupPendingNotice = memo(function MfaSetupPendingNotice() {
	return (
		<NoticeBox>
			<NoticeIcon>
				<MailCheck size={28} />
			</NoticeIcon>
			<Typography
				sx={{
					fontWeight: 700,
					fontSize: "1.0625rem",
					mb: 1,
				}}
			>
				Revisa tu correo electrónico
			</Typography>
			<Typography
				sx={{
					fontSize: "0.8125rem",
					color: "text.secondary",
					lineHeight: 1.6,
					mb: 1.5,
				}}
			>
				Se envió un enlace de configuración MFA a tu correo corporativo.
				Sigue las instrucciones para activar la verificación en dos pasos.
			</Typography>
			<HighlightBadge>
				<Clock size={12} />
				Enlace válido por 10 minutos
			</HighlightBadge>
		</NoticeBox>
	);
});
