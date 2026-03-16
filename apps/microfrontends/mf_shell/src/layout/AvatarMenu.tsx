/**
 * AvatarMenu — Dropdown de usuario MERIDIAN
 *
 * Panel flotante 220px anclado a la zona derecha del Eyebrow.
 * Glass material (glassmorphism) + z-index: floating (850).
 * Muestra: info de usuario, acciones rápidas (tema, NavPanel, cerrar sesión).
 * Click fuera o Esc para cerrar.
 */

import { styled, alpha } from "@mui/material/styles";
import { Palette, Menu, LogOut } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	useAppSelector,
	selectNombreCompleto,
	selectEmail,
	useLogoutMutation,
} from "mf_store/store";
import { usePersistor } from "../context/PersistorContext";

// ─── Types ──────────────────────────────────────────────────────

interface AvatarMenuProps {
	isOpen: boolean;
	onClose: () => void;
	onOpenNavPanel?: () => void;
	onOpenCustomizer?: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────

function getInitials(name: string | null): string {
	if (!name) return "U";
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
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
}));

const MenuRoot = styled("div", {
	shouldForwardProp: (prop) => prop !== "visible",
})<{ visible: boolean }>(({ theme, visible }) => {
	const isDark = theme.palette.mode === "dark";

	return {
		position: "fixed",
		top: 36,
		right: 16,
		width: 220,
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
			top: 52,
		},
	};
});

const UserSection = styled("div")(({ theme }) => ({
	padding: "14px 16px",
	borderBottom: `1px solid ${theme.meridian.borders.muted}`,
	display: "flex",
	alignItems: "center",
	gap: 10,
}));

const AvatarCircle = styled("div")(({ theme }) => ({
	width: 32,
	height: 32,
	borderRadius: "50%",
	background: theme.palette.primary.main,
	color: theme.palette.primary.contrastText,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: 12,
	fontWeight: 700,
	flexShrink: 0,
	fontFamily: theme.typography.fontFamily,
}));

const UserText = styled("div")({
	minWidth: 0,
	flex: 1,
});

const UserName = styled("span")(({ theme }) => ({
	display: "block",
	fontSize: 13,
	fontWeight: 600,
	color: theme.palette.text.primary,
	lineHeight: 1.3,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	fontFamily: theme.typography.fontFamily,
}));

const UserEmail = styled("span")(({ theme }) => ({
	display: "block",
	fontSize: 11,
	color: theme.palette.text.secondary,
	lineHeight: 1.3,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	fontFamily: theme.typography.fontFamily,
}));

const MenuItems = styled("div")({
	padding: "6px 0",
});

const MenuItem = styled("button")(({ theme }) => ({
	border: "none",
	background: "transparent",
	padding: "9px 16px",
	cursor: "pointer",
	display: "flex",
	alignItems: "center",
	gap: 10,
	width: "100%",
	font: "inherit",
	fontSize: 13,
	fontWeight: 500,
	color: theme.palette.text.secondary,
	transition: "background 120ms ease, color 120ms ease",
	fontFamily: theme.typography.fontFamily,
	textAlign: "left",
	minHeight: 36,

	"&:hover": {
		background: alpha(theme.palette.text.primary, 0.06),
		color: theme.palette.text.primary,
	},

	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: -2,
	},

	// Mobile: touch target mínimo 44px
	[theme.breakpoints.down("md")]: {
		minHeight: 44,
		padding: "12px 16px",
	},
}));

const Divider = styled("div")(({ theme }) => ({
	height: 1,
	background: theme.meridian.borders.muted,
	margin: "4px 0",
}));

const LogoutItem = styled(MenuItem)(({ theme }) => ({
	color: theme.palette.error.main,

	"&:hover": {
		background: alpha(theme.palette.error.main, 0.08),
		color: theme.palette.error.main,
	},
}));

const IconWrap = styled("span")({
	display: "flex",
	alignItems: "center",
	flexShrink: 0,
});

// ─── Component ──────────────────────────────────────────────────

function AvatarMenu({ isOpen, onClose, onOpenNavPanel, onOpenCustomizer }: AvatarMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const persistor = usePersistor();
	const [logout] = useLogoutMutation();

	const nombreCompleto = useAppSelector(selectNombreCompleto);
	const email = useAppSelector(selectEmail);
	const initials = getInitials(nombreCompleto);

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

	// ── Focus on open ─────────────────────────────────────────────
	useEffect(() => {
		if (isOpen) {
			const timer = setTimeout(() => menuRef.current?.focus(), 50);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	// ── Actions ───────────────────────────────────────────────────
	const handleNavPanel = () => {
		onClose();
		onOpenNavPanel?.();
	};

	const handleCustomizer = () => {
		onClose();
		onOpenCustomizer?.();
	};

	const handleLogout = async () => {
		onClose();
		try {
			await logout();
		} catch {
			// Si el backend falla, continuar con limpieza local
		}
		await persistor.purge();
		navigate("/login", { replace: true });
	};

	return (
		<>
			<Backdrop visible={isOpen} onClick={onClose} />

			<MenuRoot
				ref={menuRef}
				visible={isOpen}
				role="menu"
				aria-label="Menú de usuario"
				tabIndex={-1}
			>
				{/* User info */}
				<UserSection>
					<AvatarCircle>{initials}</AvatarCircle>
					<UserText>
						<UserName>{nombreCompleto ?? "Usuario"}</UserName>
						<UserEmail>{email ?? ""}</UserEmail>
					</UserText>
				</UserSection>

				{/* Actions */}
				<MenuItems>
					<MenuItem onClick={handleNavPanel} type="button" role="menuitem">
						<IconWrap>
							<Menu size={15} strokeWidth={1.5} />
						</IconWrap>
						Navegación
					</MenuItem>

					<MenuItem onClick={handleCustomizer} type="button" role="menuitem">
						<IconWrap>
							<Palette size={15} strokeWidth={1.5} />
						</IconWrap>
						Personalizar tema
					</MenuItem>

					<Divider />

					<LogoutItem onClick={handleLogout} type="button" role="menuitem">
						<IconWrap>
							<LogOut size={15} strokeWidth={1.5} />
						</IconWrap>
						Cerrar sesión
					</LogoutItem>
				</MenuItems>
			</MenuRoot>
		</>
	);
}

export default AvatarMenu;
