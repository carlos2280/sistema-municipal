/**
 * ═══════════════════════════════════════════════════════════════
 *  MERIDIAN — Design Tokens
 *  Fuente de verdad para spacing, radii, shadows, typography,
 *  z-index, breakpoints y semantic colors.
 *
 *  Los tokens de superficie/border/text van en theme.ts
 *  como parte de las paletas dark/light.
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Spacing (múltiplos de 4) ────────────────────────────────
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

// ─── Border Radius ───────────────────────────────────────────
export const radii = {
  sm: 4,    // --r-sm  badges, chips
  DEFAULT: 8,  // --r     inputs, small buttons
  md: 12,   // --r-md  standard cards
  lg: 16,   // --r-lg  large cards, panels
  xl: 24,   // --r-xl  modals, navigation panel
  full: 9999, // compass, avatars, dots
} as const;

// ─── Shadows ─────────────────────────────────────────────────
export const shadowsDark = {
  sm: '0 2px 8px rgba(0,0,0,0.4)',
  md: '0 4px 24px rgba(0,0,0,0.5)',
  lg: '0 8px 48px rgba(0,0,0,0.6)',
  compass: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
} as const;

export const shadowsLight = {
  sm: '0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
  md: '0 2px 12px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06)',
  lg: '0 4px 32px rgba(0,0,0,0.12), 0 8px 48px rgba(0,0,0,0.08)',
  compass: '0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
} as const;

// ─── Typography Families ─────────────────────────────────────
export const fontFamily = {
  display: '"Bricolage Grotesque", sans-serif',
  sans: '"DM Sans", sans-serif',
  number: '"Space Grotesk", sans-serif',
  mono: '"DM Mono", monospace',
} as const;

// ─── Font Feature Settings ───────────────────────────────────
export const fontFeatures = {
  number: "'tnum' 1, 'ss01' 1",
} as const;

// ─── Z-Index Scale ───────────────────────────────────────────
export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1700,
  tooltip: 1800,
  compass: 1900,
} as const;

// ─── Breakpoints ─────────────────────────────────────────────
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 768,
  lg: 1200,
  xl: 1536,
} as const;

// ─── Transitions ─────────────────────────────────────────────
export const transitions = {
  duration: {
    instant: '100ms',
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    cinematic: '600ms',
  },
  easing: {
    out: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    in: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
    inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
  },
} as const;

// ─── Semantic Colors (modo-agnostic para uso directo) ────────
export const semanticColors = {
  // Dark mode (colores claros/pastel sobre fondo oscuro)
  dark: {
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },
  // Light mode (colores profundos WCAG 4.5:1 sobre fondo claro)
  light: {
    success: '#059669',
    warning: '#B45309',
    error: '#DC2626',
    info: '#2563EB',
  },
} as const;

export default {
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
};
