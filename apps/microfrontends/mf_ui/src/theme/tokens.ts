/**
 * Design Tokens - Sistema Municipal CrisCar
 *
 * Sistema de tokens de diseño para mantener consistencia visual
 * Basado en principios de Atomic Design y escalas modulares
 */

// ============================================================================
// SPACING SCALE (8px base)
// ============================================================================
export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem",  // 2px
  1: "0.25rem",     // 4px
  1.5: "0.375rem",  // 6px
  2: "0.5rem",      // 8px
  2.5: "0.625rem",  // 10px
  3: "0.75rem",     // 12px
  3.5: "0.875rem",  // 14px
  4: "1rem",        // 16px
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  7: "1.75rem",     // 28px
  8: "2rem",        // 32px
  9: "2.25rem",     // 36px
  10: "2.5rem",     // 40px
  11: "2.75rem",    // 44px
  12: "3rem",       // 48px
  14: "3.5rem",     // 56px
  16: "4rem",       // 64px
  20: "5rem",       // 80px
  24: "6rem",       // 96px
  28: "7rem",       // 112px
  32: "8rem",       // 128px
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const borderRadius = {
  none: "0",
  sm: "0.25rem",    // 4px
  DEFAULT: "0.5rem", // 8px
  md: "0.625rem",   // 10px
  lg: "0.75rem",    // 12px
  xl: "1rem",       // 16px
  "2xl": "1.25rem", // 20px
  "3xl": "1.5rem",  // 24px
  full: "9999px",
} as const;

// ============================================================================
// SHADOWS (Elegantes y sutiles)
// ============================================================================
export const shadows = {
  none: "none",
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  DEFAULT: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  // Sombras de color para elementos interactivos
  primary: "0 4px 14px 0 rgb(121 40 202 / 0.25)",
  secondary: "0 4px 14px 0 rgb(8 145 178 / 0.25)",
  success: "0 4px 14px 0 rgb(5 150 105 / 0.25)",
  error: "0 4px 14px 0 rgb(220 38 38 / 0.25)",
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================
export const fontFamily = {
  sans: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, "Cascadia Code", monospace',
} as const;

export const fontSize = {
  xs: ["0.75rem", { lineHeight: "1rem" }],      // 12px
  sm: ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
  base: ["1rem", { lineHeight: "1.5rem" }],     // 16px
  lg: ["1.125rem", { lineHeight: "1.75rem" }],  // 18px
  xl: ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
  "2xl": ["1.5rem", { lineHeight: "2rem" }],    // 24px
  "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
  "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
  "5xl": ["3rem", { lineHeight: "1" }],         // 48px
  "6xl": ["3.75rem", { lineHeight: "1" }],      // 60px
} as const;

export const fontWeight = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

export const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
} as const;

// ============================================================================
// ANIMATION & TRANSITIONS
// ============================================================================
export const transitions = {
  // Duraciones
  duration: {
    instant: "0ms",
    fast: "150ms",
    normal: "250ms",
    slow: "350ms",
    slower: "500ms",
  },
  // Easings (curvas de animación elegantes)
  easing: {
    linear: "linear",
    ease: "ease",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    // Easings especiales para efectos sutiles
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  },
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================
export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================
export const breakpoints = {
  xs: "0px",
  sm: "600px",
  md: "900px",
  lg: "1200px",
  xl: "1536px",
  "2xl": "1920px",
} as const;

// ============================================================================
// PRESET COLOR PALETTES (Temas predefinidos)
// ============================================================================
export interface ColorPreset {
  name: string;
  label: string;
  primary: string;
  secondary: string;
  accent?: string;
}

export const colorPresets: ColorPreset[] = [
  {
    name: "criscar",
    label: "CrisCar (Predeterminado)",
    primary: "#7928ca",
    secondary: "#0891b2",
    accent: "#f59e0b",
  },
  {
    name: "ocean",
    label: "Océano",
    primary: "#0077b6",
    secondary: "#00b4d8",
    accent: "#90e0ef",
  },
  {
    name: "forest",
    label: "Bosque",
    primary: "#2d6a4f",
    secondary: "#40916c",
    accent: "#95d5b2",
  },
  {
    name: "sunset",
    label: "Atardecer",
    primary: "#e63946",
    secondary: "#f4a261",
    accent: "#e9c46a",
  },
  {
    name: "lavender",
    label: "Lavanda",
    primary: "#7209b7",
    secondary: "#b5179e",
    accent: "#f72585",
  },
  {
    name: "earth",
    label: "Tierra",
    primary: "#6b4423",
    secondary: "#a47148",
    accent: "#ddb892",
  },
  {
    name: "professional",
    label: "Profesional",
    primary: "#1e3a5f",
    secondary: "#3d5a80",
    accent: "#98c1d9",
  },
  {
    name: "mint",
    label: "Menta",
    primary: "#14746f",
    secondary: "#2a9d8f",
    accent: "#e9f5db",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Genera variantes de un color (light, dark)
 */
export function generateColorVariants(hex: string): {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
} {
  // Convertir hex a RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calcular luminancia para determinar contraste
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Generar variantes
  const lighten = (amount: number) => {
    const newR = Math.min(255, Math.round(r + (255 - r) * amount));
    const newG = Math.min(255, Math.round(g + (255 - g) * amount));
    const newB = Math.min(255, Math.round(b + (255 - b) * amount));
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  };

  const darken = (amount: number) => {
    const newR = Math.round(r * (1 - amount));
    const newG = Math.round(g * (1 - amount));
    const newB = Math.round(b * (1 - amount));
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  };

  return {
    main: hex,
    light: lighten(0.3),
    dark: darken(0.2),
    contrastText: luminance > 0.5 ? "#0f172a" : "#ffffff",
  };
}

/**
 * Crea una transición CSS consistente
 */
export function createTransition(
  properties: string | string[],
  duration: keyof typeof transitions.duration = "normal",
  easing: keyof typeof transitions.easing = "easeInOut"
): string {
  const props = Array.isArray(properties) ? properties : [properties];
  const dur = transitions.duration[duration];
  const ease = transitions.easing[easing];

  return props.map((prop) => `${prop} ${dur} ${ease}`).join(", ");
}

export default {
  spacing,
  borderRadius,
  shadows,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  transitions,
  zIndex,
  breakpoints,
  colorPresets,
  generateColorVariants,
  createTransition,
};
