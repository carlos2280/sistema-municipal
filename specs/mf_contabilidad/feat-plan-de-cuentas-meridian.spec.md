# [FEAT-CONT-004] Plan de Cuentas — Alineación MERIDIAN desde Prototipo HTML

## Metadata
- **Módulos**: mf_contabilidad, mf_ui
- **Prioridad**: alta
- **Estado**: borrador
- **Fecha**: 2026-03-16
- **Prototipo**: `documentacion/diseno-tecnico/dashboard-v5/v1/prototipo/views/plan-de-cuentas.html`
- **CSS**: `documentacion/diseno-tecnico/dashboard-v5/v1/prototipo/css/plan-de-cuentas.css`
- **Documentación MERIDIAN**: `documentacion/diseno-tecnico/dashboard-v5/v1/documentacion/`
- **Informes**: `documentacion/informes/modulo-contabilidad/plan-de-cuentas/`

## Objetivo
Alinear la implementación React del Plan de Cuentas (`mf_contabilidad`) con el prototipo HTML MERIDIAN v1, cerrando los gaps visuales, de UX y funcionales identificados entre ambos. El resultado debe ser una pantalla production-ready que cumpla al 100% con la filosofía MERIDIAN.

## Alcance

### Incluye
- Alineación visual completa del árbol jerárquico con el prototipo CSS MERIDIAN
- Badges de nivel N1–N3 se mantienen como están (ya implementados). N4–N8 sin badge
- Toggle único Expandir/Colapsar (reemplaza los dos botones actuales)
- Contador de resultados de búsqueda
- Selección persistente en el árbol
- Indicador visual de nodo con acción activa (acting state)
- Advertencia de eliminación en cascada con conteo de hijos
- Typography MERIDIAN (Bricolage Grotesque, DM Sans, Space Grotesk, DM Mono)
- Acción buttons 28×28px con gap 4px (Fitts' Law)
- Row height consistente, hover instant en filas del árbol
- Zero colores hardcodeados (todo via `theme.palette.*` / `theme.meridian.*`)

### NO incluye
- Cambios en la API/backend (endpoints existentes se mantienen)
- Cambios en el schema de base de datos
- Implementación de la eliminación vía API (cubierto por spec separado futuro)
- Cambios en otros módulos/microfrontends
- Animaciones ambient o delight moments
- Focus Mode (Ctrl+Shift+F)

## Estado Actual

### Componentes existentes
| Archivo | Estado | Notas |
|---------|--------|-------|
| `page/planDeCuentas/PlanDeCuentas.tsx` | ~75% | Estructura base OK, gaps visuales MERIDIAN |
| `components/PlanDeCuentasTree.tsx` | ~70% | Falta acting state, selección persistente |
| `components/CustomTreeItem.tsx` | ~65% | Badges N1-N3 OK, action buttons tamaño inconsistente |
| `components/planCuentas/AccountPanel/` | ~85% | Responsive OK, code preview OK |
| `components/planCuentas/DeleteConfirmDialog.tsx` | ~60% | Falta cascade warning |
| `hooks/planesCuentas/useAccountPanel.ts` | ~90% | Funcional, minor gaps |
| `hooks/planesCuentas/usePlanDeCuentasTree.ts` | ~85% | Falta soporte toggle único |
| `utils/planDeCuentasUtils.ts` | ~95% | Completo |

### Lo que ya funciona
- Árbol jerárquico 8 niveles con expand/collapse
- Búsqueda con filtrado y highlight
- AccountPanel responsive (desktop 440px / tablet fixed / mobile bottom sheet)
- Code preview en tiempo real con verificación debounced (300ms)
- Contracuenta condicional (115*, 215*, 11405*) con autocomplete
- Year selector dinámico
- Zod validation + React Hook Form
- RTK Query (useObtenerArbolCompletoQuery, mutations)

## Especificación

### Fase 1 — MERIDIAN Visual Alignment

#### 1.1 Level Badges — Sin cambios

Badges N1–N3 (Título, Grupo, Subgrupo) ya están implementados en `CustomTreeItem.tsx` y se mantienen como están. N4–N8 no llevan badge (se identifican por indentación jerárquica).

#### 1.2 Código con DM Mono

**Ubicación**: `CustomTreeItem.tsx` — el span del código formateado.

```css
font-family: 'DM Mono', monospace;
font-size: 11.5px;
letter-spacing: 0.02em;
font-feature-settings: 'tnum' 1, 'cv01' 1;
color: theme.palette.text.secondary; /* --tx2 */
margin-right: 12px;
```

#### 1.3 Nombre con DM Sans

```css
font-family: 'DM Sans', sans-serif;
font-size: 13px;
color: theme.palette.text.primary; /* --tx */
flex: 1;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

**Variaciones por nivel** (del prototipo):
- **N1**: 13.5px, weight 600, color primary
- **N2**: 13px, weight 500, color primary
- **N3–N8**: 13px, weight 400, color primary

#### 1.4 Título con Bricolage Grotesque

**Ubicación**: `PlanDeCuentas.tsx` — el `<h1>` "Plan de Cuentas".

```tsx
fontFamily: 'var(--font-display, "Bricolage Grotesque", sans-serif)',
fontSize: isMobile ? '1rem' : '1.25rem',  // ya implementado, OK
fontWeight: 700,
letterSpacing: '-0.02em',
```

#### 1.5 Action Buttons 28×28px

**Ubicación**: `CustomTreeItem.tsx` — botones de acción por fila.

```css
/* Contenedor de acciones */
.pc-row-acts {
  display: flex;
  gap: 4px;
  padding: 3px 4px;
  background: theme.meridian.surfaces.s3;
  border: 1px solid theme.meridian.borders.muted;
  border-radius: 4px;  /* --r-sm */
  box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  opacity: 0;  /* visible on hover */
}

/* Cada botón */
.pc-row-btn {
  width: 28px;
  height: 28px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: theme.palette.text.disabled; /* --tx3 */
  transition: background 100ms, color 100ms;
}

/* Hover por tipo */
.pc-row-btn--add:hover {
  background: alpha(accent, 0.12);
  color: accent;
}
.pc-row-btn--edit:hover {
  background: alpha(info, 0.10);
  color: info.main;
}
.pc-row-btn--del:hover {
  background: alpha(error, 0.10);
  color: error.main;
}
```

**Regla Fitts' Law**: En pantallas CRUD-heavy como Plan de Cuentas, 28×28px es el mínimo para evitar misclicks en acciones destructivas (eliminar).

#### 1.6 Row Hover Instant

**Ubicación**: `CustomTreeItem.tsx` — hover del `.pc-node-row`.

```css
/* Prototipo: background 80ms (casi instant) */
transition: background 80ms;
/* hover */
background: theme.meridian.surfaces.s3; /* --s3 */
```

**Importante**: MERIDIAN dicta hover instant en tablas/árboles. No usar transition > 100ms para background de filas.

#### 1.7 Chevron con Rotación Animada

```css
/* Cerrado → Abierto: rotate(0deg) → rotate(90deg) */
transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), color 150ms;
/* Cerrado */
color: theme.meridian.text.tx4;
/* Abierto */
color: theme.palette.primary.main;
transform: rotate(90deg);
```

#### 1.8 Children Container con Grid Animation

```css
/* Expand/Collapse via CSS Grid (no height animation) */
.pc-children {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 260ms cubic-bezier(0.16, 1, 0.3, 1);
}
.pc-children.collapsed {
  grid-template-rows: 0fr;
}
.pc-children-inner {
  overflow: hidden;
  min-height: 0;
  border-left: 1px solid theme.meridian.borders.muted;
  margin-left: 20px;
}
```

#### 1.9 Selected & Acting States

**Selected** (nodo seleccionado):
```css
background: alpha(accent, 0.08);
/* pseudo-element left border */
&::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: accent;
}
```

**Acting** (nodo con acción en curso — crear/editar):
```css
background: alpha(accent, 0.05);
&::before { opacity: 0.5; }
```

**Supresión de hover-actions con selección** (seguridad MERIDIAN):
```css
/* Cuando hay selección, solo el nodo seleccionado muestra acciones */
.tree.has-selection .node:not(.selected) .row-acts {
  opacity: 0;
  pointer-events: none;
}
```

---

### Fase 2 — UX Parity con Prototipo

#### 2.1 Toggle Único Expandir/Colapsar

**Ubicación**: `PlanDeCuentas.tsx` — reemplazar los dos `<Button>` actuales.

**Comportamiento** (del prototipo):
1. Un solo botón con ícono `ChevronsUpDown` (o equivalente Lucide)
2. Label dinámico: "Expandir" cuando hay nodos colapsados, "Colapsar" cuando todos están expandidos
3. Ícono rota/cambia según estado
4. Click: toggle entre expandAll y collapseAll

**Implementación**:
```tsx
// En usePlanDeCuentasTree.ts — agregar:
const areAllExpanded = useMemo(() => {
  // Contar nodos expandibles vs expandidos
  function countExpandable(nodes: TreeItemData[]): number {
    let c = 0;
    for (const n of nodes) {
      if (n.children?.length) { c++; c += countExpandable(n.children); }
    }
    return c;
  }
  return expandedItems.length >= countExpandable(treeData);
}, [expandedItems, treeData]);

