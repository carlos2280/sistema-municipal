import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface ActiveModule {
	codigo: string;
	nombre: string;
	mfName: string | null;
	mfManifestUrlTpl: string | null;
	icono: string | null;
	apiPrefix: string;
}

interface SubscriptionsState {
	modulosActivos: ActiveModule[];
}

const initialState: SubscriptionsState = {
	modulosActivos: [],
};

const subscriptionsSlice = createSlice({
	name: "subscriptions",
	initialState,
	reducers: {
		modulosReceived(state, action: PayloadAction<ActiveModule[]>) {
			state.modulosActivos = action.payload;
		},
		modulosCleared(state) {
			state.modulosActivos = [];
		},
	},
});

export const { modulosReceived, modulosCleared } = subscriptionsSlice.actions;

// Selectores
export const selectModulosActivos = (state: {
	subscriptions: SubscriptionsState;
}) => state.subscriptions.modulosActivos;

export const selectIsModuleActive = (
	state: { subscriptions: SubscriptionsState },
	codigo: string,
) => state.subscriptions.modulosActivos.some((m) => m.codigo === codigo);

export default subscriptionsSlice.reducer;
export type { SubscriptionsState };
