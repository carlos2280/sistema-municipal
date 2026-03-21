---
paths:
  - "packages/db-*/**/*.ts"
  - "packages/seeders/**/*.ts"
  - "packages/shared/src/database/**/*.ts"
---

# Drizzle ORM — Convenciones de schemas y migraciones

## Regla de oro: NUNCA editar `drizzle/` manualmente
Los archivos en `packages/db-*/drizzle/` son generados por drizzle-kit.
Flujo correcto:
1. Editar schema en `packages/db-*/src/schemas/*.ts`
2. `pnpm --filter db-<dominio> exec drizzle-kit generate`
3. Revisar la migracion generada
4. `pnpm --filter db-<dominio> exec drizzle-kit migrate`

## Tipos inferidos: siempre usar `$inferSelect` y `$inferInsert`
```typescript
// ✅ Correcto — tipos inferidos automaticamente
export type Usuario = typeof usuarios.$inferSelect;
export type NuevoUsuario = typeof usuarios.$inferInsert;

// ❌ Incorrecto — redefinir manualmente rompe la fuente de verdad
interface Usuario { id: string; email: string; ... }
```

## Convenciones de definicion
```typescript
// IDs: siempre UUID
id: uuid('id').primaryKey().defaultRandom(),

// Timestamps en todas las entidades principales
creadoEn: timestamp('creado_en').notNull().defaultNow(),
actualizadoEn: timestamp('actualizado_en').notNull().defaultNow(),

// Soft delete (preferir sobre borrado fisico en datos criticos)
activo: boolean('activo').notNull().default(true),
```
- Nombres de tabla en codigo: `camelCase` → en PostgreSQL: `snake_case` (Drizzle mapea automaticamente)
- Columnas en codigo: `camelCase` → en DB: `snake_case`

## Queries: usar operadores de drizzle-orm
```typescript
import { eq, and, or, inArray, isNull } from 'drizzle-orm';
// NUNCA raw SQL para queries que se pueden expresar con el ORM
// Solo raw SQL para queries que el ORM no puede expresar
```

## Packages por dominio
| Package | Dominio |
|---------|---------|
| `packages/db-identidad` | Auth, usuarios, perfiles, departamentos |
| `packages/db-contabilidad` | Presupuestos, plan de cuentas, centros de costo |
| `packages/db-mensajeria` | Conversaciones, archivos, llamadas |
| `packages/db-platform` | Modulos, sistemas, entidades de plataforma |
