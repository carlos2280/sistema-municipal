---
name: drizzle-db
description: Experto en Drizzle ORM, schemas de base de datos y migraciones PostgreSQL. Aplicar cuando se modifiquen schemas de DB, se creen migraciones, se escriban queries Drizzle, o se trabaje con los packages db-identidad, db-contabilidad, db-mensajeria, db-platform.
context: fork
allowed-tools: [Read, Grep, Glob, Bash]
---

Eres un experto en la capa de datos de este sistema municipal con Drizzle ORM.

## Packages de schemas
| Package | Dominio | Tablas principales |
|---------|---------|-------------------|
| `packages/db-identidad` | Auth/Usuarios | usuarios, perfiles, departamentos, areas, menus, sistemas |
| `packages/db-contabilidad` | Contabilidad | planesCuentas, presupuestos, centrosCosto, subprogramas |
| `packages/db-mensajeria` | Chat/Llamadas | conversaciones, archivos, llamadas, estadoUsuarios |
| `packages/db-platform` | Plataforma | entidades de plataforma |

## Estructura de cada package db-*
```
packages/db-<dominio>/
├── src/
│   ├── schemas/      → Definicion de tablas con Drizzle
│   └── index.ts      → Barrel export
├── drizzle/          → Migraciones generadas (NO editar manualmente)
└── drizzle.config.ts → Config de drizzle-kit
```

## Patrones Drizzle ORM de este proyecto

### Definicion de tabla
```typescript
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  activo: boolean('activo').notNull().default(true),
  creadoEn: timestamp('creado_en').notNull().defaultNow(),
});

export type Usuario = typeof usuarios.$inferSelect;
export type NuevoUsuario = typeof usuarios.$inferInsert;
```

### Query con Drizzle
```typescript
import { db } from '@municipal/core/db';
import { usuarios } from '@municipal/db-identidad';
import { eq, and } from 'drizzle-orm';

const user = await db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
const [newUser] = await db.insert(usuarios).values(nuevoUsuario).returning();
await db.update(usuarios).set({ activo: false }).where(eq(usuarios.id, id));
```

## Reglas de migracion

1. **NUNCA editar archivos en `drizzle/` manualmente**
2. Cambiar el schema en `packages/db-*/src/schemas/`
3. Generar migracion: `pnpm --filter db-<dominio> exec drizzle-kit generate`
4. Revisar la migracion generada antes de aplicar
5. Aplicar: `pnpm --filter db-<dominio> exec drizzle-kit migrate`

## Convenciones de nombres
- Tablas: `camelCase` en codigo TS, `snake_case` en PostgreSQL
- Columnas: `camelCase` en codigo → `snake_case` en DB via mapeo Drizzle
- IDs: siempre UUID (`uuid().primaryKey().defaultRandom()`)
- Timestamps: `creadoEn`, `actualizadoEn` en todas las tablas principales
- Soft delete: columna `activo boolean` (no borrar fisicamente datos criticos)

## Tarea: $ARGUMENTS

Analiza lo solicitado:
1. Identifica el package db-* afectado
2. Lee los schemas actuales relacionados
3. Si hay cambio de schema: describe la migracion necesaria y su impacto
4. Si es una query: sugiere la implementacion Drizzle mas eficiente
5. Verifica que los tipos inferidos (`$inferSelect`, `$inferInsert`) esten siendo usados

Prioriza: integridad referencial, migraciones seguras (no destructivas si hay datos), uso de tipos inferidos de Drizzle.
