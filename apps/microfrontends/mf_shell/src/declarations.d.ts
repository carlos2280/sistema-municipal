// ─── Module Federation declarations ──────────────────────────────
// MUI Theme augmentation (MERIDIAN) → ver mui-theme.d.ts

declare module "mf_ui/theme" {
	import type { ReactNode, ComponentType } from "react";
	import type { Theme } from "@mui/material/styles";

	export type ModuleCode =
		| "home"
		| "contabilidad"
		| "tesoreria"
		| "rrhh"
		| "obras"
		| "catastro"
		| "config"
		| "chat";

	export const MODULE_ACCENTS: Record<
		ModuleCode,
		{ main: string; rgb: string; tint: string; name: string }
	>;

	export function getContrastText(hex: string): "#000" | "#fff";

	export const ThemeProvider: ComponentType<{ children: ReactNode }>;
	export const ThemeContext: React.Context<{
		toggleTheme: () => void;
		isDarkTheme: boolean;
	}>;
	export const useTheme: () => {
		isDarkMode: boolean;
		toggleDarkMode: () => void;
		toggleTheme: () => void;
		theme: Theme;
		preferences: {
			mode: "light" | "dark" | "system";
			activeModule: ModuleCode;
			textSize: "small" | "medium" | "large";
			tableDensity: "compact" | "normal" | "relaxed";
		};
		activeModule: ModuleCode;
		setActiveModule: (code: ModuleCode) => void;
		setMode: (mode: "light" | "dark" | "system") => void;
		setTextSize: (size: "small" | "medium" | "large") => void;
		setTableDensity: (density: "compact" | "normal" | "relaxed") => void;
		resetToDefaults: () => void;
		isDarkTheme: boolean;
	};
	export const lightTheme: Theme;
	export const darkTheme: Theme;
}

declare module "mf_ui/components" {
	import type { FC, ReactNode } from "react";

	export const ThemeCustomizer: FC<{ open: boolean; onClose: () => void }>;
	export const PageHeader: FC<{ title: string; subtitle?: string }>;
	export const AppLoader: FC;
	export const EmptyState: FC<{ message: string; icon?: ReactNode }>;

	// ── Átomos ──────────────────────────────────────────────────────────────
	export const MeridianLogo: FC<{
		size?: "xs" | "sm" | "md" | "lg" | "xl";
		color?: string;
		className?: string;
	}>;
	export const ClockDisplay: FC<{
		format?: "12h" | "24h";
		showSeconds?: boolean;
		updateInterval?: number;
		className?: string;
	}>;
	export const StatusDot: FC<{
		color?: "success" | "warning" | "error" | "info" | "neutral";
		size?: "small" | "medium" | "large";
		pulse?: boolean;
		label?: string;
	}>;
	export const Badge: FC<{
		children: ReactNode;
		variant?: "filled" | "outlined" | "soft";
		color?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";
		size?: "small" | "medium" | "large";
		startIcon?: ReactNode;
		endIcon?: ReactNode;
		pill?: boolean;
		pulse?: boolean;
		className?: string;
	}>;
	export const SkeletonPage: FC<{ variant?: string }>;
	export interface StatusChipProps {
		variant: "pendiente" | "urgente" | "en-revision" | "aprobado";
		label: string;
		icon?: ReactNode;
	}
	export const StatusChip: FC<StatusChipProps>;

	// ── Moléculas ────────────────────────────────────────────────────────────
	export const UserAvatar: FC<{
		name?: string;
		src?: string;
		size?: "xs" | "sm" | "md" | "lg" | "xl";
		status?: "online" | "offline" | "away" | "busy";
		showName?: boolean;
		subtitle?: string;
		color?: string;
		icon?: ReactNode;
		onClick?: () => void;
	}>;
	export interface WelcomeCardProps {
		greeting: string;
		message: string;
		badges?: Array<{ label: string; dot?: boolean }>;
		time?: string;
		date?: string;
	}
	export const WelcomeCard: FC<WelcomeCardProps>;
	export interface KpiCardProps {
		label: string;
		value: string;
		icon: ReactNode;
		iconColor?: string;
		trend?: { value: string; direction: "up" | "down" | "neutral" };
		trendLabel?: string;
		progress?: { value: number; label: string };
		featured?: boolean;
		animationDelay?: string;
	}
	export const KpiCard: FC<KpiCardProps>;
	export interface TaskCardProps {
		title: string;
		module: string;
		status: ReactNode;
		time: string;
		due?: string;
		dueVariant?: string;
		dotColor: string;
		onClick?: () => void;
	}
	export const TaskCard: FC<TaskCardProps>;
	export interface QuickStatItem {
		label: string;
		value: string;
	}
	export interface QuickStatsCardProps {
		title: string;
		items: QuickStatItem[];
	}
	export const QuickStatsCard: FC<QuickStatsCardProps>;

	// ── Organismos ───────────────────────────────────────────────────────────
	export interface ActivityItem {
		id: string;
		user: string;
		action: string;
		target: string;
		time: string;
		dotColor: "success" | "info" | "warning" | "error";
	}
	export interface ActivityFeedProps {
		title?: string;
		items: ActivityItem[];
		onViewAll?: () => void;
	}
	export const ActivityFeed: FC<ActivityFeedProps>;
	export interface ChartBarData {
		label: string;
		budget: number;
		executed: number;
	}
	export interface BudgetChartProps {
		title: string;
		subtitle?: string;
		data: ChartBarData[];
		summary: { budgeted: string; executed: string; percentage: string };
	}
	export const BudgetChart: FC<BudgetChartProps>;
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
