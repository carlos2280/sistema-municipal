import { baseApi } from "../base/baseApi";
import type { MenuSistema } from "./platform.types";

export const MenuApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getMenuSistema: builder.query<MenuSistema, void>({
			query: () => "autorizacion/menu-sistema",
		}),
	}),
	overrideExisting: false,
});

export const { useGetMenuSistemaQuery } = MenuApi;
