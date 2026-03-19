/**
 * ═══════════════════════════════════════════════════════════════
 *  MERIDIAN — Theme Provider
 *
 *  Proporciona el tema MERIDIAN a toda la aplicación con soporte para:
 *  - Modo claro/oscuro/system
 *  - Módulo activo (accent color por módulo)
 *  - Tamaño de texto (S/M/L)
 *  - Densidad de tabla (compact/normal/relaxed)
 *  - Persistencia en localStorage
 * ═══════════════════════════════════════════════════════════════
 */

import {
	CssBaseline,
	ThemeProvider as MuiThemeProvider,
	type Theme,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import {
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	MODULE_ACCENTS,
	type ModuleCode,
	getMeridianTheme,
	getModuleThemeOverrides,
} from "./theme";

// ─── Types ───────────────────────────────────────────────────────

export type TextSize = "small" | "medium" | "large";
export type TableDensity = "compact" | "normal" | "relaxed";

export interface MeridianPreferences {
	mode: "light" | "dark" | "system";
	activeModule: ModuleCode;
	textSize: TextSize;
	tableDensity: TableDensity;
}

interface ThemeContextType {
	theme: Theme;
	preferences: MeridianPreferences;
	isDarkMode: boolean;
	activeModule: ModuleCode;

	// Acciones
	toggleDarkMode: () => void;
	setMode: (mode: MeridianPreferences["mode"]) => void;
	setActiveModule: (code: ModuleCode) => void;
	setTextSize: (size: TextSize) => void;
	setTableDensity: (density: TableDensity) => void;
	resetToDefaults: () => void;

	// Legacy aliases (ToggleThemeButton usa estos via useContext directo)
	isDarkTheme: boolean;
	toggleTheme: () => void;
}

// ─── Defaults ────────────────────────────────────────────────────

const STORAGE_KEY = "meridian-theme-preferences";

const defaultPreferences: MeridianPreferences = {
	mode: "dark",
	activeModule: "home",
	textSize: "medium",
	tableDensity: "normal",
};

// ─── Context ─────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType | null>(null);

// ─── Hooks ───────────────────────────────────────────────────────

export function useTheme(): ThemeContextType {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme debe usarse dentro de un ThemeProvider");
	}
	return context;
}

/** Hook legacy para compatibilidad (solo toggle) */
export function useToggleTheme() {
	const { isDarkMode, toggleDarkMode } = useTheme();
	return { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode };
}

// ─── Helpers ─────────────────────────────────────────────────────

function getSystemPreference(): "light" | "dark" {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function isValidModuleCode(code: unknown): code is ModuleCode {
	return typeof code === "string" && code in MODULE_ACCENTS;
}

function loadPreferences(): MeridianPreferences {
	if (typeof window === "undefined") return defaultPreferences;
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			const parsed = { ...defaultPreferences, ...JSON.parse(saved) };
			// Validate activeModule against MODULE_ACCENTS keys
			if (!isValidModuleCode(parsed.activeModule)) {
				parsed.activeModule = defaultPreferences.activeModule;
			}
			return parsed;
		}
	} catch {
		// silently fall through
	}
	return defaultPreferences;
}

function savePreferences(prefs: MeridianPreferences): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
	} catch {
		// silently ignore
	}
}

// ─── Text Size multipliers ───────────────────────────────────────

const TEXT_SIZE_MAP: Record<TextSize, number> = {
	small: 12,
	medium: 13.5,
	large: 15,
};

// ─── Table Density row heights ───────────────────────────────────

const TABLE_DENSITY_MAP: Record<TableDensity, number> = {
	compact: 36,
	normal: 44,
	relaxed: 52,
};

// ─── Provider Component ──────────────────────────────────────────

