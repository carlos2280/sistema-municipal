/**
 * Theme Provider - Sistema Municipal CrisCar
 *
 * Proporciona el tema a toda la aplicación con soporte para:
 * - Modo claro/oscuro
 * - Colores personalizables por el usuario
 * - Presets de temas predefinidos
 * - Persistencia de preferencias
 */

import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  type Theme,
} from "@mui/material";
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createCustomTheme, type CustomThemeConfig } from "./createCustomTheme";
import { colorPresets, type ColorPreset } from "./tokens";

// ============================================================================
// TYPES
// ============================================================================

export interface ThemePreferences {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  presetName?: string;
  borderRadius: "sharp" | "default" | "rounded" | "pill";
  fontScale: "compact" | "default" | "comfortable";
}

interface ThemeContextType {
  // Estado
  theme: Theme;
  preferences: ThemePreferences;
  isDarkMode: boolean;
  availablePresets: ColorPreset[];

  // Acciones
  toggleDarkMode: () => void;
  setMode: (mode: "light" | "dark" | "system") => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  applyPreset: (presetName: string) => void;
  setBorderRadius: (style: ThemePreferences["borderRadius"]) => void;
  setFontScale: (scale: ThemePreferences["fontScale"]) => void;
  resetToDefaults: () => void;
}

// ============================================================================
// DEFAULTS
// ============================================================================

const STORAGE_KEY = "criscar-theme-preferences";

const defaultPreset = colorPresets[0]; // CrisCar default

const defaultPreferences: ThemePreferences = {
  mode: "light",
  primaryColor: defaultPreset.primary,
  secondaryColor: defaultPreset.secondary,
  accentColor: defaultPreset.accent,
  presetName: defaultPreset.name,
  borderRadius: "default",
  fontScale: "default",
};

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextType | null>(null);

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook para acceder al contexto del tema
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
}

/**
 * Hook legacy para compatibilidad (solo toggle)
 */
export function useToggleTheme() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  return { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Detecta la preferencia del sistema operativo
 */
function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Carga las preferencias desde localStorage
 */
function loadPreferences(): ThemePreferences {
  if (typeof window === "undefined") return defaultPreferences;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultPreferences, ...parsed };
    }
  } catch (error) {
    console.warn("[Theme] Error cargando preferencias:", error);
  }

  return defaultPreferences;
}

/**
 * Guarda las preferencias en localStorage
 */
function savePreferences(preferences: ThemePreferences): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn("[Theme] Error guardando preferencias:", error);
  }
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function ThemeProvider({ children }: PropsWithChildren) {
  // Estado de preferencias
  const [preferences, setPreferences] = useState<ThemePreferences>(loadPreferences);

  // Detectar preferencia del sistema
  const [systemPreference, setSystemPreference] = useState<"light" | "dark">(
    getSystemPreference
  );

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Calcular el modo efectivo
  const effectiveMode = useMemo(() => {
    if (preferences.mode === "system") {
      return systemPreference;
    }
    return preferences.mode;
  }, [preferences.mode, systemPreference]);

  const isDarkMode = effectiveMode === "dark";

  // Crear tema basado en preferencias
  const theme = useMemo(() => {
    return createCustomTheme({
      primaryColor: preferences.primaryColor,
      secondaryColor: preferences.secondaryColor,
      accentColor: preferences.accentColor,
      mode: effectiveMode,
      borderRadius: preferences.borderRadius,
      fontScale: preferences.fontScale,
    });
  }, [preferences, effectiveMode]);

  // Persistir cambios
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const toggleDarkMode = useCallback(() => {
    setPreferences((prev: ThemePreferences) => ({
      ...prev,
      mode: prev.mode === "light" ? "dark" : "light",
    }));
  }, []);

  const setMode = useCallback((mode: "light" | "dark" | "system") => {
    setPreferences((prev: ThemePreferences) => ({ ...prev, mode }));
  }, []);

  const setPrimaryColor = useCallback((color: string) => {
    setPreferences((prev: ThemePreferences) => ({
      ...prev,
      primaryColor: color,
      presetName: undefined, // Limpiar preset cuando se personaliza
    }));
  }, []);

  const setSecondaryColor = useCallback((color: string) => {
    setPreferences((prev: ThemePreferences) => ({
      ...prev,
      secondaryColor: color,
      presetName: undefined,
    }));
  }, []);

  const setAccentColor = useCallback((color: string) => {
    setPreferences((prev: ThemePreferences) => ({
      ...prev,
      accentColor: color,
      presetName: undefined,
    }));
  }, []);

  const applyPreset = useCallback((presetName: string) => {
    const preset = colorPresets.find((p) => p.name === presetName);
    if (!preset) {
      console.warn(`[Theme] Preset "${presetName}" no encontrado`);
      return;
    }

    setPreferences((prev: ThemePreferences) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      presetName: preset.name,
    }));
  }, []);

  const setBorderRadius = useCallback(
    (style: ThemePreferences["borderRadius"]) => {
      setPreferences((prev: ThemePreferences) => ({ ...prev, borderRadius: style }));
    },
    []
  );

  const setFontScale = useCallback((scale: ThemePreferences["fontScale"]) => {
    setPreferences((prev: ThemePreferences) => ({ ...prev, fontScale: scale }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setPreferences(defaultPreferences);
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: ThemeContextType = useMemo(
    () => ({
      theme,
      preferences,
      isDarkMode,
      availablePresets: colorPresets,
      toggleDarkMode,
      setMode,
      setPrimaryColor,
      setSecondaryColor,
      setAccentColor,
      applyPreset,
      setBorderRadius,
      setFontScale,
      resetToDefaults,
    }),
    [
      theme,
      preferences,
      isDarkMode,
      toggleDarkMode,
      setMode,
      setPrimaryColor,
      setSecondaryColor,
      setAccentColor,
      applyPreset,
      setBorderRadius,
      setFontScale,
      resetToDefaults,
    ]
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

// Re-export para compatibilidad con código existente
export { ThemeContext };

export default ThemeProvider;
