import { selectModulosActivos, useAppSelector } from "mf_store/store";
import type { MenuItem } from "../types/menu";

export const useMenu = () => {
	const menuData = useAppSelector((state: { menu: unknown }) => state.menu) as {
		menuRaiz?: MenuItem[];
		nombreSistema?: string;
	} | null;

	const modulosActivos = useAppSelector(selectModulosActivos);
	const hasContabilidad = modulosActivos.some(
		(m) => m.mfName === "mf_contabilidad",
	);

	return {
		menu: hasContabilidad ? menuData?.menuRaiz || null : null,
		nombreSistema: menuData?.nombreSistema || "",
	};
};