const toggleAll = useCallback(() => {
  if (areAllExpanded) collapseAll();
  else expandAll();
}, [areAllExpanded, collapseAll, expandAll]);
```

**UI** (un solo botón):
```tsx
<Button
  variant="outlined"
  color="secondary"
  size="small"
  startIcon={areAllExpanded ? <FoldVertical size={14} /> : <UnfoldVertical size={14} />}
  onClick={tree.toggleAll}
>
  {!isSmallPhone && (areAllExpanded ? 'Colapsar' : 'Expandir')}
</Button>
```

#### 2.2 Contador de Resultados de Búsqueda

**Ubicación**: `PlanDeCuentas.tsx` — toolbar, junto al search input.

**Comportamiento**:
- Sin búsqueda: mostrar stats (Cuentas X · Niveles 8)
- Con búsqueda: ocultar stats, mostrar `"X resultado(s)"` con `X` en mono bold

**Implementación**:
```tsx
// En usePlanDeCuentasTree.ts — agregar:
const matchCount = useMemo(() => {
  if (!searchTerm.trim()) return 0;
  const term = searchTerm.toLowerCase().trim();
  function count(nodes: TreeItemData[]): number {
    let c = 0;
    for (const n of nodes) {
      const code = n.label?.toLowerCase() ?? '';
      const name = n.nombre?.toLowerCase() ?? '';
      if (code.includes(term) || name.includes(term)) c++;
      if (n.children?.length) c += count(n.children);
    }
    return c;
  }
  return count(treeData);
}, [searchTerm, treeData]);
```

**UI**:
```tsx
{tree.searchTerm.trim() ? (
  <StatItem>
    <span className="stat-value">{tree.matchCount}</span>
    {` resultado${tree.matchCount !== 1 ? 's' : ''}`}
  </StatItem>
) : (
  <>
    <StatItem>
      <Layers size={12} /> Cuentas <span className="stat-value">{totalCuentas}</span>
    </StatItem>
    <StatItem>
      <GitBranch size={12} /> Niveles <span className="stat-value">8</span>
    </StatItem>
  </>
)}
```

#### 2.3 Selección Persistente

**Ubicación**: `PlanDeCuentas.tsx` + `CustomTreeItem.tsx`

**Comportamiento** (del prototipo):
1. Click en un nodo → se selecciona (marcador visual con left border accent)
2. Click en el mismo nodo → selección **persiste** (no toggle off)
3. Click en otro nodo → marcador se mueve
4. Si el nodo tiene hijos → además de seleccionar, toggle expand/collapse
5. Con selección activa: solo el nodo seleccionado muestra hover-actions

**Implementación**:
```tsx
// En PlanDeCuentas.tsx:
const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