export function ThemeProvider({ children }: PropsWithChildren) {
	const [preferences, setPreferences] =
		useState<MeridianPreferences>(loadPreferences);
	const [systemPref, setSystemPref] = useState<"light" | "dark">(
		getSystemPreference,
	);

	// Escuchar cambios en preferencia del sistema
	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) =>
			setSystemPref(e.matches ? "dark" : "light");
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	// Modo efectivo
	const effectiveMode =
		preferences.mode === "system" ? systemPref : preferences.mode;
	const isDarkMode = effectiveMode === "dark";

	// Construir theme
	const theme = useMemo(() => {
		const baseOptions = getMeridianTheme(effectiveMode);
		const moduleOverrides = getModuleThemeOverrides(preferences.activeModule);

		// Merge base + module accent + text size + table density
		const merged = createTheme({
			...baseOptions,
			palette: {
				...baseOptions.palette,
				...moduleOverrides.palette,
			},
			typography: {
				...baseOptions.typography,
				fontSize: TEXT_SIZE_MAP[preferences.textSize],
			},
			meridian: {
				...(baseOptions.meridian as object),
				...(moduleOverrides.meridian as object),
			},
			components: {
				...baseOptions.components,
				MuiTableRow: {
					...baseOptions.components?.MuiTableRow,
					styleOverrides: {
						root: {
							height: TABLE_DENSITY_MAP[preferences.tableDensity],
							"&:last-child td": { borderBottom: "none" },
						},
					},
				},
			},
		});

		return merged;
	}, [
		effectiveMode,
		preferences.activeModule,
		preferences.textSize,
		preferences.tableDensity,
	]);

	// Persistir
	useEffect(() => {
		savePreferences(preferences);
	}, [preferences]);

	// Aura — cambiar body background tint + CSS custom properties según módulo
	useEffect(() => {
		const mod = MODULE_ACCENTS[preferences.activeModule] ?? MODULE_ACCENTS.home;
		const root = document.documentElement;

		document.body.setAttribute("data-module", preferences.activeModule);

		// CSS variables globales para accent dinámico (usadas por layout MERIDIAN)
		root.style.setProperty("--accent", mod.main);
		root.style.setProperty("--accent-rgb", mod.rgb);
		root.style.setProperty("--ground-tint", mod.tint);

		if (isDarkMode) {
			document.body.style.backgroundColor = mod.tint;
			document.body.style.transition = "background-color 500ms ease";
		} else {
			document.body.style.backgroundColor = "";
		}
	}, [preferences.activeModule, isDarkMode]);

	// ─── Actions ─────────────────────────────────────────────────

	const toggleDarkMode = useCallback(() => {
		setPreferences((p) => ({
			...p,
			mode: p.mode === "dark" ? "light" : p.mode === "light" ? "dark" : "dark",
		}));
	}, []);

	const setMode = useCallback((mode: MeridianPreferences["mode"]) => {
		setPreferences((p) => ({ ...p, mode }));
	}, []);

	const setActiveModule = useCallback((code: ModuleCode) => {
		const validCode = isValidModuleCode(code) ? code : "home";
		setPreferences((p) => ({ ...p, activeModule: validCode }));
	}, []);

	const setTextSize = useCallback((size: TextSize) => {
		setPreferences((p) => ({ ...p, textSize: size }));
	}, []);

	const setTableDensity = useCallback((density: TableDensity) => {
		setPreferences((p) => ({ ...p, tableDensity: density }));
	}, []);

	const resetToDefaults = useCallback(() => {
		setPreferences(defaultPreferences);
	}, []);

	// ─── Context Value ───────────────────────────────────────────

	const contextValue: ThemeContextType = useMemo(
		() => ({
			theme,
			preferences,
			isDarkMode,
			activeModule: preferences.activeModule,
			toggleDarkMode,
			setMode,
			setActiveModule,
			setTextSize,
			setTableDensity,
			resetToDefaults,
			// Legacy aliases
			isDarkTheme: isDarkMode,
			toggleTheme: toggleDarkMode,
		}),
		[
			theme,
			preferences,
			isDarkMode,
			toggleDarkMode,
			setMode,
			setActiveModule,
			setTextSize,
			setTableDensity,
			resetToDefaults,
		],
	);

	return (
		<ThemeContext.Provider value={contextValue}>
			<MuiThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</MuiThemeProvider>
		</ThemeContext.Provider>
	);
}

export { ThemeContext };
export default ThemeProvider;
