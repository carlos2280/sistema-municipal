# Arquitectura de Tipos Compartidos en TypeScript

## Problema Actual

El proyecto tiene tipos **duplicados y dispersos** en múltiples microfrontends:

```
ACTUAL (Problemático):
├── mf_store/src/types/
│   ├── login.ts          ← MenuItem, Login, Areas...
│   └── menu.ts           ← MenuItem (DUPLICADO)
│
├── mf_contabilidad/src/types/
│   ├── contabilidad.d.ts ← Declarations para MF
│   └── zod/              ← Schemas de validación
│
└── packages/shared/      ← Solo schemas de DB (Drizzle)
```

**Consecuencias:**
- Tipos inconsistentes entre módulos
- Cambios requieren actualizar múltiples lugares
- Desarrolladores nuevos no saben dónde definir tipos
- Sin Single Source of Truth

---

## Arquitectura Propuesta

```
PROPUESTO (Óptimo):
packages/
├── @municipal/types/              ← 🆕 Tipos TypeScript compartidos
│   ├── src/
│   │   ├── auth/
│   │   │   ├── user.types.ts
│   │   │   ├── login.types.ts
│   │   │   └── index.ts
│   │   ├── menu/
│   │   │   ├── menu.types.ts
│   │   │   └── index.ts
│   │   ├── contabilidad/
│   │   │   ├── cuentas.types.ts
│   │   │   ├── presupuesto.types.ts
│   │   │   └── index.ts
│   │   ├── tesoreria/
│   │   │   └── index.ts
│   │   ├── common/
│   │   │   ├── api.types.ts
│   │   │   ├── pagination.types.ts
│   │   │   └── index.ts
│   │   └── index.ts              ← Exports controlados
│   ├── package.json
│   └── tsconfig.json
│
├── @municipal/contracts/          ← 🆕 Schemas Zod (validación E2E)
│   ├── src/
│   │   ├── auth.contract.ts
│   │   ├── contabilidad.contract.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
└── @municipal/shared/             ← Existente (schemas DB)
    └── src/database/
```

---

## Implementación: `@municipal/types`

### Estructura de Directorios

```typescript
// packages/types/src/index.ts

// ═══════════════════════════════════════════════════════════════════
// EXPORTS PÚBLICOS - Solo lo que TODOS los MFs necesitan
// ═══════════════════════════════════════════════════════════════════

// Tipos comunes (API responses, pagination, etc.)
export * from "./common";

// Tipos de usuario (básicos, compartidos)
export type { Usuario, UsuarioBasico } from "./auth/user.types";

// ═══════════════════════════════════════════════════════════════════
// EXPORTS POR DOMINIO - Importación explícita requerida
// ═══════════════════════════════════════════════════════════════════

// Uso: import { LoginCredentials } from "@municipal/types/auth"
export * as AuthTypes from "./auth";

// Uso: import { MenuItem } from "@municipal/types/menu"
export * as MenuTypes from "./menu";

// Uso: import { CuentaContable } from "@municipal/types/contabilidad"
export * as ContabilidadTypes from "./contabilidad";

// Uso: import { Recibo } from "@municipal/types/tesoreria"
export * as TesoreriaTypes from "./tesoreria";
```

### Tipos Comunes

```typescript
// packages/types/src/common/api.types.ts

/**
 * Response estándar para endpoints de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Response de error estándar
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

/**
 * Response paginada
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Parámetros de paginación para requests
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

```typescript
// packages/types/src/common/index.ts
export * from "./api.types";
export * from "./pagination.types";
```

### Tipos de Autenticación

```typescript
// packages/types/src/auth/user.types.ts

/**
 * Usuario básico (datos públicos)
 */
export interface UsuarioBasico {
  id: number;
  email: string;
  nombreCompleto: string;
}

/**
 * Usuario completo (datos internos)
 */
export interface Usuario extends UsuarioBasico {
  areaId: number;
  perfilId: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Usuario con información extendida
 */
export interface UsuarioConArea extends Usuario {
  area: {
    id: number;
    nombre: string;
  };
  perfil: {
    id: number;
    nombre: string;
  };
}
```

```typescript
// packages/types/src/auth/login.types.ts
import type { UsuarioBasico } from "./user.types";
import type { MenuItem } from "../menu/menu.types";

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  correo: string;
  contrasena: string;
  areaId?: number;
  sistemaId?: number;
}

/**
 * Credenciales para obtener áreas disponibles
 */
export interface LoginAreasCredentials {
  correo: string;
  contrasena: string;
}

/**
 * Área disponible para login
 */
export interface AreaDisponible {
  id: number;
  nombre: string;
}

/**
 * Response de login exitoso
 */
export interface LoginResponse {
  usuario: UsuarioBasico;
  menu: MenuItem[];
  token: string;
}