const handleSelectNode = useCallback((item: TreeItemData) => {
  setSelectedNodeId(item.id);
  // Si tiene hijos, toggle expand/collapse
  if (item.children?.length) {
    handleToggleNode(item.id);
  }
}, [handleToggleNode]);
```

**Estado visual en CustomTreeItem**:
- Prop `isSelected: boolean`
- Prop `hasSelection: boolean` (si algún nodo está seleccionado en el árbol)
- Si `hasSelection && !isSelected` → suprimir hover-actions (opacity: 0, pointer-events: none)

#### 2.4 Indicador de Nodo Actuando

**Ubicación**: `CustomTreeItem.tsx`

**Comportamiento**: Cuando se abre el panel de crear/editar, el nodo afectado recibe un estilo visual distinto (`acting`).

- **Crear**: el nodo padre (donde se crea la subcuenta) se marca como acting
- **Editar**: el nodo que se edita se marca como acting

**Prop**: `actingId: string | null` (ya existe parcialmente como `contextId`)

**Estilos**:
```css
/* Acting node */
background: alpha(accent, 0.05);
&::before { /* left border */ opacity: 0.5; }
```

---

### Fase 3 — Delete Cascade Warning

#### 3.1 Conteo Recursivo de Hijos

**Ubicación**: `DeleteConfirmDialog.tsx`

**Comportamiento** (del prototipo):
- Si la cuenta tiene hijos: `"⚠ Esta cuenta tiene X subcuenta(s). Se eliminarán también."`
- Si no tiene hijos: `"Esta acción no se puede deshacer."`

**Props adicionales**:
```tsx
interface DeleteConfirmDialogProps {
  open: boolean;
  accountCode: string;
  accountName: string;
  childCount: number;  // NUEVO — conteo recursivo de descendientes
  onClose: () => void;
  onConfirm: () => void;
}
```

**Cálculo** (en `PlanDeCuentas.tsx`):
```tsx
function countDescendants(node: TreeItemData): number {
  if (!node.children?.length) return 0;
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child);
  }
  return count;
}
```

**UI del warning**:
```tsx
{childCount > 0 ? (
  <Box sx={{ color: 'warning.main', display: 'flex', gap: 0.5, alignItems: 'center' }}>
    <AlertTriangle size={14} />
    <Typography variant="body2">
      Esta cuenta tiene {childCount} subcuenta{childCount > 1 ? 's' : ''}.
      Se eliminarán también.
    </Typography>
  </Box>
) : (
  <Typography variant="body2" color="text.secondary">
    Esta acción no se puede deshacer.
  </Typography>
)}
```

---

### Fase 4 — Implementar Eliminación vía API

#### 4.1 handleConfirmDelete con Mutation Real

**Ubicación**: `PlanDeCuentas.tsx` → `handleConfirmDelete`

**Actualmente**: `// TODO: implementar eliminacion real via API`

