import { useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	useGetModulosActivosQuery,
	selectModulosActivos,
	selectIsAuthenticated,
	modulosReceived,
	useAppSelector,
	useAppDispatch,
} from "mf_store/store";
import { registerDynamicRemotes } from "../modules/dynamicModuleLoader";

/**
 * Hook que sincroniza los módulos activos del tenant con el backend.
 * - Polling cada 60s via RTK Query
 * - Escucha CustomEvent "module-not-subscribed" para refetch inmediato
 * - Compara con el store y despacha cambios
 * - Toasts informativos y redirección si es necesario
 */
export function useModuleSync() {
	const dispatch = useAppDispatch();
	const location = useLocation();
	const navigate = useNavigate();
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const currentModules = useAppSelector(selectModulosActivos);
	const prevCodesRef = useRef<string>("");

	const { data: freshModules, refetch } = useGetModulosActivosQuery(
		undefined,
		{
			pollingInterval: 60_000,
			skip: !isAuthenticated,
		},
	);

	// Refetch inmediato al recibir 403 MODULE_NOT_SUBSCRIBED
	const handleModuleNotSubscribed = useCallback(() => {
		refetch();
	}, [refetch]);

	useEffect(() => {
		window.addEventListener(
			"module-not-subscribed",
			handleModuleNotSubscribed,
		);
		return () => {
			window.removeEventListener(
				"module-not-subscribed",
				handleModuleNotSubscribed,
			);
		};
	}, [handleModuleNotSubscribed]);

	// Comparar y sincronizar cuando llegan datos frescos
	useEffect(() => {
		if (!freshModules) return;

		const currentCodes = currentModules.map((m) => m.codigo).sort().join(",");
		const freshCodes = freshModules.map((m) => m.codigo).sort().join(",");

		// Sin cambios
		if (currentCodes === freshCodes) {
			prevCodesRef.current = currentCodes;
			return;
		}

		// Evitar toasts en la carga inicial (cuando el store está vacío)
		const isInitialLoad = prevCodesRef.current === "" && currentModules.length === 0;
		prevCodesRef.current = freshCodes;

		const currentCodesSet = new Set(currentModules.map((m) => m.codigo));
		const freshCodesSet = new Set(freshModules.map((m) => m.codigo));

		const removed = currentModules.filter((m) => !freshCodesSet.has(m.codigo));
		const added = freshModules.filter((m) => !currentCodesSet.has(m.codigo));

		// Actualizar store
		dispatch(modulosReceived(freshModules));

		// Registrar nuevos remotes dinámicos
		if (added.length > 0) {
			registerDynamicRemotes(added);
			if (!isInitialLoad) {
				for (const mod of added) {
					toast.success(`Nuevo módulo disponible: ${mod.nombre}`);
				}
			}
		}

		// Manejar módulos removidos
		if (removed.length > 0 && !isInitialLoad) {
			for (const mod of removed) {
				toast.info(`El módulo "${mod.nombre}" ha sido desactivado`);
			}

			// Redirigir al dashboard si el usuario NO está en una ruta segura.
			// Rutas seguras: "/" (dashboard) y rutas de módulos que siguen activos.
			// Las rutas de contabilidad son slugs del menú (ej: /plan-de-cuentas)
			// que no podemos predecir, así que redirigimos si no estamos en "/" ni
			// en rutas de módulos activos conocidos (chat).
			const safePathPrefixes = ["/login", "/contrasena-temporal"];
			for (const mod of freshModules) {
				if (mod.codigo === "chat") {
					safePathPrefixes.push("/chat");
				}
			}

			const isOnSafeRoute =
				location.pathname === "/" ||
				safePathPrefixes.some((p) => location.pathname.startsWith(p));

			if (!isOnSafeRoute) {
				navigate("/");
			}
		}
	}, [freshModules, currentModules, dispatch, location.pathname, navigate]);
}
