/**
 * useCommandPalette — Hook de estado para la Command Palette
 *
 * Maneja: open/close, keyboard shortcuts (Ctrl+K / Alt+K toggle, Esc cerrar).
 */

import { useCallback, useEffect, useState } from "react";

function useCommandPalette() {
	const [isOpen, setIsOpen] = useState(false);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

	// ── Global Keyboard Trigger ──────────────────────────────────
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			// Ctrl+K o Alt+K → toggle
			if ((e.ctrlKey || e.altKey) && (e.key === "k" || e.key === "K")) {
				e.preventDefault();
				toggle();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [toggle]);

	return { isOpen, open, close, toggle };
}

export default useCommandPalette;
