/**
 * MfaSetupPendingNotice — Aviso de configuración MFA pendiente MERIDIAN
 *
 * Colores desde theme, nada hardcoded.
 */

import { Box, Typography, alpha, styled } from "@mui/material";
import { Clock, MailCheck } from "lucide-react";
import { memo } from "react";

// ── Styled ──────────────────────────────────────────────────────────────────

const NoticeBox = styled(Box)(({ theme }) => {
	const accent = theme.palette.primary.main;

	return {
		padding: 20,
		background: alpha(accent, 0.05),
		border: `1px solid ${alpha(accent, 0.14)}`,
		borderRadius: 12,
		textAlign: "center",
	};
});

const NoticeIcon = styled(Box)(({ theme }) => ({
	width: 56,
	height: 56,
	borderRadius: "50%",
	background: alpha(theme.palette.primary.main, 0.12),
	color: theme.palette.primary.main,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	margin: "0 auto 16px",
}));

const HighlightBadge = styled(Box)(({ theme }) => ({
	fontFamily: theme.typography.number?.fontFamily,
	fontSize: "0.75rem",
	fontWeight: 600,
	color: theme.palette.primary.main,
	padding: "4px 12px",
	background: alpha(theme.palette.primary.main, 0.08),
	borderRadius: 20,
	display: "inline-flex",
	alignItems: "center",
	gap: 4,
}));

// ── Component ───────────────────────────────────────────────────────────────

export const MfaSetupPendingNotice = memo(function MfaSetupPendingNotice() {
	return (
		<NoticeBox>
			<NoticeIcon>
				<MailCheck size={28} />
			</NoticeIcon>
			<Typography sx={{ fontWeight: 700, fontSize: "1.0625rem", mb: 1 }}>
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
