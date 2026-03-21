# db-contabilidad — Schema de base de datos

Package de schemas Drizzle para el dominio contable. Se carga al trabajar en esta carpeta.

## Estructura
```
packages/db-contabilidad/
├── src/schemas/      → Definición de tablas
│   ├── planesCuentas.ts
│   ├── presupuestos.ts
│   ├── presupuestosDetalle.ts
│   └── centrosCosto.ts
├── drizzle/          → Migraciones GENERADAS (NO editar manualmente)
├── drizzle.config.ts → Config de drizzle-kit
└── src/index.ts      → Barrel export
```

## ⚠️ Regla crítica
**NUNCA** editar archivos en `drizzle/` a mano.
Siempre: editar schema → `drizzle-kit generate` → revisar → `drizzle-kit migrate`

## Tablas y relaciones
- `planesCuentas` → árbol jerárquico (parentId autorreferencial), un plan por año fiscal
- `presupuestos` → cabecera del presupuesto anual (año, entidad, estado)
- `presupuestosDetalle` → líneas del presupuesto (FK a planCuenta + presupuesto)
- `centrosCosto` → unidades de ejecución (FK a departamentos de db-identidad)

## Tipos exportados
```typescript
import {
  PlanCuenta, NuevoPlanCuenta,
  Presupuesto, NuevoPresupuesto,
  PresupuestoDetalle, NuevoPresupuestoDetalle
} from '@municipal/db-contabilidad';
```

Usar siempre `$inferSelect` / `$inferInsert` — nunca redefinir manualmente.
