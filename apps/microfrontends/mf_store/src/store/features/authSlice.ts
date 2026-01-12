import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AuthState {
	accessToken: string | null;
	isAuthenticated: boolean;
	sistemaId: number | null;
	areaId: number | null;
}

const initialState: AuthState = {
	accessToken: null,
	isAuthenticated: false,
	sistemaId: null,
	areaId: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		tokenReceived: (
			state,
			action: PayloadAction<{
				accessToken: string;
				sistemaId?: number;
				areaId?: number;
			}>,
		) => {
			state.accessToken = action.payload.accessToken;
			state.isAuthenticated = true;
			if (action.payload.sistemaId) {
				state.sistemaId = action.payload.sistemaId;
				// Guardar en localStorage
				localStorage.setItem("sistemaId", String(action.payload.sistemaId));
			}
			if (action.payload.areaId) {
				state.areaId = action.payload.areaId;
				// Guardar en localStorage
				localStorage.setItem("areaId", String(action.payload.areaId));
			}
		},
		loggedOut: (state) => {
			state.accessToken = null;
			state.isAuthenticated = false;
			state.sistemaId = null;
			state.areaId = null;
			// Limpiar localStorage
			localStorage.removeItem("sistemaId");
			localStorage.removeItem("areaId");
		},
	},
});

export const { tokenReceived, loggedOut } = authSlice.actions;

// Selectores
export const selectSistemaId = (state: { auth: AuthState }) =>
	state.auth.sistemaId;
export const selectAreaId = (state: { auth: AuthState }) => state.auth.areaId;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
	state.auth.isAuthenticated;

export default authSlice.reducer;
export type { AuthState };
