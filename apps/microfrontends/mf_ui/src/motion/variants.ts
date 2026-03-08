/**
 * Motion Variants — Sistema Municipal CrisCar
 *
 * Transitions y Variants de Framer Motion centralizados.
 * Importar desde mf_ui/motion — nunca definir inline.
 *
 * Reglas:
 * - Solo animar transform y opacity (compositor-friendly)
 * - Respetar prefers-reduced-motion con useReducedMotion()
 * - Duración máxima: 400ms para transiciones de layout
 */

import type { Transition, Variants } from "framer-motion";

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  /** 150ms — micro-interacciones (hover, focus) */
  fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  /** 250ms — animaciones de entrada estándar */
  base: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  /** 400ms — transiciones de layout grandes */
  slow: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  /** 350ms — transiciones de página */
  page: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  /** Spring suave para elementos físicos */
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } satisfies Transition,
  /** Spring más gentil — para drawers y overlays */
  springGentle: {
    type: "spring",
    stiffness: 200,
    damping: 25,
  } satisfies Transition,
} as const;

// ============================================================================
// VARIANTS
// ============================================================================

/** Card o sección que sube desde abajo al aparecer */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: transitions.base },
};

/** Fade simple sin desplazamiento */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transitions.base },
};

/** Escala desde 96% — para modales y overlays */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: transitions.spring },
  exit: { opacity: 0, scale: 0.96, transition: transitions.fast },
};

/** Contenedor de lista — activa el stagger en los hijos */
export const listContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

/** Item individual de lista — usar con listContainer */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: transitions.base },
};

/** Drawer desde la derecha */
export const slideRight: Variants = {
  hidden: { x: "100%", opacity: 0 },
  show: { x: 0, opacity: 1, transition: transitions.springGentle },
  exit: { x: "100%", opacity: 0, transition: transitions.fast },
};

/** Drawer desde la izquierda */
export const slideLeft: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  show: { x: 0, opacity: 1, transition: transitions.springGentle },
  exit: { x: "-100%", opacity: 0, transition: transitions.fast },
};

/** Transición de página — desplazamiento sutil vertical */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: transitions.page },
  exit: { opacity: 0, y: -8, transition: transitions.fast },
};
