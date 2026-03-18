import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { MenuItem } from "../api/auth/auth.types";

type MenuState = {
	nombreSistema: string;
	codigoSistema: string;
	menuRaiz: MenuItem[];
};

const initialState: MenuState = {
	nombreSistema: "",
	codigoSistema: "",
	menuRaiz: [],
};

const menuSlice = createSlice({
	name: "menu",
	initialState,
	reducers: {
		menuReceived(
			state,
			action: PayloadAction<{ nombreSistema: string; codigoSistema?: string; menuRaiz: MenuItem[] }>,
		) {
			state.nombreSistema = action.payload.nombreSistema;
			state.codigoSistema = action.payload.codigoSistema || "";
			state.menuRaiz = action.payload.menuRaiz;
			// localStorage.setItem("menu_nombreSistema", action.payload.nombreSistema);
			// localStorage.setItem(
			// 	"menu_menuRaiz",
			// 	JSON.stringify(action.payload.menuRaiz),
			// );
		},
		resetMenu(state) {
			state.nombreSistema = "";
			state.codigoSistema = "";
			state.menuRaiz = [];
		},
	},
});

export const { menuReceived, resetMenu } = menuSlice.actions;

export const selectCodigoSistema = (state: { menu: MenuState }) =>
	state.menu.codigoSistema;

export default menuSlice.reducer;
