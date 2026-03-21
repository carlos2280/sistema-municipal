# Component Patterns — MUI v7 + MERIDIAN

## Sistema de botones

### Jerarquia visual
| Nivel | Variante | Uso |
|-------|----------|-----|
| Primario | `variant="contained"` | Una sola accion principal por pantalla |
| Secundario | `variant="outlined"` | Acciones complementarias |
| Terciario | `variant="text"` | Cancelar, ver mas |
| Destructivo | `variant="contained" color="error"` | Eliminar (siempre con confirmacion) |
| Icono | `IconButton` | Acciones contextuales en tablas, cards |

### Tamanos
| Contexto | Size |
|----------|------|
| Acciones principales de pagina | `large` |
| Acciones en cards/secciones | `medium` (default) |
| Acciones en tablas/chips | `small` |

### Grupo de botones
```tsx
<Stack direction="row" spacing={1.5} justifyContent="flex-end">
  <Button variant="text" onClick={onCancel}>Cancelar</Button>
  <Button variant="outlined" onClick={onDraft}>Guardar borrador</Button>
  <Button variant="contained" onClick={onSubmit} startIcon={<Save size={16} />}>Guardar</Button>
</Stack>
```

### IconButton del AppBar — estilo uniforme obligatorio
```tsx
const AppBarIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 10,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  transition: theme.transitions.create(['background-color', 'color', 'transform'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    transform: 'scale(1.05)',
  },
}));
```

## KPI Card

```tsx
const KpiCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.25s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
    borderColor: alpha(theme.palette.primary.main, 0.2),
  },
}));
```

## Glass Card (max 2-3 por pagina)

```tsx
const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(12px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  borderRadius: 20,
  boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.06)},
    inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}`,
}));
```

## Gradient Header Card

```tsx
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: 20,
  position: 'relative',
}));
```

## Tabla de datos

```tsx
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'background-color 0.15s ease',
  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
  '&:last-child td': { borderBottom: 0 },
}));

// Acciones visibles solo en hover
const RowActions = styled(Box)({
  display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.15s ease',
  '[data-row]:hover &': { opacity: 1 },
});
```

## Empty State

```tsx
<EmptyState
  icon={<FileSearch size={48} />}
  title="Sin resultados"
  description="No se encontraron registros con los filtros aplicados."
  action={<Button variant="outlined" onClick={clearFilters}>Limpiar filtros</Button>}
/>
```

## Skeleton loading

```tsx
<SkeletonPage variant="dashboard" />  // Grid de cards
<SkeletonPage variant="table" />      // Tabla
<SkeletonPage variant="form" />       // Formulario
```

## Scrollbar personalizado

```typescript
const customScrollbar = (theme: Theme) => ({
  '&::-webkit-scrollbar': { width: 4, height: 4 },
  '&::-webkit-scrollbar-track': { background: 'transparent' },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.text.primary, 0.15),
    borderRadius: 2,
    '&:hover': { background: alpha(theme.palette.text.primary, 0.3) },
  },
  scrollbarWidth: 'thin',
});
```

## Atmosfera visual

### Gradient mesh (fondo de seccion destacada)
```tsx
background: `
  radial-gradient(ellipse at 20% 50%, ${alpha(primary, 0.08)} 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, ${alpha(secondary, 0.06)} 0%, transparent 40%)
`;
```

### Sombra con color (card destacado)
```tsx
const coloredShadow = (color: string) => ({
  boxShadow: `0 1px 2px ${alpha(color, 0.1)}, 0 4px 12px ${alpha(color, 0.15)}, 0 0 0 1px ${alpha(color, 0.08)}`,
});
```

## Naming de componentes

| Elemento | Convencion | Ejemplo |
|----------|------------|---------|
| Card KPI | `XxxCard` | `RevenueCard` |
| Panel lateral | `XxxDrawer`/`XxxPanel` | `FilterDrawer` |
| Seccion | `XxxSection` | `ActivitySection` |
| Layout | `XxxLayout` | `DashboardLayout` |
| Styled wrapper | `Styled` + nombre | `StyledRow` |
