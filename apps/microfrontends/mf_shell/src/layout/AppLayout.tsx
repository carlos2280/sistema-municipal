/**
 * AppLayout — Layout principal MERIDIAN
 *
 * Arquitectura de tres capas:
 * ┌──────────────────────────────────────┐
 * │ Eyebrow 28px (glassmorphism)        │
 * ├──────────────────────────────────────┤
 * │                                      │
 * │         STAGE (contenido 97%)        │
 * │                                      │
 * │                              [◎]    │ ← Compass FAB
 * ├──────────────────────────────────────┤
 * │ StatusLine 2px                       │
 * └──────────────────────────────────────┘
 *
 * Overlays on-demand: NavPanel, CommandPalette, NotificationPanel, AvatarMenu, ThemeCustomizer, ChatDrawer
 * Focus Mode: Ctrl+Shift+F — eyebrow compact, compass hidden
 */

import { CssBaseline, GlobalStyles } from "@mui/material";
import {
	selectDrawerOpen,
	selectModulosActivos,
	useAppSelector,
	useObtenerConversacionesQuery,
} from "mf_store/store";
import { ThemeCustomizer } from "mf_ui/components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useModuleSync } from "../hooks/useModuleSync";
import AvatarMenu from "./AvatarMenu";
import { ChatDrawerWrapper } from "./ChatDrawer";
import { CommandPalette, useCommandPalette } from "./CommandPalette";
import { Compass } from "./Compass";
import { Eyebrow } from "./Eyebrow";
import { NavPanel, useNavPanel } from "./NavPanel";
import NotificationPanel from "./NotificationPanel";
import { OrganigramaDialog } from "./Organigrama";
import { Stage } from "./Stage";
import StatusLine from "./StatusLine";

// ============================================================================
// COMPONENT
// ============================================================================

export default function AppLayout() {
	useModuleSync();

	// ── Panel states ────────────────────────────────────────────────
	const navPanel = useNavPanel();
	const cmdPalette = useCommandPalette();
	const [notifOpen, setNotifOpen] = useState(false);
	const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
	const [customizerOpen, setCustomizerOpen] = useState(false);
	const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
	const [orgOpen, setOrgOpen] = useState(false);
	const [focusMode, setFocusMode] = useState(false);

	// ── Focus Mode: Ctrl+Shift+F ────────────────────────────────────
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.ctrlKey && e.shiftKey && (e.key === "f" || e.key === "F")) {
				e.preventDefault();
				setFocusMode((prev) => !prev);
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	// ── Callbacks ───────────────────────────────────────────────────
	const handleOpenCustomizerFromNav = useCallback(() => {
		navPanel.close();
		setCustomizerOpen(true);
	}, [navPanel]);

	const handleOpenCustomizerFromCmd = useCallback(() => {
		cmdPalette.close();
		setCustomizerOpen(true);
	}, [cmdPalette]);

	const handleOpenCustomizerFromAvatar = useCallback(() => {
		setAvatarMenuOpen(false);
		setCustomizerOpen(true);
	}, []);

	const handleOpenNavFromAvatar = useCallback(() => {
		setAvatarMenuOpen(false);
		navPanel.open();
	}, [navPanel]);

	const handleChangeSistema = useCallback(() => {
		navPanel.close();
		// El Compass se encarga del cambio de sistema
	}, [navPanel]);

	// Cerrar otros floating panels cuando se abre uno
	const handleNotifClick = useCallback(() => {
		setAvatarMenuOpen(false);
		setNotifOpen((prev) => !prev);
	}, []);

	const handleAvatarClick = useCallback(() => {
		setNotifOpen(false);
		setAvatarMenuOpen((prev) => !prev);
	}, []);

	// ── Chat: solo si el módulo está contratado ─────────────────────
	const modulosActivos = useAppSelector(selectModulosActivos);
	const isChatActive = useMemo(
		() => modulosActivos.some((m) => m.codigo === "chat"),
		[modulosActivos],
	);
	const { data: conversaciones = [] } = useObtenerConversacionesQuery(
		undefined,
		{ skip: !isChatActive },
	);
	const chatUnreadCount = useMemo(
		() => conversaciones.reduce((acc, c) => acc + c.mensajesNoLeidos, 0),
		[conversaciones],
	);

	const handleChatClick = useCallback(() => {
		setNotifOpen(false);
		setAvatarMenuOpen(false);
		setChatDrawerOpen((prev) => !prev);
	}, []);

	// Ocultar Compass cuando NavPanel, CommandPalette o un drawer de MF están abiertos
	const drawerOpen = useAppSelector(selectDrawerOpen);
	const compassHidden = navPanel.isOpen || cmdPalette.isOpen || drawerOpen;

	return (
		<>
			<CssBaseline />
			<GlobalStyles
				styles={{
					"@media (prefers-reduced-motion: reduce)": {
						"*, *::before, *::after": {
							animationDuration: "0.01ms !important",
							animationIterationCount: "1 !important",
							transitionDuration: "0.01ms !important",
							scrollBehavior: "auto !important",
						},
					},
				}}
			/>

			{/* ── Eyebrow (28px top bar) ───────────────────────────────── */}
			<Eyebrow
				onModuleClick={navPanel.toggle}
				onNotificationClick={handleNotifClick}
				onChatClick={isChatActive ? handleChatClick : undefined}
				onAvatarClick={handleAvatarClick}
				chatUnreadCount={isChatActive ? chatUnreadCount : 0}
			/>

			{/* ── Stage (content area) ─────────────────────────────────── */}
			<Stage />

			{/* ── Compass FAB ──────────────────────────────────────────── */}
			<Compass
				hidden={compassHidden || focusMode}
				chatUnreadCount={isChatActive ? chatUnreadCount : 0}
			/>

			{/* ── StatusLine (2px accent bottom) ───────────────────────── */}
			<StatusLine />

			{/* ── Overlays / Side Panels ────────────────────────────────── */}
			<NavPanel
				isOpen={navPanel.isOpen}
				onClose={navPanel.close}
				onChangeSistema={handleChangeSistema}
				onOpenCustomizer={handleOpenCustomizerFromNav}
			/>

			<CommandPalette
				isOpen={cmdPalette.isOpen}
				onClose={cmdPalette.close}
				onOpenCustomizer={handleOpenCustomizerFromCmd}
			/>

			{/* ── Floating Panels (z-index: 850) ──────────────────────────── */}
			<NotificationPanel
				isOpen={notifOpen}
				onClose={() => setNotifOpen(false)}
			/>

			<AvatarMenu
				isOpen={avatarMenuOpen}
				onClose={() => setAvatarMenuOpen(false)}
				onOpenNavPanel={handleOpenNavFromAvatar}
				onOpenCustomizer={handleOpenCustomizerFromAvatar}
			/>

			<ThemeCustomizer
				open={customizerOpen}
				onClose={() => setCustomizerOpen(false)}
			/>

			{isChatActive && (
				<ChatDrawerWrapper
					open={chatDrawerOpen}
					onClose={() => setChatDrawerOpen(false)}
				/>
			)}

			<OrganigramaDialog open={orgOpen} onClose={() => setOrgOpen(false)} />
		</>
	);
}
