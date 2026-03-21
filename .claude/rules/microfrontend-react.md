---
paths:
  - "apps/microfrontends/**/*.tsx"
  - "apps/microfrontends/**/*.ts"
---

# Microfrontends React — Convenciones

## Colores: Zero hardcoded
- **SIEMPRE** `theme.palette.*` o `theme.meridian.*` — NUNCA `#818CF8`, `rgba(...)`, etc.
- Transparencias: `alpha(theme.meridian.surfaces.ground, 0.92)` (MUI `alpha()`)
- Accent del modulo activo: `theme.palette.primary.main`
- Text hierarchy: `theme.palette.text.primary/secondary/disabled`, `theme.meridian.text.tx4`
- Borders: `theme.meridian.borders.default/muted/strong`, `theme.palette.divider`
- **Excepcion**: solo si no hay equivalente en el theme → documentar con `// hardcoded: <razon>`

## Atomic Design — Arbol de decision (seguir en orden)

**Antes de crear cualquier componente**, recorrer este arbol:

```
1. ¿Ya existe en mf_ui/src/components/?
        ↓ SI → reutilizarlo, no recrearlo

2. ¿Tiene conocimiento de dominio? (nombres como "Presupuesto", "PlanCuenta", "Cuenta")
        ↓ NO → va en mf_ui (generico, recibe datos via props)
        ↓ SI → va en el mf del dominio (mf_contabilidad, mf_chat, etc.)

3. Dentro del mf de dominio:
   ¿Lo usan 2+ features del mismo mf? (ej: presupuesto Y planCuentas)
        ↓ SI → components/atoms|molecules|organisms/    (shared del mf)
        ↓ NO → components/<feature>/atoms|molecules|organisms/
```

## Estructura canonica de cada mf de dominio

```
mf_<dominio>/src/
├── components/
│   ├── atoms/              ← atomos compartidos entre features del mf
│   ├── molecules/          ← moleculas compartidas entre features del mf
│   │   └── form/           ← wrappers de formularios compartidos (ControllerXxx)
│   ├── organisms/          ← organismos compartidos entre features del mf
│   │
│   └── <feature>/          ← una carpeta por feature del modulo
│       ├── atoms/          ← atomos especificos de este feature
│       ├── molecules/      ← moleculas especificas de este feature
│       └── organisms/      ← organismos especificos de este feature
│
├── hooks/
│   └── <feature>/          ← hooks agrupados por feature
├── page/                   ← paginas del modulo
│   └── <feature>/
├── routes/
├── types/
└── utils/
```

## mf_ui — Solo componentes sin dominio
mf_ui exporta UNICAMENTE componentes genericos (sin conocimiento de negocio):
- ✅ `InfoCard`, `StatCard`, `DataTable`, `Badge`, `StatusChip` — genericos
- ✅ `FormField`, `SelectField` — wrappers genericos de input
- ❌ Componente que mencione "Presupuesto", "Cuenta", "Decreto" en nombre o logica interna

## Componentes React
- `function` declarations, no `const Foo: React.FC`
- Props con `interface`, no `type` (para contratos de componentes)
- Maximo ~150 lineas — si crece, extraer sub-componentes
- Custom hooks en `hooks/<feature>/use<Nombre>.ts`
- Barrel exports (`index.ts`) por carpeta

## Module Federation — reglas duras
- NUNCA importar directamente entre mf de dominio (mf_contabilidad ↔ mf_chat ❌)
- mf_shell puede importar desde mf_ui — es el unico flujo cross-mf permitido
- Estado compartido: `mf_store` (Redux) — nunca prop drilling entre mfs
- Imports de mf_ui: `import { Badge } from 'mf_ui/components'`

## Carpetas canonicas (no crear variantes)
```
components/   (NO: component/, ui-component/)
hooks/        (NO: hook/)
page/         (convencion actual del proyecto)
```
