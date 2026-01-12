import { useAppSelector } from "mf_store/store";
import type { MenuItem } from "../types/menu";

export const useMenu = () => {
	const menuData = useAppSelector((state: { menu: unknown }) => state.menu) as {
		menuRaiz?: MenuItem[];
		nombreSistema?: string;
	} | null;

	return {
		menu: menuData?.menuRaiz || null,
		nombreSistema: menuData?.nombreSistema || "",
	};
};