**Implementación**:
```tsx
const [eliminarCuenta] = useEliminarPlanesCuentaMutation();

const handleConfirmDelete = useCallback(async () => {
  if (!deleteTarget) return;
  try {
    await eliminarCuenta({ id: deleteTarget.item.idPlanCuenta }).unwrap();
    toast.success(`Cuenta ${deleteTarget.item.label} eliminada`);
    setDeleteTarget(null);
    // Si el nodo eliminado estaba seleccionado, limpiar selección
    if (selectedNodeId === deleteTarget.item.id) {
      setSelectedNodeId(null);
    }
  } catch {
    toast.error('Error al eliminar la cuenta');
  }
}, [deleteTarget, eliminarCuenta, selectedNodeId]);
```

**Requisito API**: El endpoint de eliminación debe manejar cascade (eliminar hijos) a nivel de base de datos o lógica de negocio.

---

### Fase 5 — Refactorización: Calidad de Código y Buenas Prácticas

Auditoría del código actual contra los estándares de CLAUDE.md. Cada hallazgo debe corregirse durante la implementación de las fases anteriores.

#### 5.1 Zero `any` — Eliminar Supresiones

| Archivo | Línea | Problema | Fix |
|---------|-------|----------|-----|
| `AccountPanel.tsx` | ~492 | `control: any` con `biome-ignore` | Tipar como `Control<AccountFormData>` de react-hook-form |
| `planDeCuentasUtils.ts` | ~117 | `palette: any` con `biome-ignore` | Tipar como `Theme['palette']` de MUI o aceptar `Theme` completo |

**Regla**: Nunca suprimir errores de lint con `biome-ignore` para `any`. Resolver el tipo.

#### 5.2 Zero Colores Hardcodeados — 35+ Instancias

**CRÍTICO**: La mayor deuda técnica del componente.

| Archivo | Instancias | Ejemplos |
|---------|-----------|----------|
| `CustomTreeItem.tsx` | ~12 | `'rgba(13,107,94,0.12)'`, `'#0d6b5e'`, `'#4f46c9'`, `'#d97706'`, `MOBILE_LEVEL_COLORS`, `MOBILE_CODE_STYLES` |
| `AccountPanel.tsx` | ~10 | `'rgba(13,107,94,0.1)'`, `'#0d6b5e'`, `'rgba(37,99,235,0.1)'`, `'#2563eb'`, `'rgba(0,0,0,0.4)'` |
| `DeleteConfirmDialog.tsx` | ~2 | `'rgba(0,0,0,0.5)'`, `'rgba(0,0,0,0)'` |

