import type { ThemeOptions } from '@mui/material/styles'
import { fontFamily, fontFeatures } from './tokens'

// Augment MUI TypographyVariantsOptions to include custom variants
declare module '@mui/material/styles' {
  interface TypographyVariants {
    number: React.CSSProperties
    mono: React.CSSProperties
    label: React.CSSProperties
  }
  interface TypographyVariantsOptions {
    number?: React.CSSProperties
    mono?: React.CSSProperties
    label?: React.CSSProperties
  }
}

// Augment Typography component props to accept custom variants
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    number: true
    mono: true
    label: true
  }
}

export const typographyConfig: ThemeOptions['typography'] = {
  fontFamily: fontFamily.sans,
  fontSize: 13.5,

  h1: {
    fontFamily: fontFamily.display,
    fontWeight: 700,
    fontSize: '2.25rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: fontFamily.display,
    fontWeight: 700,
    fontSize: '1.875rem',
    lineHeight: 1.25,
    letterSpacing: '-0.015em',
  },
  h3: {
    fontFamily: fontFamily.display,
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontFamily: fontFamily.display,
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.35,
    letterSpacing: '-0.008em',
  },
  h5: {
    fontFamily: fontFamily.display,
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.4,
  },
  h6: {
    fontFamily: fontFamily.display,
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.4,
  },

  body1: {
    fontFamily: fontFamily.sans,
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  body2: {
    fontFamily: fontFamily.sans,
    fontSize: '0.8125rem',
    lineHeight: 1.5,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: '0.75rem',
    lineHeight: 1.4,
  },
  overline: {
    fontFamily: fontFamily.sans,
    fontSize: '0.625rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: fontFamily.sans,
    fontWeight: 500,
    fontSize: '0.8125rem',
    textTransform: 'none',
  },
  subtitle1: {
    fontFamily: fontFamily.sans,
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontFamily: fontFamily.sans,
    fontSize: '0.8125rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },

  // Custom variants
  label: {
    fontFamily: fontFamily.sans,
    fontSize: '0.6875rem', // 11px
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    lineHeight: 1.4,
  },
  number: {
    fontFamily: fontFamily.number,
    fontFeatureSettings: fontFeatures.number,
    fontWeight: 500,
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: '0.8125rem',
    lineHeight: 1.6,
  },
}
