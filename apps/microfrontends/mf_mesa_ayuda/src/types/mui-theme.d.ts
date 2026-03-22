// ─── MUI Theme Augmentation (MERIDIAN tokens) ────────────────────
// Replica de mf_shell/src/mui-theme.d.ts para que mf_mesa_ayuda
// tenga acceso tipado a theme.meridian.*

export {}

interface MeridianTokens {
  surfaces: {
    void: string
    ground: string
    s1: string
    s2: string
    s3: string
    s4: string
    s5: string
  }
  borders: {
    default: string
    muted: string
    strong: string
  }
  text: {
    tx4: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
  moduleAccent: {
    main: string
    rgb: string
    tint: string
  }
  durations: {
    instant: string
    fast: string
    normal: string
    slow: string
    cinematic: string
  }
  easings: {
    out: string
    in: string
    inOut: string
    spring: string
  }
  zIndex: {
    statusLine: number
    eyebrow: number
    floating: number
    compass: number
    navPanel: number
    cmdOverlay: number
    cmdPalette: number
    onboarding: number
  }
}

declare module '@mui/material/styles' {
  interface Theme {
    meridian: MeridianTokens
  }
  interface ThemeOptions {
    meridian?: Partial<MeridianTokens>
  }
  interface TypographyVariants {
    number: React.CSSProperties
    mono: React.CSSProperties
  }
  interface TypographyVariantsOptions {
    number?: React.CSSProperties
    mono?: React.CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    number: true
    mono: true
  }
}
