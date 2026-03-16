import { selectModulosActivos, useAppSelector } from "mf_store/store";
import type { ModuleInfo } from "../modules/dynamicModuleLoader";
import type { MenuItem } from "../types/menu";

export const useMenu = () => {
	const menuData = useAppSelector((state: { menu: unknown }) => state.menu) as {
		menuRaiz?: MenuItem[];
		nombreSistema?: string;
	} | null;

	const modulosActivos = useAppSelector(selectModulosActivos) as ModuleInfo[];
	const hasAnyMf = modulosActivos.some((m) => !!m.mfName);

	return {
		menu: hasAnyMf ? menuData?.menuRaiz || null : null,
		nombreSistema: menuData?.nombreSistema || "",
	};
};