/**
 * Datos para cambio de contraseña temporal
 */
export interface CambioContrasenaTemporal {
  correo: string;
  contrasenaTemporal: string;
  contrasenaNueva: string;
}
```

```typescript
// packages/types/src/auth/index.ts
export * from "./user.types";
export * from "./login.types";
```

### Tipos de Menú

```typescript
// packages/types/src/menu/menu.types.ts
import type { IconName } from "lucide-react/dynamic";

/**
 * Item de menú (estructura jerárquica)
 */
export interface MenuItem {
  id: number;
  idSistema: number;
  idPadre: number | null;
  nombre: string;
  nivel: number;
  orden: number;
  componente: string;
  icono: IconName;
  hijos: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Menú de un sistema completo
 */
export interface MenuSistema {
  nombreSistema: string;
  menuRaiz: MenuItem[];
}

/**
 * Item de menú plano (sin hijos, para listas)
 */
export interface MenuItemFlat {
  id: number;
  nombre: string;
  componente: string;
  icono: IconName;
  ruta: string;
}
```

```typescript
// packages/types/src/menu/index.ts
export * from "./menu.types";
```

### Tipos de Contabilidad

```typescript
// packages/types/src/contabilidad/cuentas.types.ts

/**
 * Tipo de cuenta contable
 */
export type TipoCuenta = "activo" | "pasivo" | "patrimonio" | "ingreso" | "gasto";

/**
 * Cuenta del plan de cuentas
 */
export interface CuentaContable {
  id: number;
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  nivel: number;
  idPadre: number | null;
  activa: boolean;
  aceptaMovimientos: boolean;
}

/**
 * Cuenta con saldo
 */
export interface CuentaConSaldo extends CuentaContable {
  saldoActual: number;
  saldoAnterior: number;
}

/**
 * Movimiento contable
 */
export interface MovimientoContable {
  id: number;
  fecha: string;
  cuentaId: number;
  debe: number;
  haber: number;
  concepto: string;
  referencia: string;
  usuarioId: number;
}
```

```typescript
// packages/types/src/contabilidad/presupuesto.types.ts

/**
 * Partida presupuestaria
 */
export interface PartidaPresupuestaria {
  id: number;
  codigo: string;
  nombre: string;
  montoAsignado: number;
  montoEjecutado: number;
  montoDisponible: number;
  ejercicio: number;
}

/**
 * Estado de ejecución presupuestaria
 */
export interface EjecucionPresupuestaria {
  ejercicio: number;
  totalAsignado: number;
  totalEjecutado: number;
  porcentajeEjecucion: number;
  partidas: PartidaPresupuestaria[];
}
```

```typescript
// packages/types/src/contabilidad/index.ts
export * from "./cuentas.types";
export * from "./presupuesto.types";
```

### Package.json del paquete de tipos

```json
// packages/types/package.json
{
  "name": "@municipal/types",
  "version": "1.0.0",
  "description": "Tipos TypeScript compartidos para el Sistema Municipal",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./auth": {
      "types": "./dist/auth/index.d.ts",
      "import": "./dist/auth/index.mjs",
      "require": "./dist/auth/index.js"
    },
    "./menu": {
      "types": "./dist/menu/index.d.ts",
      "import": "./dist/menu/index.mjs",
      "require": "./dist/menu/index.js"
    },
    "./contabilidad": {
      "types": "./dist/contabilidad/index.d.ts",
      "import": "./dist/contabilidad/index.mjs",
      "require": "./dist/contabilidad/index.js"
    },
    "./tesoreria": {
      "types": "./dist/tesoreria/index.d.ts",
      "import": "./dist/tesoreria/index.mjs",
      "require": "./dist/tesoreria/index.js"
    },
    "./common": {
      "types": "./dist/common/index.d.ts",
      "import": "./dist/common/index.mjs",
      "require": "./dist/common/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts src/*/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts src/*/index.ts --format cjs,esm --dts --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  },
  "peerDependencies": {
    "lucide-react": ">=0.300.0"
  }
}
```

### tsconfig.json

```json
// packages/types/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Uso en Microfrontends

### Instalación

```bash
# En el root del monorepo
pnpm add @municipal/types --filter mf_store
pnpm add @municipal/types --filter mf_contabilidad
pnpm add @municipal/types --filter mf_shell
```

### Importación en mf_store

```typescript
// mf_store/src/store/api/authApi.ts

// ✅ CORRECTO - Importar tipos del paquete centralizado
import type {
  LoginCredentials,
  LoginResponse,
  LoginAreasCredentials,
  AreaDisponible,
} from "@municipal/types/auth";

import type { ApiResponse } from "@municipal/types/common";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponse>, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    getAreas: builder.mutation<ApiResponse<AreaDisponible[]>, LoginAreasCredentials>({
      query: (credentials) => ({
        url: "/auth/areas",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});
```

### Importación en mf_contabilidad

```typescript
// mf_contabilidad/src/pages/PlanCuentas.tsx

// ✅ CORRECTO - Solo importar tipos de su dominio
import type { CuentaContable, CuentaConSaldo } from "@municipal/types/contabilidad";
import type { PaginatedResponse } from "@municipal/types/common";

// Hooks del store (desde mf_store)
import { useGetCuentasQuery } from "mf_store/api/contabilidad";

export function PlanCuentas() {
  const { data, isLoading } = useGetCuentasQuery();

  // data es tipado como PaginatedResponse<CuentaContable>
  return (
    <div>
      {data?.data.map((cuenta: CuentaContable) => (
        <CuentaItem key={cuenta.id} cuenta={cuenta} />
      ))}
    </div>
  );
}
```

---

## Control de Acceso por Dominio

### Configuración de TypeScript para Aislamiento

Para restringir qué tipos puede acceder cada MF, usa `paths` en `tsconfig.json`:

```json
// mf_tesoreria/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      // ✅ Acceso permitido
      "@municipal/types": ["../../packages/types/src"],
      "@municipal/types/common": ["../../packages/types/src/common"],
      "@municipal/types/tesoreria": ["../../packages/types/src/tesoreria"],
      "@municipal/types/auth": ["../../packages/types/src/auth"],

      // ❌ NO declarar paths para dominios ajenos
      // "@municipal/types/contabilidad" - NO INCLUIR
    }
  }
}
```

Si un desarrollador intenta importar tipos de contabilidad en tesorería:

```typescript
// mf_tesoreria/src/algo.ts

// ❌ Error de TypeScript: Cannot find module '@municipal/types/contabilidad'
import type { CuentaContable } from "@municipal/types/contabilidad";
```

---

## Flujo de Trabajo para Nuevos Tipos

### Escenario: Nuevo desarrollador de mf_tesoreria necesita tipos

```
1. Desarrollador identifica necesidad de nuevo tipo
   │
   ▼
2. ¿El tipo es específico de Tesorería?
   │
   ├── SÍ → Agregar en packages/types/src/tesoreria/
   │
   └── NO → ¿Es un tipo común/compartido?
            │
            ├── SÍ → Agregar en packages/types/src/common/
            │
            └── NO → Discutir con arquitecto
   │
   ▼
3. Crear PR con el nuevo tipo
   │
   ▼
4. Review asegura que:
   - No duplica tipos existentes
   - Está en el módulo correcto
   - Tiene documentación JSDoc
   │
   ▼
5. Merge y disponible para todos
```

### Template para Nuevos Tipos

```typescript
// packages/types/src/[dominio]/[nombre].types.ts

/**
 * [Descripción breve del tipo]
 *
 * @example
 * ```typescript
 * const ejemplo: MiTipo = {
 *   campo: "valor"
 * };
 * ```
 *
 * @see [Link a documentación relacionada si existe]
 */
export interface MiTipo {
  /** Descripción del campo */
  campo: string;

  /** Descripción del campo opcional */
  campoOpcional?: number;
}
```

---

## Migración desde Estado Actual

### Paso 1: Crear el paquete

```bash
mkdir -p packages/types/src/{auth,menu,contabilidad,tesoreria,common}
```

### Paso 2: Mover tipos existentes

```bash
# Desde mf_store
cp apps/microfrontends/mf_store/src/types/login.ts \
   packages/types/src/auth/login.types.ts

cp apps/microfrontends/mf_store/src/types/menu.ts \
   packages/types/src/menu/menu.types.ts
```

### Paso 3: Actualizar imports en mf_store

```typescript
// ANTES (mf_store/src/store/api/authApi.ts)
import type { Login, UsuarioConMenuResponse } from "../../types/login";

// DESPUÉS
import type { LoginCredentials, LoginResponse } from "@municipal/types/auth";
```

### Paso 4: Eliminar tipos duplicados

```bash
# Después de migrar y verificar que todo funciona
rm -rf apps/microfrontends/mf_store/src/types/
rm -rf apps/microfrontends/mf_contabilidad/src/types/
```

---

## Beneficios de Esta Arquitectura

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Duplicación** | Tipos en múltiples MFs | Single Source of Truth |
| **Consistencia** | Posibles inconsistencias | Garantizada |
| **Onboarding** | Confuso, buscar en varios lugares | Un solo lugar |
| **Refactoring** | Cambiar en múltiples archivos | Un archivo, todos actualizados |
| **Control de Acceso** | Sin control | Por paths en tsconfig |
| **Documentación** | Dispersa | Centralizada con JSDoc |

---

*Siguiente: [06-CONTRATOS-API-ZOD.md](./06-CONTRATOS-API-ZOD.md)*
