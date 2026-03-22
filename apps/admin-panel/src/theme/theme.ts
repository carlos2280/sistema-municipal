import { createTheme } from '@mui/material/styles'
import { createComponentsConfig } from './components'
import {
  bordersDark,
  bordersLight,
  durations,
  easings,
  PRIMARY_COLOR,
  radii,
  semanticColorsDark,
  semanticColorsLight,
  shadowsDark,
  shadowsLight,
  surfacesDark,
  surfacesLight,
  textDark,
  textLight,
} from './tokens'
import { typographyConfig } from './typography'

// ── Type Augmentation ────────────────────────────────────────────────────────

export interface MeridianTokens {
  surfaces: {
    void: string
    ground: string
    s1: string
    s2: string
    s3: string
    s4: string
    s5: string
  }
  borders: { default: string; muted: string; strong: string }
  text: { tx4: string }
  shadows: { sm: string; md: string; lg: string }
  durations: {
    instant: string
    fast: string
    normal: string
    slow: string
    cinematic: string
  }
  easings: { out: string; in: string; inOut: string; spring: string }
}

declare module '@mui/material/styles' {
  interface Theme {
    meridian: MeridianTokens
  }
  interface ThemeOptions {
    meridian?: Partial<MeridianTokens>
  }
}

// ── Shared base shape ────────────────────────────────────────────────────────

const baseShape = { borderRadius: radii.DEFAULT }

// ── Factory ──────────────────────────────────────────────────────────────────

export function createAdminTheme(mode: 'dark' | 'light') {
  const isDark = mode === 'dark'

  const surfaces = isDark ? surfacesDark : surfacesLight
  const borders = isDark ? bordersDark : bordersLight
  const text = isDark ? textDark : textLight
  const shadows = isDark ? shadowsDark : shadowsLight
  const semantic = isDark ? semanticColorsDark : semanticColorsLight

  return createTheme({
    palette: {
      mode,
      primary: { main: PRIMARY_COLOR },
      background: {
        default: surfaces.ground,
        paper: surfaces.s1,
      },
      text: {
        primary: text.primary,
        secondary: text.secondary,
        disabled: text.disabled,
      },
      divider: borders.default,
      success: { main: semantic.success },
      warning: { main: semantic.warning },
      error: { main: semantic.error },
      info: { main: semantic.info },
    },

    typography: typographyConfig,
    shape: baseShape,
    components: createComponentsConfig(mode),

    meridian: {
      surfaces,
      borders,
      text: { tx4: text.tx4 },
      shadows,
      durations,
      easings,
    },
  })
}

// ── Named exports for App.tsx compatibility ──────────────────────────────────

export const darkTheme = createAdminTheme('dark')
export const lightTheme = createAdminTheme('light')
