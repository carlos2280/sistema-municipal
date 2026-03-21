# Motion Patterns — Framer Motion + MUI

## Tokens de animacion (importar desde mf_ui)

```typescript
// mf_ui/src/motion.ts
export { motion, AnimatePresence, useAnimation, useInView, useReducedMotion } from 'framer-motion';

export const transitions = {
  fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  base: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springGentle: { type: 'spring', stiffness: 200, damping: 25 },
} satisfies Record<string, Transition>;

export const variants = {
  listContainer: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
  },
  listItem: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: transitions.base },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: transitions.base },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: transitions.base },
  },
  slideRight: {
    hidden: { x: '100%', opacity: 0 },
    show: { x: 0, opacity: 1, transition: transitions.springGentle },
    exit: { x: '100%', opacity: 0, transition: transitions.fast },
  },
  slideLeft: {
    hidden: { x: '-100%', opacity: 0 },
    show: { x: 0, opacity: 1, transition: transitions.springGentle },
    exit: { x: '-100%', opacity: 0, transition: transitions.fast },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: transitions.spring },
    exit: { opacity: 0, scale: 0.96, transition: transitions.fast },
  },
};
```

## Drawer con Framer Motion

Regla: Todo drawer/panel lateral usa `AnimatePresence` + `motion.div`.

```tsx
<Drawer anchor={anchor} open={open} onClose={onClose}
  PaperProps={{ sx: { background: 'transparent', boxShadow: 'none' } }}
  slotProps={{ backdrop: { sx: { backdropFilter: 'blur(2px)', backgroundColor: alpha(common.black, 0.3) } } }}>
  <AnimatePresence>
    {open && (
      <motion.div key="drawer" initial="hidden" animate="show" exit="exit"
        variants={anchor === 'right' ? slideRight : slideLeft}
        style={{ height: '100%', width }}>
        <DrawerPaper elevation={0}>
          {/* header + content + actions */}
        </DrawerPaper>
      </motion.div>
    )}
  </AnimatePresence>
</Drawer>
```

## Listas animadas con stagger

```tsx
<motion.div variants={listContainer} initial="hidden" animate="show">
  <AnimatePresence>
    {items.map((item) => (
      <motion.div key={item.id} variants={listItem}
        exit={{ opacity: 0, x: -10, transition: { duration: 0.15 } }}
        layout>
        <ListItemComponent {...item} />
      </motion.div>
    ))}
  </AnimatePresence>
</motion.div>
```

## Transicion de pagina

```tsx
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit"
      style={{ height: '100%' }}>
      {children}
    </motion.div>
  );
}
```

## Reglas de produccion

- SIEMPRE respetar `prefers-reduced-motion` con `useReducedMotion()`
- Solo animar `transform` y `opacity` (compositor-friendly)
- NUNCA animar: width, height, top, left, margin, padding
- NUNCA usar `transition: all` — especificar propiedades explicitas
- `transform-origin` correcto: `center top` para dropdowns, `right center` para drawers
