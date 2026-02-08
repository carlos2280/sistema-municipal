declare module "mf_ui/theme" {
	import type { ReactNode, ComponentType } from "react";

	export const ThemeProvider: ComponentType<{ children: ReactNode }>;
	export const ThemeContext: React.Context<{
		toggleTheme: () => void;
		isDarkTheme: boolean;
	}>;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	export const lightTheme: any; // Puedes tipar esto mejor
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	export const darkTheme: any; // Puedes tipar esto mejor
}

declare module "mf_contabilidad/routes" {
	const routes: RouteObject | RouteObject[];
	export default routes;
}

declare module "mf_chat/routes" {
	import type { RouteObject } from "react-router-dom";
	const routes: RouteObject[];
	export default routes;
}

declare module "mf_chat/ChatPanel" {
	import type { FC } from "react";
	interface ChatPanelProps {
		activeConversationId?: number;
	}
	export const ChatPanel: FC<ChatPanelProps>;
}

declare module "mf_chat/ChatButton" {
	import type { FC } from "react";
	interface ChatButtonProps {
		unreadCount?: number;
		onClick?: () => void;
	}
	export const ChatButton: FC<ChatButtonProps>;
}

declare module "mf_chat/components" {
	import type { FC } from "react";
	export const ChatPage: FC;
	export const VideoCallPage: FC;
}

declare module "mf_chat/ChatDrawer" {
	import type { FC } from "react";
	interface ChatDrawerProps {
		open: boolean;
		onClose: () => void;
	}
	export const ChatDrawer: FC<ChatDrawerProps>;
}

// declare module "mf_store/store" {
// 	import type { Store } from "redux";
// 	import type { Persistor } from "redux-persist";
// 	import type { MutationHook, QueryHook } from "@reduxjs/toolkit/query/react";
// 	import type { PayloadAction } from "@reduxjs/toolkit";
// 	import type { TypedUseSelectorHook } from "react-redux";

// 	// Generic types for Queries and Mutations
// 	export type GenericMutationHook<Req, Res> = MutationHook<Req, Res>;
// 	export type GenericQueryHook<Res> = QueryHook<void, Res>;
// 	export type GenericQueryHookWithArgs<Req, Res> = QueryHook<Req, Res>;

// 	// Store
// 	export const createStore: () => {
// 		store: Store;
// 		persistor: Persistor;
// 	};

// 	// Redux hooks
// 	export const useAppDispatch: () => unknown; // Puedes reemplazar 'unknown' por AppDispatch si lo importas
// 	export const useAppSelector: TypedUseSelectorHook<unknown>; // Igual, reemplazar 'unknown' por RootState

// 	// Example of exposed API hooks (replace or expand with yours)
// 	export const useLoginMutation: GenericMutationHook<unknown, unknown>;
// 	export const useLoginAreasMutation: GenericMutationHook<unknown, unknown>;
// 	export const useLoginSistemasMutation: GenericMutationHook<unknown, unknown>;
// 	export const useVerficarTokenQuery: GenericQueryHook<unknown>;
// 	export const useContrasenaTemporalQuery: GenericQueryHook<unknown>;
// 	export const useCambiarContrasenaTemporalMutation: GenericMutationHook<
// 		unknown,
// 		unknown
// 	>;

// 	// Example Actions (replace with real ones)
// 	export const tokenReceived: (token: string) => PayloadAction<string>;
// 	export const loggedOut: () => PayloadAction<void>;
// 	export const menuReceived: (menu: unknown[]) => PayloadAction<unknown[]>;
// 	export const resetMenu: () => PayloadAction<void>;

// 	// Generic API exports
// 	export const MenuApi: unknown; // Descomentar si tienes MenuApi
// }
// declare module "@reduxjs/toolkit/query/react" {
// 	export * from "@reduxjs/toolkit/dist/query/react";
// }

// declare module "@reduxjs/toolkit/query" {
// 	export * from "@reduxjs/toolkit/dist/query";
// }
// src/types/redux.d.ts
// import type {
// 	AppDispatch,
// 	AppPersistor,
// 	AppStore,
// 	RootState,
// } from "mf_store/store";

// declare module "shared-redux-types" {
// 	export type SharedRootState = RootState;
// 	export type SharedAppDispatch = AppDispatch;
// 	export type SharedAppStore = AppStore;
// 	export type SharedAppPersistor = AppPersistor;
// }

// // Extiende los tipos de Redux para que reconozca tus slices
// declare module "@reduxjs/toolkit" {
// 	interface SerializedError {
// 		code?: string;
// 		status?: number;
// 	}
// }
