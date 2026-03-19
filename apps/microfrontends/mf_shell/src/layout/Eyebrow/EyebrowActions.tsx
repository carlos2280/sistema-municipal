/**
 * EyebrowActions — Zona derecha del Eyebrow (molécula del layout)
 *
 * CONSUME moléculas/átomos de mf_ui: UserAvatar
 * Contiene: Badge de notificaciones + Botón de chat (siempre visible) + Avatar usuario
 * Priority+: P1 (avatar), P2 (notif badge + chat button → dot en mobile)
 */

import { alpha, styled } from "@mui/material/styles";
import { MessageCircle } from "lucide-react";
import { selectNombreCompleto, useAppSelector } from "mf_store/store";
import { UserAvatar } from "mf_ui/components";

// ─── Types ──────────────────────────────────────────────────────

interface EyebrowActionsProps {
	notificationCount?: number;
	chatUnreadCount?: number;
	onNotificationClick?: () => void;
	onChatClick?: () => void;
	onAvatarClick?: () => void;
}

// ─── Styled Components ──────────────────────────────────────────

const ActionsContainer = styled("div")({
	display: "flex",
	alignItems: "center",
	gap: 12,
	justifyContent: "flex-end",
});

const BadgeButton = styled("button")(({ theme }) => ({
	// Reset
	border: `1px solid ${theme.meridian.borders.default}`,
	background: "none",
	cursor: "pointer",

	display: "inline-flex",
	alignItems: "center",
	gap: 4,
	fontSize: 11,
	color: theme.palette.text.disabled,
	padding: "2px 6px",
	borderRadius: 4,
	transition: "all 150ms",
	fontFamily: theme.typography.mono.fontFamily,
	whiteSpace: "nowrap",
	lineHeight: 1.4,

	"&:hover": {
		borderColor: theme.palette.primary.main,
		color: theme.palette.primary.main,
	},

	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: 2,
	},

	// P2: oculto en mobile
	[theme.breakpoints.down("md")]: {
		display: "none",
	},
}));

/** Botón de chat — SIEMPRE visible (desktop y mobile) */
const ChatButton = styled("button")(({ theme }) => ({
	// Reset
	border: `1px solid ${theme.meridian.borders.default}`,
	background: "none",
	cursor: "pointer",

	position: "relative",
	display: "inline-flex",
	alignItems: "center",
	gap: 4,
	fontSize: 11,
	color: theme.palette.text.disabled,
	padding: "2px 6px",
	borderRadius: 4,
	transition: "all 150ms",
	fontFamily: theme.typography.mono.fontFamily,
	whiteSpace: "nowrap",
	lineHeight: 1.4,

	"&:hover": {
		borderColor: theme.palette.primary.main,
		color: theme.palette.primary.main,
	},

	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: 2,
	},
}));

/** Texto del badge [N] — oculto en mobile para ahorrar espacio */
const ChatBadgeText = styled("span")(({ theme }) => ({
	[theme.breakpoints.down("md")]: {
		display: "none",
	},
}));

/** Wrapper con dot de notificación para mobile */
const AvatarWrap = styled("div")(({ theme }) => ({
	position: "relative",
	display: "inline-flex",
	flexShrink: 0,
	// Mobile: larger touch target
	[theme.breakpoints.down("md")]: {
		padding: 8,
		margin: -8,
	},
}));

const AvatarDot = styled("span")(({ theme }) => ({
	display: "none",
	position: "absolute",
	top: -2,
	right: -2,
	width: 7,
	height: 7,
	borderRadius: "50%",
	background: theme.palette.primary.main,
	border: `1.5px solid ${alpha(theme.meridian.surfaces.ground, 0.92)}`,
	pointerEvents: "none",
	// P2 mobile: dot visible cuando badges están ocultos
	[theme.breakpoints.down("md")]: {
		display: "block",
	},
}));

// ─── Component ──────────────────────────────────────────────────

function EyebrowActions({
	notificationCount = 0,
	chatUnreadCount = 0,
	onNotificationClick,
	onChatClick,
	onAvatarClick,
}: EyebrowActionsProps) {
	const nombreCompleto = useAppSelector(selectNombreCompleto);
	const hasNotifications = notificationCount > 0;
	const hasChatUnread = chatUnreadCount > 0;
	const hasAnyUnread = hasNotifications || hasChatUnread;

	const chatDisplay =
		chatUnreadCount > 99 ? "99+" : String(chatUnreadCount);

	return (
		<ActionsContainer>
			{/* Notification Badge — P2 (hidden on mobile, replaced by dot) */}
			{hasNotifications && (
				<BadgeButton
					onClick={onNotificationClick}
					aria-label={`Ver ${notificationCount} notificaciones`}
					type="button"
				>
					[{notificationCount}]
				</BadgeButton>
			)}

			{/* Chat Button — visible solo si el módulo chat está contratado */}
			{onChatClick && (
				<ChatButton
					onClick={onChatClick}
					aria-label={
						hasChatUnread
							? `Chat — ${chatUnreadCount} mensajes sin leer`
							: "Abrir chat"
					}
					type="button"
				>
					<MessageCircle size={14} />
					{hasChatUnread && (
						<ChatBadgeText>[{chatDisplay}]</ChatBadgeText>
					)}
				</ChatButton>
			)}

			{/* Avatar — P1 (molécula reutilizada de mf_ui) */}
			<AvatarWrap>
				<UserAvatar
					name={nombreCompleto ?? "Usuario"}
					size="xs"
					onClick={onAvatarClick}
				/>
				{/* Dot para mobile (combina notif + chat unreads) */}
				{hasAnyUnread && <AvatarDot aria-hidden="true" />}
			</AvatarWrap>
		</ActionsContainer>
	);
}

export default EyebrowActions;
