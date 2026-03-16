/**
 * useNavPanel — Hook de estado para el Navigation Panel
 *
 * Maneja: open/close, keyboard shortcuts (Alt+N toggle, Esc cerrar).
 * Se integra con el Compass: al seleccionar un sistema se puede abrir el panel.
 */

import { useCallback, useEffect, useState } from "react";

function useNavPanel() {
	const [isOpen, setIsOpen] = useState(false);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

	// ── Keyboard Shortcuts ────────────────────────────────────────
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			// Alt+N → toggle NavPanel
			if (e.altKey && (e.key === "n" || e.key === "N")) {
				e.preventDefault();
				toggle();
				return;
			}

			// Esc → cerrar si está abierto
			if (e.key === "Escape" && isOpen) {
				e.preventDefault();
				close();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, close, toggle]);

	return { isOpen, open, close, toggle };
}

export default useNavPanel;