**Patrón de reemplazo**:
```tsx
// ❌ Hardcodeado
bgcolor: 'rgba(13,107,94,0.12)'
color: '#0d6b5e'

// ✅ Theme tokens
bgcolor: alpha(theme.palette.primary.main, 0.12)
color: theme.palette.primary.main

// ❌ Hardcodeado (backdrop)
bgcolor: 'rgba(0,0,0,0.4)'

// ✅ Theme tokens
bgcolor: alpha(theme.palette.common.black, 0.4)
```

**Nota**: Los colores `#0d6b5e` y `rgba(13,107,94,*)` corresponden al accent de Contabilidad (emerald). Deben referenciar `theme.palette.primary.main` que se actualiza automáticamente por módulo activo.

#### 5.3 Imports No Usados

| Archivo | Import | Acción |
|---------|--------|--------|
| `planDeCuentasUtils.ts` | `import { alpha } from '@mui/material/styles'` | Eliminar — no se usa en el archivo |

#### 5.4 Performance — Re-renders Evitables

| Archivo | Problema | Fix |
|---------|----------|-----|
| `CustomTreeItem.tsx` | `handleRowClick` y `handleToggleClick` se recrean en cada render | Envolver en `useCallback` con deps correctas |
| `AccountFormFields.tsx` | `getCodigoFieldState()` se recalcula en cada render sin memoización | Envolver en `useMemo` (lógica pura, solo depende de props) |

**Regla general**: Todo handler pasado como prop o usado en JSX debe estar en `useCallback`. Todo cálculo derivado debe estar en `useMemo`.

#### 5.5 Zod — Schemas Correctos

| Archivo | Problema | Severidad | Fix |
|---------|----------|-----------|-----|
| `planesCuentas.zod.ts` ~L54 | Error message incorrecto: dice `"el código es obligatorio"` cuando debería decir `"debe tener exactamente X dígitos"` | **BUG** | Descomentar el mensaje correcto (L53) y eliminar el incorrecto |
| `planesCuentas.zod.ts` ~L40 | `tipoCuentaId === 8` no tiene case en `expectedLength` → retorna 0 | **BUG** | Agregar case: `[5, 6, 7, 8].includes(tipoCuentaId)` → 3 dígitos |
| `planesCuentas.zod.ts` ~L19 | `codigo: z.string()` sin `.min(1)` — validación loose | Medio | Agregar `.min(1, 'El código es obligatorio')` al schema base |
| `useAccountPanel.ts` ~L13-24 | `AccountFormData` duplicado — existe en `AccountPanel.types.ts` y en el hook | Medio | Importar desde `AccountPanel.types.ts`, eliminar duplicado |

**Schema consolidado correcto**:
```tsx
// En planesCuentas.zod.ts:
function withCodigoLength(schema: typeof baseObject) {
  return schema.superRefine((data, ctx) => {
    const expectedLength =
      data.tipoCuentaId === 3 || data.tipoCuentaId === 4 ? 2 :
      [5, 6, 7, 8].includes(data.tipoCuentaId) ? 3 : 0; // ← FIX: incluir 8

    if (expectedLength > 0 && data.codigo.length !== expectedLength) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['codigo'],
        message: `El código debe tener exactamente ${expectedLength} dígitos numéricos.`, // ← FIX: mensaje correcto
      });
    }
  });
}
```

#### 5.6 Atomic Design — Ubicación Correcta de Componentes

| Componente | Ubicación Actual | Decisión | Justificación |
|-----------|-----------------|----------|---------------|
| `DeleteConfirmDialog` | `mf_contabilidad/components/planCuentas/` | **Promover a mf_ui** → `molecules/ConfirmDialog/` | Diálogo de confirmación genérico, reutilizable por cualquier MF. Renombrar a `ConfirmDialog` con props genéricas (title, message, confirmLabel, variant) |
| `FieldLabel` (dentro de AccountFormFields) | Inline en `AccountFormFields.tsx` | **Evaluar** — si se usa en otros forms, promover a `mf_ui/atoms/` | Actualmente solo se usa en AccountFormFields |
| `CodePreview` (dentro de AccountPanel) | Inline en `AccountPanel.tsx` | **Mantener local** | Específico del plan de cuentas, no reutilizable |
| `LevelBadge` | `CustomTreeItem.tsx` | **Mantener local** | Específico del árbol de cuentas |

