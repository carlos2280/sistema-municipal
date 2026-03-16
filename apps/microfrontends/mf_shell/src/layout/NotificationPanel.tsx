/**
 * NotificationPanel — Dropdown de notificaciones MERIDIAN
 *
 * Panel flotante 360px anclado a la zona derecha del Eyebrow.
 * Glass material (glassmorphism) + z-index: floating (850).
 * Click fuera o Esc para cerrar.
 *
 * Fase 9: estructura base — el contenido real de notificaciones
 * se conectará cuando exista el backend de notificaciones.
 */

import { styled, alpha } from "@mui/material/styles";
import { Bell, X } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────

interface NotificationPanelProps {
	isOpen: boolean;
	onClose: () => void;
}

// ─── Styled Components ──────────────────────────────────────────

const Backdrop = styled("div", {
	shouldForwardProp: (prop) => prop !== "visible",
})<{ visible: boolean }>(({ visible }) => ({
	position: "fixed",
	inset: 0,
	zIndex: 849,
	opacity: visible ? 1 : 0,
	pointerEvents: visible ? "all" : "none",
	// Backdrop transparente (sin blur) — no queremos oscurecer todo
}));

const PanelRoot = styled("div", {
	shouldForwardProp: (prop) => prop !== "visible",
})<{ visible: boolean }>(({ theme, visible }) => {
	const isDark = theme.palette.mode === "dark";

	return {
		position: "fixed",
		top: 36,
		right: 16,
		width: 360,
		maxWidth: "calc(100vw - 32px)",
		maxHeight: "min(520px, 70vh)",
		zIndex: theme.meridian.zIndex.floating,
		background: alpha(theme.meridian.surfaces.s2, isDark ? 0.92 : 0.96),
		backdropFilter: "blur(20px)",
		WebkitBackdropFilter: "blur(20px)",
		border: `1px solid ${theme.meridian.borders.strong}`,
		borderRadius: 12,
		boxShadow: theme.meridian.shadows.lg,
		display: "flex",
		flexDirection: "column",
		overflow: "hidden",
		opacity: visible ? 1 : 0,
		transform: visible ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.98)",
		pointerEvents: visible ? "all" : "none",
		transition: `opacity 180ms ${theme.meridian.easings.out}, transform 180ms ${theme.meridian.easings.out}`,

		[theme.breakpoints.down("sm")]: {
			right: 8,
			width: "calc(100vw - 16px)",
			top: 52,
		},
	};
});

const PanelHeader = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	padding: "14px 16px",
	borderBottom: `1px solid ${theme.meridian.borders.muted}`,
}));

const HeaderTitle = styled("span")(({ theme }) => ({
	fontSize: 13,
	fontWeight: 600,
	color: theme.palette.text.primary,
	fontFamily: theme.typography.fontFamily,
	display: "flex",
	alignItems: "center",
	gap: 8,
}));

const CloseButton = styled("button")(({ theme }) => ({
	border: "none",
	background: "transparent",
	padding: 4,
	borderRadius: 6,
	cursor: "pointer",
	color: theme.palette.text.secondary,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
	transition: "background 150ms ease, color 150ms ease",

	"&:hover": {
		background: alpha(theme.palette.text.primary, 0.08),
		color: theme.palette.text.primary,
	},

	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: 2,
	},
}));

const PanelBody = styled("div")({
	flex: 1,
	overflowY: "auto",
	padding: "8px 0",
});

const EmptyState = styled("div")(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	padding: "40px 20px",
	gap: 12,
	color: theme.palette.text.disabled,
}));

const EmptyIcon = styled("div")(({ theme }) => ({
	width: 48,
	height: 48,
	borderRadius: 12,
	background: theme.meridian.surfaces.s3,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: theme.palette.text.disabled,
}));

const EmptyText = styled("span")(({ theme }) => ({
	fontSize: 13,
	fontFamily: theme.typography.fontFamily,
	textAlign: "center",
}));

// ─── Component ──────────────────────────────────────────────────

function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
	const panelRef = useRef<HTMLDivElement>(null);

	// ── Esc to close ──────────────────────────────────────────────
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				e.preventDefault();
				onClose();
			}
		},
		[isOpen, onClose],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	// ── Focus trap on open ────────────────────────────────────────
	useEffect(() => {
		if (isOpen) {
			const timer = setTimeout(() => panelRef.current?.focus(), 50);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	return (
		<>
			<Backdrop visible={isOpen} onClick={onClose} />

			<PanelRoot
				ref={panelRef}
				visible={isOpen}
				role="dialog"
				aria-label="Panel de notificaciones"
				aria-modal="true"
				tabIndex={-1}
			>
				<PanelHeader>
					<HeaderTitle>
						<Bell size={16} strokeWidth={1.5} />
						Notificaciones
					</HeaderTitle>
					<CloseButton
						onClick={onClose}
						type="button"
						aria-label="Cerrar notificaciones"
					>
						<X size={16} strokeWidth={2} />
					</CloseButton>
				</PanelHeader>

				<PanelBody>
					{/* Fase futura: lista de notificaciones desde backend */}
					<EmptyState>
						<EmptyIcon>
							<Bell size={24} strokeWidth={1.5} />
						</EmptyIcon>
						<EmptyText>No tienes notificaciones nuevas</EmptyText>
					</EmptyState>
				</PanelBody>
			</PanelRoot>
		</>
	);
}

export default NotificationPanel;
