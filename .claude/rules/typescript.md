---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript — Convenciones universales

Aplica en CUALQUIER archivo `.ts` o `.tsx` que toques.

## Zero tolerancia (errores de compilacion)
- **Zero `any`**: usar tipos explicitos, genericos, `unknown` + type guard, o `Parameters<T>` / `ReturnType<T>`
- **Zero imports sin usar**: si un import ya no se usa, eliminarlo. TS6133 = error.
- **Zero variables sin usar**: misma regla. Declaro → uso, o no declaro.
- Todo archivo modificado debe compilar con `tsc --noEmit` sin warnings

## Tipos vs Interfaces
- `interface` para contratos de componentes (props) y objetos de dominio
- `type` para uniones (`type Status = 'active' | 'inactive'`), intersecciones y utilidades
- Exportar siempre los tipos que otros archivos necesiten

## Patrones obligatorios
- **Early return** para reducir anidacion (ver skill `common`)
- **Function declarations** en componentes React, no `const Foo: React.FC`
- Tipos inferidos de Drizzle: usar `typeof tabla.$inferSelect` y `$inferInsert` — nunca re-definir manualmente
- Zod schemas como fuente de verdad para validacion en el backend: `z.infer<typeof schema>`

## Path aliases — apps vs packages (monorepo)

### Apps (`apps/*`) — usar `@/` para imports profundos
Cada microfrontend y microservicio tiene `@/` como alias de `./src/`:

- **Usar `@/` cuando el import tiene 2+ niveles `../`**
- **Imports de 1 nivel (`./` o `../`) pueden quedar relativos**

```typescript
// ✅ Correcto en apps/
import { formatCodigo } from '@/utils/planDeCuentasUtils';
import type { TreeItemData } from '@/utils/planDeCuentasUtils';

// ❌ Incorrecto en apps/ — fragil, se rompe al mover archivos
import { formatCodigo } from '../../../utils/planDeCuentasUtils';
```

Si el alias `@/` no esta en el `tsconfig.app.json` del mf, agregarlo:
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```
Y en `rsbuild.config.ts`: `resolve: { alias: { '@': './src' } }`.

### Packages (`packages/*`) — SIEMPRE imports relativos
Los packages compartidos son consumidos por multiples apps. Cada app tiene su propio
`@/` → `./src/*`, asi que si un package usa `@/`, tsc del app consumidor lo resuelve
contra el tsconfig del APP (no del package), rompiendo la compilacion.

```typescript
// ✅ Correcto en packages/ — siempre relativo
import type { DbExecutor } from "../../types/db";
import { seedSistemas } from "./identidad/seedSistemas";

// ❌ Incorrecto en packages/ — rompe cross-package tsc
import type { DbExecutor } from "@/types/db";
```

**Razon**: estandar universal en monorepos (Turborepo, Nx, pnpm workspaces).
Los packages son librerias; los aliases `@/` son para codigo de aplicacion.

## Naming
- `camelCase` para variables, funciones, propiedades
- `PascalCase` para tipos, interfaces, clases, componentes React
- `SCREAMING_SNAKE_CASE` para constantes de modulo
- Nombres descriptivos en espanol para dominio municipal, ingles para codigo tecnico
