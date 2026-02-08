import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AuthState {
	accessToken: string | null;
	isAuthenticated: boolean;
	sistemaId: number | null;
	areaId: number | null;
	usuarioId: number | null;
}

const initialState: AuthState = {
	accessToken: null,
	isAuthenticated: false,
	sistemaId: null,
	areaId: null,
	usuarioId: null,
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
				usuarioId?: number;
			}>,
		) => {
			state.accessToken = action.payload.accessToken;
			state.isAuthenticated = true;
			if (action.payload.sistemaId) {
				state.sistemaId = action.payload.sistemaId;
				localStorage.setItem("sistemaId", String(action.payload.sistemaId));
			}
			if (action.payload.areaId) {
				state.areaId = action.payload.areaId;
				localStorage.setItem("areaId", String(action.payload.areaId));
			}
			if (action.payload.usuarioId) {
				state.usuarioId = action.payload.usuarioId;
				localStorage.setItem("usuarioId", String(action.payload.usuarioId));
			}
		},
		loggedOut: (state) => {
			state.accessToken = null;
			state.isAuthenticated = false;
			state.sistemaId = null;
			state.areaId = null;
			state.usuarioId = null;
			localStorage.removeItem("sistemaId");
			localStorage.removeItem("areaId");
			localStorage.removeItem("usuarioId");
		},
	},
});

export const { tokenReceived, loggedOut } = authSlice.actions;

// Selectores
export const selectSistemaId = (state: { auth: AuthState }) =>
	state.auth.sistemaId;
export const selectAreaId = (state: { auth: AuthState }) => state.auth.areaId;
export const selectUsuarioId = (state: { auth: AuthState }) =>
	state.auth.usuarioId;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
	state.auth.isAuthenticated;

export default authSlice.reducer;
export type { AuthState };
