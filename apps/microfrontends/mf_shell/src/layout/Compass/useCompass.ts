/**
 * useCompass — Hook de estado para el Compass Dock
 *
 * Maneja: open/close, keyboard shortcuts (Alt+1..N), cambio de sistema.
 * Los sistemas vienen de `useMisSistemasQuery()` — dinámico según usuario.
 * El cambio de sistema usa `useCambiarSistemaMutation()`.
 */

import {
	selectSistemaId,
	useAppSelector,
	useCambiarSistemaMutation,
	useMisSistemasQuery,
} from "mf_store/store";
import { useCallback, useEffect, useMemo, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────

interface CompassSistema {
	id: number;
	nombre: string;
	icono: string | null;
	isHome: boolean;
}

// ─── Home (siempre presente como primer item) ───────────────────

const HOME_ITEM: CompassSistema = {
	id: 0,
	nombre: "Inicio",
	icono: "house",
	isHome: true,
};

// ─── Hook ───────────────────────────────────────────────────────

function useCompass() {
	const [isOpen, setIsOpen] = useState(false);
	const sistemaIdActual = useAppSelector(selectSistemaId);
	const { data: misSistemas = [] } = useMisSistemasQuery();
	const [cambiarSistema] = useCambiarSistemaMutation();

	// Construir lista: home + sistemas del usuario
	const sistemas: CompassSistema[] = useMemo(() => {
		const items = misSistemas.map(
			(s: { id: number; nombre: string; icono: string | null }) => ({
				id: s.id,
				nombre: s.nombre,
				icono: s.icono,
				isHome: false,
			}),
		);
		return [HOME_ITEM, ...items];
	}, [misSistemas]);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

	const goSistema = useCallback(
		(sistemaId: number) => {
			// Home = id 0 → no cambiar sistema, solo cerrar
			if (sistemaId === 0 || sistemaId === sistemaIdActual) {
				setIsOpen(false);
				return;
			}
			cambiarSistema({ sistemaId });
			setIsOpen(false);
		},
		[sistemaIdActual, cambiarSistema],
	);

	// ── Keyboard Shortcuts ────────────────────────────────────────
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			// Alt+1..N → cambio directo de sistema
			if (e.altKey && e.key >= "1" && e.key <= "9") {
				const index = Number.parseInt(e.key, 10) - 1;
				if (index < sistemas.length) {
					e.preventDefault();
					goSistema(sistemas[index].id);
				}
				return;
			}

			// Esc → cerrar compass si está abierto
			if (e.key === "Escape" && isOpen) {
				e.preventDefault();
				close();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, close, goSistema, sistemas]);

	return {
		isOpen,
		open,
		close,
		toggle,
		goSistema,
		sistemaIdActual,
		sistemas,
	};
}

export type { CompassSistema };
export default useCompass;
