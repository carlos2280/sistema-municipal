// ═══════════════════════════════════════════════════════════════
//  MERIDIAN — Theme Exports
// ═══════════════════════════════════════════════════════════════

// Tokens
export {
  spacing,
  radii,
  shadowsDark,
  shadowsLight,
  fontFamily,
  fontFeatures,
  zIndex,
  breakpoints,
  transitions,
  semanticColors,
} from './tokens';

// Theme factory & types
export {
  MODULE_ACCENTS,
  getContrastText,
  getMeridianTheme,
  createMeridianTheme,
  getModuleThemeOverrides,
} from './theme';
export type { ModuleCode, MeridianTokens } from './theme';

// Provider & hooks
export {
  ThemeContext,
  ThemeProvider,
  useTheme,
  useToggleTheme,
} from './ThemeProvider';
export type {
  MeridianPreferences,
  TextSize,
  TableDensity,
} from './ThemeProvider';