**Acción concreta para DeleteConfirmDialog**:
1. Crear `mf_ui/src/components/molecules/ConfirmDialog/ConfirmDialog.tsx`
2. Props genéricas: `{ open, title, message, warningMessage?, confirmLabel, cancelLabel, variant: 'danger' | 'warning', onClose, onConfirm }`
3. En `mf_contabilidad`: importar desde `mf_ui` y pasar props específicas de eliminación de cuentas
4. Eliminar `DeleteConfirmDialog.tsx` de `mf_contabilidad`

---

## Mapa de Archivos Afectados

| Archivo | Fase | Cambios |
|---------|------|---------|
| `mf_contabilidad/src/components/CustomTreeItem.tsx` | 1, 2, 5 | Typography, action buttons 28×28, hover instant, selected/acting states, eliminar colores hardcodeados (~12), `useCallback` en handlers |
| `mf_contabilidad/src/page/planDeCuentas/PlanDeCuentas.tsx` | 1, 2, 3, 4 | Toggle único, contador búsqueda, selección persistente, cascade warning, delete API |
| `mf_contabilidad/src/components/PlanDeCuentasTree.tsx` | 2 | Props hasSelection, actingId, selectedNodeId |
| `mf_contabilidad/src/components/planCuentas/AccountPanel/AccountPanel.tsx` | 5 | Eliminar `any` en CodePreview, eliminar colores hardcodeados (~10) |
| `mf_contabilidad/src/components/planCuentas/AccountFormFields.tsx` | 5 | `useMemo` en `getCodigoFieldState()` |
| `mf_contabilidad/src/components/planCuentas/DeleteConfirmDialog.tsx` | 3, 5 | Promover a `mf_ui` como `ConfirmDialog`, eliminar colores hardcodeados |
| `mf_contabilidad/src/hooks/planesCuentas/usePlanDeCuentasTree.ts` | 2 | areAllExpanded, toggleAll, matchCount |
| `mf_contabilidad/src/hooks/planesCuentas/useAccountPanel.ts` | 2, 5 | actingId tracking, eliminar tipo duplicado `AccountFormData` |
| `mf_contabilidad/src/utils/planDeCuentasUtils.ts` | 5 | Eliminar `any`, eliminar import no usado (`alpha`) |
| `mf_contabilidad/src/types/zod/planesCuentas.zod.ts` | 5 | Fix tipoCuentaId 8, fix error message, `.min(1)` en codigo |
| `mf_ui/src/components/molecules/ConfirmDialog/` | 5 | **NUEVO** — diálogo de confirmación genérico (promovido desde mf_contabilidad) |

## Criterios de Aceptación

### Fase 1 — Visual
- [x] Badges N1–N3 se mantienen (ya implementados). N4–N8 sin badge — verificar que no se rendericen
- [x] Código usa font DM Mono 11.5px con font-feature-settings tnum
- [x] Nombre usa font DM Sans 13px con variaciones de weight por nivel
- [x] Título "Plan de Cuentas" usa Bricolage Grotesque
- [x] Action buttons son 28×28px con gap 4px en contenedor con bg/border/shadow
- [x] Hover de fila es instant (<100ms) con bg `theme.meridian.surfaces.s3`
- [x] Chevron rota 90deg con easing `cubic-bezier(0.16, 1, 0.3, 1)` en 200ms
- [x] Children expand/collapse usa CSS Grid animation (grid-template-rows)
- [x] Zero colores hardcodeados — todo via theme tokens

### Fase 2 — UX
- [x] Un solo botón toggle Expandir/Colapsar con label e ícono dinámicos
- [x] Al buscar se muestra "X resultado(s)" reemplazando las stats
- [x] Click en nodo = selección persistente con left border accent 2px
- [x] Click en mismo nodo NO deselecciona (marcador persiste)
- [x] Con selección activa, solo el nodo seleccionado muestra hover-actions
- [x] Si nodo tiene hijos, click selecciona + toggle expand/collapse
- [x] Nodo con acción activa (crear/editar) tiene estilo visual acting

