import type { MenuSistema } from "../../types/menu";
import { baseApi } from "./baseApi";

export const MenuApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getMenuSistema: builder.query<MenuSistema, void>({
			query: () => "autorizacion/menu-sistema",
		}),
	}),
	overrideExisting: false,
});

export const { useGetMenuSistemaQuery } = MenuApi;
