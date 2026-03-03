import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface TenantState {
	tenantId: number | null;
	tenantSlug: string | null;
	nombre: string | null;
	logoUrl: string | null;
	tema: Record<string, unknown> | null;
	resolved: boolean;
}

const initialState: TenantState = {
	tenantId: null,
	tenantSlug: null,
	nombre: null,
	logoUrl: null,
	tema: null,
	resolved: false,
};

const tenantSlice = createSlice({
	name: "tenant",
	initialState,
	reducers: {
		tenantReceived(
			state,
			action: PayloadAction<{
				tenantId?: number;
				tenantSlug: string;
				nombre?: string;
				logoUrl?: string | null;
				tema?: Record<string, unknown> | null;
			}>,
		) {
			if (action.payload.tenantId !== undefined) {
				state.tenantId = action.payload.tenantId;
			}
			state.tenantSlug = action.payload.tenantSlug;
			state.nombre = action.payload.nombre ?? null;
			state.logoUrl = action.payload.logoUrl ?? null;
			state.tema = action.payload.tema ?? null;
			state.resolved = true;
		},
		tenantCleared(state) {
			state.tenantId = null;
			state.tenantSlug = null;
			state.nombre = null;
			state.logoUrl = null;
			state.tema = null;
			state.resolved = false;
		},
	},
});

export const { tenantReceived, tenantCleared } = tenantSlice.actions;

// Selectores
export const selectResolvedTenantId = (state: { tenant: TenantState }) =>
	state.tenant.tenantId;
export const selectResolvedTenantSlug = (state: { tenant: TenantState }) =>
	state.tenant.tenantSlug;
export const selectTenantNombre = (state: { tenant: TenantState }) =>
	state.tenant.nombre;
export const selectTenantLogoUrl = (state: { tenant: TenantState }) =>
	state.tenant.logoUrl;
export const selectTenantTema = (state: { tenant: TenantState }) =>
	state.tenant.tema;
export const selectTenantResolved = (state: { tenant: TenantState }) =>
	state.tenant.resolved;

export default tenantSlice.reducer;
export type { TenantState };