### Fase 3 — Delete Cascade
- [x] Dialog de eliminación muestra "Esta cuenta tiene X subcuenta(s). Se eliminarán también." cuando hay hijos
- [x] Warning usa color `warning.main` con ícono AlertTriangle
- [x] Sin hijos: muestra "Esta acción no se puede deshacer."

### Fase 4 — API Delete
- [x] handleConfirmDelete llama a mutation real (useEliminarPlanesCuentaMutation)
- [x] Toast de éxito muestra código formateado de la cuenta eliminada
- [x] Toast de error en caso de falla
- [x] Selección se limpia si el nodo eliminado estaba seleccionado

### Fase 5 — Calidad de Código
- [ ] Zero `any`: eliminar `control: any` en AccountPanel.tsx y `palette: any` en planDeCuentasUtils.ts
- [ ] Zero colores hardcodeados: reemplazar 35+ instancias en CustomTreeItem, AccountPanel, DeleteConfirmDialog
- [ ] Import no usado eliminado (`alpha` en planDeCuentasUtils.ts)
- [ ] `useCallback` en `handleRowClick` y `handleToggleClick` de CustomTreeItem.tsx
- [ ] `useMemo` en `getCodigoFieldState()` de AccountFormFields.tsx
- [ ] Zod: fix tipoCuentaId 8 en `expectedLength`, fix error message, `.min(1)` en codigo
- [ ] Tipo `AccountFormData` consolidado — importar desde `AccountPanel.types.ts`, eliminar duplicado en useAccountPanel.ts
- [ ] `ConfirmDialog` promovido a `mf_ui/molecules/` con props genéricas
- [ ] `tsc --noEmit` sin errores en todos los archivos modificados

## Restricciones

- **Zero `any`**: toda la implementación con tipos explícitos
- **Zero colores hardcodeados**: usar `theme.palette.*`, `theme.meridian.*`, `alpha()`
- **Reutilizar mf_ui**: antes de crear un componente, verificar si existe en `mf_ui/src/components/`
- **No duplicar átomos**: Badge de mf_ui para chips genéricos; LevelBadge es específico del árbol (OK crear en CustomTreeItem)
- **Mantener responsive**: desktop, tablet (≤1200px), mobile (≤640px)
- **Accesibilidad**: focus visible en todos los botones, keyboard navigation funcional, `prefers-reduced-motion` respetado
- **Performance**: No animar `backdrop-filter`, no animar `width/height` (usar `transform`/`grid-template-rows`)
- **Max 2 backdrop-filter** simultáneos (regla MERIDIAN GPU)
- **No modificar API/backend** en Fases 1-3

## Notas

### Decisiones de diseño
1. **LevelBadge N1–N3 ya implementado**: se mantiene sin cambios. N4–N8 sin badge — la indentación jerárquica es suficiente para identificar el nivel.
2. **Selección persistente sin toggle-off**: decisión de MERIDIAN — el usuario siempre sabe dónde está trabajando. Para deseleccionar, se hace click en otra zona vacía del árbol.
3. **Supresión de hover-actions con selección**: patrón de seguridad MERIDIAN para datos financieros — fuerza selección deliberada antes de actuar.
4. **Toggle único vs dos botones**: el prototipo usa toggle único que detecta estado; es más limpio y ahorra espacio en móvil.

### Relación con otros specs
- `feat-crear-cuenta-navegacion-profunda.spec.md` — navegación deep post-creación (complementario)
- `fix-verificacion-codigo-cuenta.spec.md` — verificación de código duplicado (ya implementado)

### Fuentes tipográficas requeridas
Las fuentes MERIDIAN deben estar cargadas globalmente. Verificar que existan en el HTML root o en el theme provider:
- `Bricolage Grotesque Variable` (display)
- `DM Sans Variable` (body)
- `Space Grotesk` (números)
- `DM Mono` (código/monospace)

### Tokens MERIDIAN referenciados
Si `theme.meridian` no existe aún en el theme de mf_contabilidad, los estilos deben usar fallbacks seguros:
```tsx
// Patrón de fallback
theme.meridian?.surfaces?.s3 ?? theme.palette.action.hover
theme.meridian?.text?.tx4 ?? theme.palette.text.disabled
theme.meridian?.borders?.muted ?? theme.palette.divider
```
