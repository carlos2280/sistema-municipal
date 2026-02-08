import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
	FLUSH,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
	REHYDRATE,
	persistReducer,
	persistStore,
} from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import { authApi } from "./api/authApi";
import { baseApi } from "./api/baseApi";
import authReducer from "./features/authSlice";
import menuReducer from "./features/menuSlice";

const menuPersistConfig = {
	key: "menu",
	storage: storageSession,
	whitelist: ["nombreSistema", "menuRaiz"],
};
const authPersistConfig = {
	key: "autorizacion",
	storage: storageSession,
	whitelist: ["isAuthenticated", "sistemaId", "areaId", "usuarioId"],
};
const rootReducer = combineReducers({
	[authApi.reducerPath]: authApi.reducer,
	[baseApi.reducerPath]: baseApi.reducer,
	auth: persistReducer(authPersistConfig, authReducer),
	menu: persistReducer(menuPersistConfig, menuReducer),
});

export function createStore(
	preloadedState?: Partial<ReturnType<typeof rootReducer>>,
) {
	const store = configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: {
					ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
				},
			}).concat([authApi.middleware, baseApi.middleware]),
		preloadedState,
	});

	const persistor = persistStore(store);
	return { store, persistor };
}

export type AppStore = ReturnType<typeof createStore>["store"];
export type AppPersistor = ReturnType<typeof createStore>["persistor"];
export type RootState = ReturnType<
	ReturnType<typeof createStore>["store"]["getState"]
>;
export type AppDispatch = AppStore["dispatch"];
