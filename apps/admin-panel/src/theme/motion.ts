import type { Variants, Transition } from 'framer-motion'
import { durations, easings } from './tokens'

// Re-export for convenience
export { durations, easings }

// Check for reduced motion preference
const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

// Base transition values
const normalTransition: Transition = {
  duration: prefersReducedMotion ? 0.01 : 0.25,
  ease: [0.0, 0.0, 0.2, 1.0],
}

const fastTransition: Transition = {
  duration: prefersReducedMotion ? 0.01 : 0.15,
  ease: [0.0, 0.0, 0.2, 1.0],
}

// Page transitions
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 8,
    filter: prefersReducedMotion ? 'none' : 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: normalTransition,
  },
  exit: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -8,
    filter: prefersReducedMotion ? 'none' : 'blur(4px)',
    transition: fastTransition,
  },
}

// Container stagger for list animations
export const containerStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.06,
    },
  },
}

// Item fade-up for list items
export const itemFadeUp: Variants = {
  initial: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: normalTransition,
  },
}

// Hover elevation for cards
export const hoverElevation: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: prefersReducedMotion ? 1 : 1.01,
    y: prefersReducedMotion ? 0 : -2,
    transition: fastTransition,
  },
}

// Fade in simple
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: normalTransition,
  },
  exit: {
    opacity: 0,
    transition: fastTransition,
  },
}

// Scale in for modals/dialogs
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.96,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: normalTransition,
  },
  exit: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.96,
    transition: fastTransition,
  },
}

// Duration constants in seconds (for Framer Motion)
export const durationSeconds = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  cinematic: 0.6,
} as const

// Easing arrays for Framer Motion
export const easingArrays = {
  out: [0.0, 0.0, 0.2, 1.0] as [number, number, number, number],
  in: [0.4, 0.0, 1.0, 1.0] as [number, number, number, number],
  inOut: [0.4, 0.0, 0.2, 1.0] as [number, number, number, number],
  spring: [0.34, 1.56, 0.64, 1.0] as [number, number, number, number],
} as const

// Helper to create a standard transition
export function makeTransition(
  durationMs: keyof typeof durationSeconds,
  easing: keyof typeof easingArrays = 'out',
): Transition {
  if (prefersReducedMotion) return { duration: 0.01 }
  return {
    duration: durationSeconds[durationMs],
    ease: easingArrays[easing],
  }
}
