---
paths:
  - "apps/microfrontends/**/*.tsx"
  - "apps/microfrontends/**/*.ts"
---

# Microfrontends React — Convenciones

## Colores: Zero hardcoded
- **SIEMPRE** `theme.palette.*` o `theme.meridian.*` — NUNCA `#818CF8`, `rgba(...)`, etc.
- Transparencias: `alpha(theme.meridian.surfaces.ground, 0.92)` (MUI `alpha()`)
- Accent del módulo activo: `theme.palette.primary.main`
- Text hierarchy: `theme.palette.text.primary/secondary/disabled`, `theme.meridian.text.tx4`
- Borders: `theme.meridian.borders.default/muted/strong`, `theme.palette.divider`
- **Excepción**: solo si no hay equivalente en el theme → documentar con `// hardcoded: <razón>`

## Atomic Design — Árbol de decisión (seguir en orden)

**Antes de crear cualquier componente**, recorrer este árbol:

```
1. ¿Ya existe en mf_ui/src/components/?
        ↓ SÍ → reutilizarlo, no recrearlo

2. ¿Tiene conocimiento de dominio? (nombres como "Presupuesto", "PlanCuenta", "Cuenta")
        ↓ NO → va en mf_ui (genérico, recibe datos via props)
        ↓ SÍ → va en el mf del dominio (mf_contabilidad, mf_chat, etc.)

3. Dentro del mf de dominio:
   ¿Lo usan 2+ features del mismo mf? (ej: presupuesto Y planCuentas)
        ↓ SÍ → components/atoms|molecules|organisms/    (shared del mf)
        ↓ NO → components/<feature>/atoms|molecules|organisms/
```

## Estructura canónica de cada mf de dominio

```
mf_<dominio>/src/
├── components/
│   ├── atoms/              ← átomos compartidos entre features del mf
│   ├── molecules/          ← moléculas compartidas entre features del mf
│   │   └── form/           ← wrappers de formularios compartidos (ControllerXxx)
│   ├── organisms/          ← organismos compartidos entre features del mf
│   │
│   └── <feature>/          ← una carpeta por feature del módulo
│       ├── atoms/          ← átomos específicos de este feature
│       ├── molecules/      ← moléculas específicas de este feature
│       └── organisms/      ← organismos específicos de este feature
│
├── hooks/
│   └── <feature>/          ← hooks agrupados por feature
├── page/                   ← páginas del módulo
│   └── <feature>/
├── routes/
├── types/
└── utils/
```

**Ejemplo en mf_contabilidad:**
```
components/
├── atoms/              ← TextMaskCustom (usado por presupuesto y planCuentas)
├── molecules/
│   └── form/           ← ControllerTextField, ControllerAutocomplete, etc.
├── organisms/          ← MainCard, DeleteConfirmDialog (compartidos)
├── presupuesto/
│   ├── atoms/          ← DiscrepanciaChip, MontoInput, CuentaAutocomplete
│   ├── molecules/      ← PresupuestoDetalleRow, PresupuestoHeader, PresupuestoToolbar
│   └── organisms/      ← PresupuestoGrid, AgregarCuentaDrawer, PresupuestoResumen
└── planCuentas/
    ├── atoms/          ← CustomTreeItem
    ├── molecules/      ← TreeSearchBar, AccountFormFields
    └── organisms/      ← PlanDeCuentasTree, AccountPanel
```

## mf_ui — Solo componentes sin dominio
mf_ui exporta ÚNICAMENTE componentes genéricos (sin conocimiento de negocio):
- ✅ `InfoCard`, `StatCard`, `DataTable`, `Badge`, `StatusChip` — genéricos
- ✅ `FormField`, `SelectField` — wrappers genéricos de input
- ❌ Componente que mencione "Presupuesto", "Cuenta", "Decreto" en nombre o lógica interna

## Componentes React
- `function` declarations, no `const Foo: React.FC`
- Props con `interface`, no `type` (para contratos de componentes)
- Máximo ~150 líneas — si crece, extraer sub-componentes
- Custom hooks en `hooks/<feature>/use<Nombre>.ts`
- Barrel exports (`index.ts`) por carpeta

## Module Federation — reglas duras
- NUNCA importar directamente entre mf de dominio (mf_contabilidad ↔ mf_chat ❌)
- mf_shell puede importar desde mf_ui — es el único flujo cross-mf permitido
- Estado compartido: `mf_store` (Redux) — nunca prop drilling entre mfs
- Imports de mf_ui: `import { Badge } from 'mf_ui/components'`

## Carpetas canónicas (no crear variantes)
```
components/   (NO: component/, ui-component/)
hooks/        (NO: hook/)
page/         (convención actual del proyecto)
```
