---
name: municipal-ui-design
description: Sistema de diseno MERIDIAN con MUI v7, Framer Motion y Atomic Design para el sistema municipal. Aplicar cuando se creen o modifiquen componentes React, se trabaje con colores/theme, animaciones, mf_ui, mf_shell layout o cualquier aspecto visual de los microfrontends.
context: fork
allowed-tools: [Read, Grep, Glob, Bash]
---

# UI/UX Profesional — Dashboard React + TypeScript + MUI

Sistema de convenciones para construir interfaces de alta calidad en el stack MUI v7 + TypeScript + Framer Motion.

## Filosofia de diseno
La filosofia completa del sistema MERIDIAN esta en:
`documentacion/diseno-tecnico/dashboard-v5/v1/documentacion/`
Para decisiones de diseno estructural, usar el skill `/meridian-philosophy`.
Este skill cubre el "como" implementarlo en codigo.

## Stack de referencia
- **UI Base**: MUI v7 (`@mui/material`) + Emotion
- **Iconos**: `lucide-react` (dinamicos) + `@mui/icons-material` (solo fallback)
- **Animaciones**: `framer-motion` — obligatorio para drawers, modales, listas y transiciones
- **Fuente**: Inter (configurada en el tema)
- **Tokens**: `mf_ui/src/theme/tokens.ts`
- **Componentes compartidos**: `mf_ui/components` — usar siempre antes de crear uno nuevo

## Direccion estetica
Minimalismo refinado + precision institucional. Cada elemento justifica su presencia.

- Color con dominancia: Primary `#7928ca` domina, el resto apoya
- Tipografia con intencion: Inter con escalas, pesos y tracking controlados
- Glassmorphism quirurgico: Solo donde hay superposicion real (max 2-3 por pagina)
- Animaciones con proposito: Cada movimiento confirma una accion o guia la atencion

## Principios de diseno
1. **Sutileza sobre espectacularidad**: animaciones 150-300ms, easing `[0.4, 0, 0.2, 1]`
2. **Glassmorphism controlado**: `alpha(bg, 0.8)` + `blur(12px)` + borde sutil
3. **Elevacion semantica**: 0=contenido, 1-2=cards, 4-8=dropdowns, 8-16=modales
4. **Color con proposito**: primary=acciones, success=positivo, error=destructivo, siempre con `alpha(color, 0.12)` para fondos

## Contenido detallado por area

Los patrones completos estan divididos por tema:

!`cat .claude/skills/municipal-ui-design/motion-patterns.md`

!`cat .claude/skills/municipal-ui-design/component-patterns.md`

!`cat .claude/skills/municipal-ui-design/standards-checklist.md`

!`cat .claude/skills/municipal-ui-design/responsive-design.md`

## Tarea: $ARGUMENTS

Implementa lo solicitado siguiendo estos estandares MERIDIAN.
