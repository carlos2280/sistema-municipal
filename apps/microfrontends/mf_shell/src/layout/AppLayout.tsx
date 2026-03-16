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
 * Overlays on-demand: NavPanel, CommandPalette, ThemeCustomizer, ChatDrawer
 * Focus Mode: Ctrl+Shift+F — eyebrow compact, compass hidden
 */

import { CssBaseline } from "@mui/material";
import { useState, useCallback, useEffect } from "react";
import { ChatDrawerWrapper } from "../components/ChatDrawerWrapper";
import { ThemeCustomizer } from "mf_ui/components";
import { OrganigramaDialog } from "../components/organigrama/OrganigramaDialog";
import { useModuleSync } from "../hooks/useModuleSync";
import { Eyebrow } from "./Eyebrow";
import { Stage } from "./Stage";
import { Compass } from "./Compass";
import { NavPanel, useNavPanel } from "./NavPanel";
import { CommandPalette, useCommandPalette } from "./CommandPalette";
import StatusLine from "./StatusLine";

// ============================================================================
// COMPONENT
// ============================================================================

export default function AppLayout() {
	useModuleSync();

	// ── Panel states ────────────────────────────────────────────────
	const navPanel = useNavPanel();
	const cmdPalette = useCommandPalette();
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

	const handleChangeSistema = useCallback(() => {
		navPanel.close();
		// El Compass se encarga del cambio de sistema
	}, [navPanel]);

	// Ocultar Compass cuando NavPanel o CommandPalette están abiertos
	const compassHidden = navPanel.isOpen || cmdPalette.isOpen;

	return (
		<>
			<CssBaseline />

			{/* ── Eyebrow (28px top bar) ───────────────────────────────── */}
			<Eyebrow
				onModuleClick={navPanel.toggle}
				onNotificationClick={() => {/* Fase 9: NotificationPanel */}}
				onAvatarClick={navPanel.toggle}
			/>

			{/* ── Stage (content area) ─────────────────────────────────── */}
			<Stage />

			{/* ── Compass FAB ──────────────────────────────────────────── */}
			<Compass hidden={compassHidden || focusMode} />

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

			<ThemeCustomizer
				open={customizerOpen}
				onClose={() => setCustomizerOpen(false)}
			/>

			<ChatDrawerWrapper
				open={chatDrawerOpen}
				onClose={() => setChatDrawerOpen(false)}
			/>

			<OrganigramaDialog
				open={orgOpen}
				onClose={() => setOrgOpen(false)}
			/>
		</>
	);
}
