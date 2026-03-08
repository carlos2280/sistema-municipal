/**
 * Motion — Re-exports centralizados
 *
 * Todos los MFs importan framer-motion desde aquí para garantizar
 * una sola instancia compartida via Module Federation.
 *
 * Uso:
 *   import { motion, AnimatePresence, variants, transitions } from "mf_ui/motion";
 */

// Framer Motion — instancia compartida
export {
  motion,
  AnimatePresence,
  useAnimation,
  useInView,
  useReducedMotion,
  LayoutGroup,
} from "framer-motion";
export type { Variants, Transition, AnimationControls } from "framer-motion";

// Variants y transitions del sistema
export * from "./variants";
