import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface TenantState {
	tenantId: number | null;
	tenantSlug: string | null;
}

const initialState: TenantState = {
	tenantId: null,
	tenantSlug: null,
};

const tenantSlice = createSlice({
	name: "tenant",
	initialState,
	reducers: {
		tenantReceived(
			state,
			action: PayloadAction<{ tenantId: number; tenantSlug: string }>,
		) {
			state.tenantId = action.payload.tenantId;
			state.tenantSlug = action.payload.tenantSlug;
		},
		tenantCleared(state) {
			state.tenantId = null;
			state.tenantSlug = null;
		},
	},
});

export const { tenantReceived, tenantCleared } = tenantSlice.actions;

// Selectores (prefijo "Resolved" para distinguir del authSlice que tiene selectTenantId/Slug)
export const selectResolvedTenantId = (state: { tenant: TenantState }) =>
	state.tenant.tenantId;
export const selectResolvedTenantSlug = (state: { tenant: TenantState }) =>
	state.tenant.tenantSlug;

export default tenantSlice.reducer;
export type { TenantState };
