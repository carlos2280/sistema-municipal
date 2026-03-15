/**
 * ═══════════════════════════════════════════════════════════════
 *  MERIDIAN — Motion Variants
 *
 *  Transitions y Variants de Framer Motion centralizados.
 *  Importar desde mf_ui/motion — nunca definir inline.
 *
 *  Reglas MERIDIAN:
 *  - Solo animar transform y opacity (compositor-friendly)
 *  - Respetar prefers-reduced-motion con useReducedMotion()
 *  - Si el usuario debe esperar la animación, es demasiado larga
 *  - Max 3 animaciones activas por componente simultáneamente
 * ═══════════════════════════════════════════════════════════════
 */

import type { Transition, Variants } from 'framer-motion';

// ─── Timing Constants (MERIDIAN spec) ────────────────────────────

export const duration = {
  instant:   0.1,   // 100ms — hover states
  fast:      0.15,  // 150ms — toggle, checkbox, focus
  normal:    0.25,  // 250ms — panel slide, card expand
  slow:      0.4,   // 400ms — module navigation
  cinematic: 0.6,   // 600ms — login → dashboard
} as const;

export const easing = {
  out:   [0.0, 0.0, 0.2, 1.0] as const,  // appears smoothly
  in:    [0.4, 0.0, 1.0, 1.0] as const,  // disappears smoothly
  inOut: [0.4, 0.0, 0.2, 1.0] as const,  // symmetric transitions
} as const;

// ─── Transitions ─────────────────────────────────────────────────

export const transitions = {
  /** 100ms — micro-interacciones (hover, focus) */
  instant: { duration: duration.instant, ease: easing.out } satisfies Transition,
  /** 150ms — respuestas directas (toggle, checkbox) */
  fast: { duration: duration.fast, ease: easing.out } satisfies Transition,
  /** 250ms — animaciones de entrada estándar */
  base: { duration: duration.normal, ease: easing.out } satisfies Transition,
  /** 400ms — transiciones de módulo */
  slow: { duration: duration.slow, ease: easing.inOut } satisfies Transition,
  /** 600ms — momentos cinemáticos (login → dashboard) */
  cinematic: { duration: duration.cinematic, ease: easing.out } satisfies Transition,
  /** Spring — elementos físicos (Compass dock) */
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  } satisfies Transition,
  /** Spring firme — snapping, rebotes controlados */
  springFirm: {
    type: 'spring',
    stiffness: 500,
    damping: 40,
  } satisfies Transition,
} as const;

// ─── Variants ────────────────────────────────────────────────────

/** Card o sección que sube desde abajo al aparecer */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: transitions.base },
};

/** Fade simple sin desplazamiento */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transitions.base },
};

/** Escala desde 96% + desplazamiento -8px — Command Palette */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  show: { opacity: 1, scale: 1, y: 0, transition: transitions.fast },
  exit: { opacity: 0, scale: 0.96, y: -8, transition: { duration: duration.instant, ease: easing.in } },
};

/** Contenedor de lista — stagger 60ms entre items, max 6 items */
export const listContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

/** Item de lista — usar con listContainer */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: transitions.base },
};

/** Panel de navegación — desde la derecha, 250ms */
export const slideRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  show: { x: 0, opacity: 1, transition: transitions.base },
  exit: { x: '100%', opacity: 0, transition: { duration: duration.fast, ease: easing.in } },
};

/** Drawer desde la izquierda */
export const slideLeft: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  show: { x: 0, opacity: 1, transition: transitions.base },
  exit: { x: '-100%', opacity: 0, transition: { duration: duration.fast, ease: easing.in } },
};

/** Transición de página — crossfade con desplazamiento sutil */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: transitions.base },
  exit: { opacity: 0, y: -6, transition: transitions.fast },
};

/** Card hover — solo 2px de levitación (doc MERIDIAN) */
export const cardHover: Variants = {
  rest: { y: 0 },
  hover: { y: -2, transition: transitions.fast },
};

/** Overlay backdrop — fade 250ms */
export const overlay: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transitions.base },
  exit: { opacity: 0, transition: { duration: duration.fast, ease: easing.in } },
};

/** Compass dock items — stagger 30ms de abajo hacia arriba */
export const compassContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1, // bottom to top
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast },
  },
};

export const compassItem: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  show: { opacity: 1, scale: 1, transition: transitions.spring },
  exit: { opacity: 0, scale: 0.3, transition: { duration: duration.fast } },
};
