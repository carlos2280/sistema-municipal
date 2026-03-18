import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UiState {
	drawerOpen: boolean;
}

const initialState: UiState = {
	drawerOpen: false,
};

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		setDrawerOpen(state, action: PayloadAction<boolean>) {
			state.drawerOpen = action.payload;
		},
	},
});

export const { setDrawerOpen } = uiSlice.actions;

export const selectDrawerOpen = (state: { ui: UiState }) => state.ui.drawerOpen;

export default uiSlice.reducer;
