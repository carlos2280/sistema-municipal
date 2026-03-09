import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	MenuApi,
	menuReceived,
	useAppDispatch,
} from "mf_store/store";

/**
 * Handles post-authentication: register dynamic remotes, fetch menu, navigate.
 * Single Responsibility: only the "finish login" side effects.
 */
export const useLoginFinish = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const finishLogin = useCallback(
		// biome-ignore lint/suspicious/noExplicitAny: login data inferred from MF-federated module
		async (loginData: any) => {
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

			toast.success("Login exitoso");
			navigate("/");
		},
		[dispatch, navigate],
	);

	return finishLogin;
};
