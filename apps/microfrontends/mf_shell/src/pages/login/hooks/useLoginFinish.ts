import { useCallback } from "react";
import { toast } from "sonner";
import {
	MenuApi,
	menuReceived,
	useAppDispatch,
} from "mf_store/store";

interface PostLoginData {
	modulosActivos?: Array<{
		codigo: string;
		nombre: string;
		mfName: string | null;
		mfManifestUrlTpl: string | null;
		icono: string | null;
		apiPrefix: string;
	}>;
}

/**
 * Handles post-authentication: register dynamic remotes, fetch menu.
 * Single Responsibility: only the "finish login" side effects.
 *
 * La navegación a "/" NO se hace aquí. App.tsx recrea el router cuando
 * isAuthenticated cambia, y LoginPage redirige a "/" vía <Navigate />.
 * Usar navigate() aquí operaría sobre el router antiguo (pre-recreación).
 *
 * @param onSuccess - callback fired after menu is loaded to trigger UI transitions
 */
export const useLoginFinish = (onSuccess?: () => void) => {
	const dispatch = useAppDispatch();

	const finishLogin = useCallback(
		async (loginData: PostLoginData) => {
			try {
				if (loginData.modulosActivos) {
					const { registerDynamicRemotes } = await import(
						"../../../modules/dynamicModuleLoader"
					);
					await registerDynamicRemotes(loginData.modulosActivos);
				}

				const menuResponse = await dispatch(
					MenuApi.endpoints.getMenuSistema.initiate(),
				).unwrap();

				dispatch(
					menuReceived({
						nombreSistema: menuResponse.nombreSistema,
						menuRaiz: menuResponse.menuRaiz,
					}),
				);

				onSuccess?.();
			} catch {
				toast.error("Error al cargar el menú del sistema.");
			}
		},
		[dispatch, onSuccess],
	);

	return finishLogin;
};
