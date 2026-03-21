# Sistema Municipal - Instrucciones

## Estandares de Codigo (aplica SIEMPRE)

### TypeScript — Codigo Limpio
- **Zero `any`**: nunca usar `any`. Usar tipos explicitos, genericos, `unknown`, o type guards.
- **Zero variables/imports sin usar**: al crear o modificar un archivo, NO dejar variables, imports, parametros o tipos declarados que no se usen. Si TS reporta `declared but never read` (TS6133), corregir antes de terminar.
- **Zero errores TS**: todo archivo tocado debe compilar limpio (`tsc --noEmit` sin errores). No dejar warnings ni errores pendientes.
- **Principios SOLID**: responsabilidad unica, open/closed, sustitucion, segregacion de interfaces, inversion de dependencias.
- **Interfaces sobre types** para contratos de componentes (props). `type` para uniones, intersecciones y utilidades.

### Colores y Theme — Zero Hardcoded
- **SIEMPRE usar la paleta MUI/MERIDIAN** (`theme.palette.*`, `theme.meridian.*`). Nunca hardcodear colores como `#818CF8`, `rgba(11,11,15,0.92)`, etc.
- Para transparencias usar `alpha()` de MUI: `alpha(theme.meridian.surfaces.ground, 0.92)`.
- Para el accent del modulo activo: `theme.palette.primary.main` (se actualiza automaticamente al cambiar modulo).
- Para text hierarchy: `theme.palette.text.primary/secondary/disabled`, `theme.meridian.text.tx4`.
- Para borders: `theme.meridian.borders.default/muted/strong`, `theme.palette.divider`.
- **Excepcion**: solo se permite hardcodear un color si no existe equivalente en el theme y se documenta con comentario `// hardcoded: <razon>`.

### React — Atomic Design en Dos Niveles (SYSTEM vs PRODUCT)

La arquitectura sigue Atomic Design con **dos niveles claros**:

```
┌─────────────────────────────────────────────────────────────┐
│  SYSTEM (mf_ui)              │  PRODUCT (mf_shell, mf_*)   │
│  Atomic Design puro          │  Composicion de layout/UI   │
│                              │                              │
│  atoms/ ──────────────────┐  │                              │
│  molecules/ ──────────────┤  │  layout/Eyebrow/ ◄── consume │
│  organisms/ ──────────────┘  │  layout/Compass/ ◄── consume │
│                              │  layout/NavPanel/ ◄── consume│
│  Reutilizable por TODOS      │  pages/<page>/components/    │
│  los microfrontends          │  Especifico del shell        │
└─────────────────────────────────────────────────────────────┘
```

**Regla fundamental**: Los componentes del PRODUCT (layout, pages) **consumen** atomos y moleculas del SYSTEM (mf_ui). NUNCA duplicar en el layout lo que ya existe como atomo/molecula en mf_ui.

#### mf_ui — SYSTEM (biblioteca compartida, Atomic Design puro)
```
mf_ui/src/components/
├── atoms/        → Indivisibles: Badge, StatusDot, IconButton, MeridianLogo, ClockDisplay, Logo
├── molecules/    → Combinacion de atomos: UserAvatar, SearchInput, KpiCard, StatCard
├── organisms/    → Secciones completas: DataTable, ActivityFeed, BudgetChart
├── forms/        → Formularios reutilizables: FormField, SelectField
└── index.ts      → Barrel export
```

#### mf_shell — PRODUCT (layout, paginas, routing)
```
mf_shell/src/
├── layout/                → Templates/Organismos del layout MERIDIAN
│   ├── Eyebrow/           → Barra superior (consume atomos de mf_ui)
│   ├── Compass/           → FAB de navegacion
│   ├── NavPanel/          → Panel lateral de menu
│   ├── Stage/             → Area de contenido
│   ├── CommandPalette/    → Paleta de comandos
│   └── AppLayout.tsx      → Template orquestador principal
├── pages/                 → Paginas del shell (login, mfa-setup)
│   └── <page>/
│       ├── <Page>.tsx     → Componente pagina
│       ├── components/    → Componentes especificos de esa pagina
│       └── hooks/         → Hooks especificos de esa pagina
├── hooks/                 → Hooks compartidos del shell
├── context/               → React contexts del shell
├── types/                 → Tipos compartidos del shell
├── routes/                → Configuracion de rutas
└── utils/                 → Utilidades del shell
```
**IMPORTANTE**: NO crear carpetas duplicadas (`component/` vs `components/`, `hook/` vs `hooks/`, `ui-compoment/`). Usar SOLO las carpetas canonicas listadas arriba.

#### Regla de ubicacion de componentes (decision tree)

Recorrer en orden, detenerse en el primer SI:

1. **¿Ya existe en `mf_ui/src/components/`?** → reutilizarlo. NUNCA recrear.
2. **¿Sin conocimiento de dominio municipal?** (nombres genericos, datos via props) → `mf_ui/src/components/{atoms|molecules|organisms}/`
3. **¿Lo usan 2+ microfrontends de dominio?** → `mf_ui` (hacerlo generico si hace falta)
4. **¿Es parte del layout shell?** → `mf_shell/src/layout/<Organismo>/` (consume atomos de mf_ui, no los recrea)
5. **¿Es especifico de una pagina del shell?** → `mf_shell/src/pages/<page>/components/`
6. **¿Es de dominio especifico (contabilidad, chat...)?** → dentro del mf correspondiente:
   - **¿Lo usan 2+ features del mismo mf?** → `components/atoms|molecules|organisms/` (shared del mf)
   - **¿Es especifico de un feature?** → `components/<feature>/atoms|molecules|organisms/`
7. **¿Un componente local se necesita en otro MF?** → promoverlo a `mf_ui` (mover, no duplicar).
8. **Extender antes que duplicar**: si un componente existente cubre 80%+ del caso, extenderlo con props opcionales.

#### Estructura interna de un mf de dominio
```
mf_<dominio>/src/components/
├── atoms/              ← atomos compartidos entre features del mf
├── molecules/          ← moleculas compartidas entre features del mf
│   └── form/           ← wrappers de formularios con react-hook-form
├── organisms/          ← organismos compartidos entre features del mf
└── <feature>/          ← una subcarpeta por feature del modulo
    ├── atoms/
    ├── molecules/
    └── organisms/
```

### Buenas Practicas Generales
- Componentes pequenos y enfocados (max ~150 lineas; si crece, extraer sub-componentes)
- Props tipadas con interface, sin `React.FC` (usar function declarations)
- Custom hooks para logica reutilizable (`use*.ts`)
- Barrel exports (`index.ts`) por carpeta para imports limpios
- Nombres descriptivos en espanol para dominio municipal, en ingles para codigo tecnico

## Spec-Driven Development (Document-First)
- Antes de implementar una feature, debe existir un spec en `specs/`
- Template: `specs/TEMPLATE.spec.md`
- **1 modulo** → `specs/<modulo>/feat-xxx.spec.md`
- **2+ modulos** → `specs/global/feat-xxx.spec.md`
- Claude DEBE leer el spec antes de escribir codigo de la feature
- Validar contra los criterios de aceptacion al finalizar
