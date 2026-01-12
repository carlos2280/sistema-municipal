import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { MenuItem } from "../../types/login";

type MenuState = {
	nombreSistema: string;
	menuRaiz: MenuItem[];
};

const initialState: MenuState = {
	nombreSistema: "",
	menuRaiz: [],
};

const menuSlice = createSlice({
	name: "menu",
	initialState,
	reducers: {
		menuReceived(
			state,
			action: PayloadAction<{ nombreSistema: string; menuRaiz: MenuItem[] }>,
		) {
			state.nombreSistema = action.payload.nombreSistema;
			state.menuRaiz = action.payload.menuRaiz;
			// localStorage.setItem("menu_nombreSistema", action.payload.nombreSistema);
			// localStorage.setItem(
			// 	"menu_menuRaiz",
			// 	JSON.stringify(action.payload.menuRaiz),
			// );
		},
		resetMenu(state) {
			state.nombreSistema = "";
			state.menuRaiz = [];
		},
	},
});

export const { menuReceived, resetMenu } = menuSlice.actions;
export default menuSlice.reducer;
