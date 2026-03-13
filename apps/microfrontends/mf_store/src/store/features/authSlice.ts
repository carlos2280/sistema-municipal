import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AuthState {
	accessToken: string | null;
	isAuthenticated: boolean;
	sistemaId: number | null;
	areaId: number | null;
	usuarioId: number | null;
	tenantId: number | null;
	tenantSlug: string | null;
	email: string | null;
	nombreCompleto: string | null;
	mfaPending: boolean;
	mfaPendingUserId: number | null;
}

const initialState: AuthState = {
	accessToken: null,
	isAuthenticated: false,
	sistemaId: null,
	areaId: null,
	usuarioId: null,
	tenantId: null,
	tenantSlug: null,
	email: null,
	nombreCompleto: null,
	mfaPending: false,
	mfaPendingUserId: null,
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
				tenantId?: number;
				tenantSlug?: string;
				email?: string;
				nombreCompleto?: string;
			}>,
		) => {
			state.accessToken = action.payload.accessToken;
			state.isAuthenticated = true;
			state.mfaPending = false;
			state.mfaPendingUserId = null;
			if (action.payload.sistemaId) {
				state.sistemaId = action.payload.sistemaId;
			}
			if (action.payload.areaId) {
				state.areaId = action.payload.areaId;
			}
			if (action.payload.usuarioId) {
				state.usuarioId = action.payload.usuarioId;
			}
			if (action.payload.tenantId) {
				state.tenantId = action.payload.tenantId;
			}
			if (action.payload.tenantSlug) {
				state.tenantSlug = action.payload.tenantSlug;
			}
			if (action.payload.email) {
				state.email = action.payload.email;
			}
			if (action.payload.nombreCompleto) {
				state.nombreCompleto = action.payload.nombreCompleto;
			}
		},
		mfaPendingSet: (state, action: PayloadAction<number>) => {
			state.mfaPending = true;
			state.mfaPendingUserId = action.payload;
		},
		loggedOut: (state) => {
			state.accessToken = null;
			state.isAuthenticated = false;
			state.sistemaId = null;
			state.areaId = null;
			state.usuarioId = null;
			state.tenantId = null;
			state.tenantSlug = null;
			state.email = null;
			state.nombreCompleto = null;
			state.mfaPending = false;
			state.mfaPendingUserId = null;
		},
	},
});

export const { tokenReceived, loggedOut, mfaPendingSet } = authSlice.actions;

// Selectores
export const selectSistemaId = (state: { auth: AuthState }) =>
	state.auth.sistemaId;
export const selectAreaId = (state: { auth: AuthState }) => state.auth.areaId;
export const selectUsuarioId = (state: { auth: AuthState }) =>
	state.auth.usuarioId;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
	state.auth.isAuthenticated;
export const selectTenantId = (state: { auth: AuthState }) =>
	state.auth.tenantId;
export const selectTenantSlug = (state: { auth: AuthState }) =>
	state.auth.tenantSlug;
export const selectEmail = (state: { auth: AuthState }) => state.auth.email;
export const selectNombreCompleto = (state: { auth: AuthState }) =>
	state.auth.nombreCompleto;
export const selectMfaPending = (state: { auth: AuthState }) =>
	state.auth.mfaPending;
export const selectMfaPendingUserId = (state: { auth: AuthState }) =>
	state.auth.mfaPendingUserId;

export default authSlice.reducer;
export type { AuthState };
