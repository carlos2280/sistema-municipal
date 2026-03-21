# Standards & Checklist — UI Quality

## Accesibilidad — obligatorio

```tsx
// IconButton SIEMPRE con aria-label
<IconButton onClick={onDelete} aria-label="Eliminar registro">
  <Trash2 aria-hidden="true" />
</IconButton>

// Input SIEMPRE con label
<TextField label="Buscar" placeholder="Ej: decreto 2024..." />

// Iconos decorativos con aria-hidden
<Activity size={20} aria-hidden="true" />

// Async updates con aria-live
<Box role="status" aria-live="polite">{message}</Box>

// Elementos interactivos: SIEMPRE <button> o <a>, NUNCA <div onClick>
```

## Focus states — obligatorio

```typescript
// NUNCA outline: 0 sin reemplazo
// Usar focus-visible (no en click, solo en teclado):
'&.Mui-focusVisible': {
  outline: `2px solid ${palette.primary.main}`,
  outlineOffset: 2,
},
```

## Formularios

- `autocomplete` y `name` en todos los inputs
- NUNCA bloquear `onPaste`
- Submit: deshabilitado + spinner durante request
- Errores inline junto al campo, no solo en toast
- Advertir cambios no guardados antes de navegar

```tsx
<Button type="submit" disabled={loading}
  startIcon={loading ? <CircularProgress size={16} /> : <Save size={16} />}>
  {loading ? 'Guardando\u2026' : 'Guardar'}
</Button>
```

## Tipografia y copy

- Puntos suspensivos: `\u2026` (un caracter), no `...` (tres puntos)
- `text-wrap: balance` en headings
- `fontVariantNumeric: 'tabular-nums'` en numeros/columnas
- Copys de accion especificos: "Guardar Contrato" no "Aceptar"
- Mensajes de error con proximo paso: "Verifica tu conexion e intenta de nuevo"
- Loading states terminan con `\u2026`: "Guardando\u2026"

## Fechas y numeros — internacionalizacion

```typescript
// SIEMPRE usar Intl.* (nunca formatos hardcodeados)
new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);
```

## Touch e interaccion

- Drawers/modales: `overscrollBehavior: 'contain'`
- `touchAction: 'manipulation'` en ButtonBase (elimina delay 300ms)
- `userSelect: 'none'` durante drag
- `autoFocus` solo en desktop (verificar con `window.matchMedia('(hover: hover)')`)

## Performance

- Listas > 50 items: virtualizar (content-visibility o react-virtuoso)
- NUNCA leer layout en render (getBoundingClientRect, offsetHeight)
- Inputs no controlados cuando no se necesita validacion reactiva por keystroke
- Imagenes: dimensiones explicitas (`width`, `height`), `loading="lazy"` below-fold

## URL-driven state

```tsx
// Filtros, tabs y paginacion SIEMPRE en la URL
const [searchParams, setSearchParams] = useSearchParams();
const page = Number(searchParams.get('page') ?? '1');
// Links con <Link> de react-router-dom (soporte Ctrl+click)
```

## Anti-patrones — prohibidos

- Colores hardcodeados: usar `'primary.main'` o `theme.palette.*`
- `transition: all` → especificar propiedades
- IconButton sin `aria-label`
- `outline: none` sin reemplazo focus-visible
- `<div onClick>` para navegacion → usar `<Link>`
- Imagen sin dimensiones (causa CLS)
- Lista grande sin virtualizacion
- Fechas formateadas manualmente → usar `Intl.DateTimeFormat`
- `user-scalable=no` (impide zoom accesibilidad)
- `z-index: 9999` → usar `theme.zIndex.*`
- `!important` en sx

## Checklist antes de commit

**Diseno**
- [ ] Botones siguen jerarquia (contained/outlined/text)?
- [ ] Colores usan `alpha()` para fondos?
- [ ] `shouldForwardProp` en styled con props custom?
- [ ] Glassmorphism en <= 3 elementos por pagina?
- [ ] Spacing en escala de 8px?

**Animaciones**
- [ ] Respetan `prefers-reduced-motion`?
- [ ] Solo usan `transform` y `opacity`?
- [ ] Ninguno usa `transition: all`?
- [ ] Duracion <= 300ms con easing explicito?

**Accesibilidad**
- [ ] IconButton con `aria-label`?
- [ ] Iconos decorativos con `aria-hidden`?
- [ ] Inputs con label?
- [ ] Interactivos son `<button>` o `<a>`?
- [ ] Focus-visible sin `outline: none` desnudo?

**UX**
- [ ] Empty states con accion util?
- [ ] Loading states con skeleton?
- [ ] Destructivos piden confirmacion?
- [ ] Filtros/tabs en la URL?
