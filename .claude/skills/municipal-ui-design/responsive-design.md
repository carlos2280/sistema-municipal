# Responsive Design — MUI v7

## Breakpoints del sistema

| Token | px | Contexto |
|-------|----|----------|
| `xs` | 0-599 | Mobile portrait |
| `sm` | 600-899 | Mobile landscape / tablet portrait |
| `md` | 900-1199 | Tablet landscape / laptop pequeno |
| `lg` | 1200-1535 | Desktop — baseline de diseno |
| `xl` | 1536+ | Desktop grande |

> Desktop-first (funcionarios en PC), pero usable en tablet. Mobile es secundario.

## Grid responsive

```tsx
// KPI cards: 4 col desktop, 2 tablet, 1 mobile
<Grid container spacing={3}>
  {kpis.map((kpi) => (
    <Grid key={kpi.id} size={{ xs: 12, sm: 6, lg: 3 }}>
      <KpiCard {...kpi} />
    </Grid>
  ))}
</Grid>

// Layout principal: contenido + sidebar
<Grid container spacing={3}>
  <Grid size={{ xs: 12, lg: 8 }}><MainSection /></Grid>
  <Grid size={{ xs: 12, lg: 4 }}><ActivityFeed /></Grid>
</Grid>
```

## sx responsive

```tsx
<Box sx={{
  px: { xs: 2, sm: 3, lg: 4 },
  display: { xs: 'none', md: 'flex' },
  flexDirection: { xs: 'column', sm: 'row' },
  gap: { xs: 1, sm: 2 },
}}>
```

## useMediaQuery

```tsx
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
```

## Navegacion responsive

- Desktop (`>= lg`): drawer permanente
- Mobile/Tablet (`< lg`): drawer temporal con `keepMounted: true`
- Mobile: AppBar sticky con boton hamburguesa

## Tablas en mobile

Opcion 1: scroll horizontal (`overflowX: 'auto'`)
Opcion 2: cambiar a card list en mobile (mejor UX)

```tsx
if (isMobile) {
  return (
    <Stack spacing={1.5}>
      {rows.map((row) => (
        <Paper key={row.id} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2">{row.name}</Typography>
          <StatusChip status={row.status} />
        </Paper>
      ))}
    </Stack>
  );
}
return <FullDataTable rows={rows} />;
```

## Touch targets

- Minimo 44x44px para elementos tactiles (WCAG)
- IconButton: `sx={{ minWidth: 44, minHeight: 44 }}`
- Chips accionables: `sx={{ height: { xs: 44, lg: 32 } }}`

## Espaciado responsive

```tsx
// Mas espacio en desktop, menos en mobile
<Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2, lg: 3 } }}>
<CardContent sx={{ p: { xs: 2, lg: 3 } }}>
<Stack spacing={{ xs: 1, lg: 2 }}>
```

## Tipografia responsive

```tsx
// Solo h2-h3 necesitan escala. h4-h6 estables.
<Typography variant="h4" sx={{
  fontSize: { xs: '1.375rem', sm: '1.625rem', lg: '2.125rem' },
}}>
```

## Checklist responsive

- [ ] Contenedores flex con `minWidth: 0` en hijos?
- [ ] Tablas con scroll o cards en mobile?
- [ ] Touch targets >= 44x44px?
- [ ] Navegacion cambia a drawer temporal en `< lg`?
- [ ] Padding/spacing se reduce en mobile?
- [ ] Textos largos con ellipsis o word-break?
- [ ] Probado en 375px y 768px?
