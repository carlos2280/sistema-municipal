// MERIDIAN Design Tokens — admin-panel standalone
// Source of truth for all design values. No imports from mf_ui.

export const surfacesDark = {
  void: '#050507',
  ground: '#0B0B0F',
  s1: '#111116',
  s2: '#17171E',
  s3: '#1E1E28',
  s4: '#252532',
  s5: '#2E2E3D',
} as const

export const surfacesLight = {
  void: '#EAEAED', // Fondo absoluto
  ground: '#F5F5F7', // Canvas base
  s1: '#F0F0F3', // Contenedor principal (sidebar, header)
  s2: '#FFFFFF', // Cards, paneles elevados
  s3: '#F7F7FA', // Inputs, hover states
  s4: '#EAEAED', // Modales, dropdowns
  s5: '#E2E2E6', // Tooltips, flotantes máximos
} as const

export const bordersDark = {
  default: '#232335',
  muted: '#1C1C2A',
  strong: '#33334A',
} as const

export const bordersLight = {
  default: '#E4E4E7',
  muted: '#EBEBF0',
  strong: '#D1D1D6',
} as const

export const textDark = {
  primary: '#EEEEF2',
  secondary: '#8B8B9E',
  disabled: '#5A5A6F',
  tx4: '#3A3A50',
} as const

export const textLight = {
  primary: '#1A1A1F',
  secondary: '#6B6B7A',
  disabled: '#9B9BAA',
  tx4: '#BBBBD0',
} as const

export const shadowsDark = {
  sm: '0 2px 8px rgba(0,0,0,0.4)',
  md: '0 4px 24px rgba(0,0,0,0.5)',
  lg: '0 8px 48px rgba(0,0,0,0.6)',
} as const

export const shadowsLight = {
  sm: '0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
  md: '0 2px 12px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06)',
  lg: '0 4px 32px rgba(0,0,0,0.12), 0 8px 48px rgba(0,0,0,0.08)',
} as const

export const semanticColorsDark = {
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
} as const

export const semanticColorsLight = {
  success: '#059669',
  warning: '#B45309',
  error: '#DC2626',
  info: '#2563EB',
} as const

export const fontFamily = {
  display: '"Bricolage Grotesque Variable", "Bricolage Grotesque", sans-serif',
  sans: '"DM Sans Variable", "DM Sans", sans-serif',
  number: '"Space Grotesk", sans-serif',
  mono: '"DM Mono", monospace',
} as const

export const fontFeatures = {
  number: "'tnum' 1, 'ss01' 1",
} as const

export const radii = {
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export const durations = {
  instant: '100ms',
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
  cinematic: '600ms',
} as const

export const easings = {
  out: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
  in: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
  inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const

export const PRIMARY_COLOR = '#00bcd4'
