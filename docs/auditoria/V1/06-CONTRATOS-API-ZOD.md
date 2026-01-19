# Contratos de API con Zod - Validación End-to-End

## Concepto

Los **contratos de API** son schemas Zod que definen la estructura de datos esperada en las comunicaciones entre frontend y backend. Funcionan como **Single Source of Truth** para:

1. **Validación en Backend** - Validar requests entrantes
2. **Type Safety en Frontend** - Inferir tipos TypeScript
3. **Documentación Viva** - El código ES la documentación

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE DATOS                               │
│                                                                     │
│   Frontend                 Contract                    Backend      │
│   ────────                 ────────                    ───────      │
│                                                                     │
│   ┌─────────┐    type     ┌──────────────┐    validate ┌─────────┐│
│   │ Form    │ ──────────▶ │ LoginSchema  │ ──────────▶ │ API     ││
│   │ (React) │  inference  │ (Zod)        │   .parse()  │ (Hono)  ││
│   └─────────┘             └──────────────┘             └─────────┘│
│                                                                     │
│   Mismo schema usado en ambos lados = Type Safety E2E              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Estructura del Paquete `@municipal/contracts`

```
packages/contracts/
├── src/
│   ├── auth/
│   │   ├── login.contract.ts
│   │   ├── register.contract.ts
│   │   └── index.ts
│   ├── contabilidad/
│   │   ├── cuentas.contract.ts
│   │   ├── movimientos.contract.ts
│   │   └── index.ts
│   ├── tesoreria/
│   │   └── index.ts
│   ├── common/
│   │   ├── pagination.contract.ts
│   │   ├── api-response.contract.ts
│   │   └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## Implementación de Contratos

### Contratos Comunes

```typescript
// packages/contracts/src/common/api-response.contract.ts
import { z } from "zod";

/**
 * Schema base para responses exitosos
 */
export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime(),
  });

/**
 * Schema para responses de error
 */
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.array(z.string())).optional(),
  }),
  timestamp: z.string().datetime(),
});

/**
 * Schema para responses paginados
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      totalItems: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

// Tipos inferidos
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
};

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
```

```typescript
// packages/contracts/src/common/pagination.contract.ts
import { z } from "zod";

/**
 * Schema para parámetros de paginación en requests
 */
export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
```

### Contratos de Autenticación

```typescript
// packages/contracts/src/auth/login.contract.ts
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════
// REQUEST SCHEMAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Schema para credenciales de login
 */
export const LoginCredentialsSchema = z.object({
  correo: z
    .string()
    .email("El correo no es válido")
    .min(1, "El correo es requerido"),
  contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña es demasiado larga"),
  areaId: z.number().int().positive().optional(),
  sistemaId: z.number().int().positive().optional(),
});

/**
 * Schema para obtener áreas disponibles
 */
export const LoginAreasCredentialsSchema = z.object({
  correo: z.string().email(),
  contrasena: z.string().min(1),
});

/**
 * Schema para cambio de contraseña temporal
 */
export const CambioContrasenaTemporalSchema = z.object({
  correo: z.string().email(),
  contrasenaTemporal: z.string().min(1),
  contrasenaNueva: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Debe contener mayúscula, minúscula y número"
    ),
});

// ═══════════════════════════════════════════════════════════════════
// RESPONSE SCHEMAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Schema para item de menú
 */
export const MenuItemSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    id: z.number(),
    idSistema: z.number(),
    idPadre: z.number().nullable(),
    nombre: z.string(),
    nivel: z.number(),
    orden: z.number(),
    componente: z.string(),
    icono: z.string(),
    hijos: z.array(MenuItemSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
);

interface MenuItem {
  id: number;
  idSistema: number;
  idPadre: number | null;
  nombre: string;
  nivel: number;
  orden: number;
  componente: string;
  icono: string;
  hijos: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Schema para usuario básico en response
 */
export const UsuarioBasicoSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  nombreCompleto: z.string(),
});

/**
 * Schema para response de login exitoso
 */
export const LoginResponseSchema = z.object({
  usuario: UsuarioBasicoSchema,
  menu: z.array(MenuItemSchema),
  token: z.string(),
});

/**
 * Schema para área disponible
 */
export const AreaDisponibleSchema = z.object({
  id: z.number(),
  nombre: z.string(),
});

// ═══════════════════════════════════════════════════════════════════
// TIPOS INFERIDOS
// ═══════════════════════════════════════════════════════════════════

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type LoginAreasCredentials = z.infer<typeof LoginAreasCredentialsSchema>;
export type CambioContrasenaTemporal = z.infer<typeof CambioContrasenaTemporalSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type AreaDisponible = z.infer<typeof AreaDisponibleSchema>;
export type UsuarioBasico = z.infer<typeof UsuarioBasicoSchema>;
export type { MenuItem };
```

### Contratos de Contabilidad

```typescript
// packages/contracts/src/contabilidad/cuentas.contract.ts
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════
// ENUMS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════

export const TipoCuentaEnum = z.enum([
  "activo",
  "pasivo",
  "patrimonio",
  "ingreso",
  "gasto",
]);

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS BASE
// ═══════════════════════════════════════════════════════════════════

/**
 * Schema para cuenta contable
 */
export const CuentaContableSchema = z.object({
  id: z.number().int().positive(),
  codigo: z
    .string()
    .regex(/^\d{1,}(\.\d{1,})*$/, "Formato de código inválido"),
  nombre: z.string().min(1).max(200),
  tipo: TipoCuentaEnum,
  nivel: z.number().int().min(1).max(10),
  idPadre: z.number().int().positive().nullable(),
  activa: z.boolean(),
  aceptaMovimientos: z.boolean(),
});

/**
 * Schema para crear cuenta
 */
export const CrearCuentaSchema = CuentaContableSchema.omit({
  id: true,
}).extend({
  idPadre: z.number().int().positive().optional(),
});

/**
 * Schema para actualizar cuenta
 */
export const ActualizarCuentaSchema = CrearCuentaSchema.partial();

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS DE REQUEST
// ═══════════════════════════════════════════════════════════════════

/**
 * Schema para filtros de búsqueda de cuentas
 */
export const FiltrosCuentasSchema = z.object({
  tipo: TipoCuentaEnum.optional(),
  nivel: z.coerce.number().int().min(1).max(10).optional(),
  activa: z.coerce.boolean().optional(),
  busqueda: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════════════
// TIPOS INFERIDOS
// ═══════════════════════════════════════════════════════════════════

export type TipoCuenta = z.infer<typeof TipoCuentaEnum>;
export type CuentaContable = z.infer<typeof CuentaContableSchema>;
export type CrearCuenta = z.infer<typeof CrearCuentaSchema>;
export type ActualizarCuenta = z.infer<typeof ActualizarCuentaSchema>;
export type FiltrosCuentas = z.infer<typeof FiltrosCuentasSchema>;
```

```typescript
// packages/contracts/src/contabilidad/movimientos.contract.ts
import { z } from "zod";

/**
 * Schema para movimiento contable
 */
export const MovimientoContableSchema = z.object({
  id: z.number().int().positive(),
  fecha: z.string().datetime(),
  cuentaId: z.number().int().positive(),
  debe: z.number().nonnegative(),
  haber: z.number().nonnegative(),
  concepto: z.string().min(1).max(500),
  referencia: z.string().max(100).optional(),
  usuarioId: z.number().int().positive(),
});

/**
 * Schema para crear movimiento
 */
export const CrearMovimientoSchema = MovimientoContableSchema.omit({
  id: true,
  usuarioId: true,
}).refine(
  (data) => data.debe > 0 || data.haber > 0,
  "Debe o Haber debe ser mayor a 0"
).refine(
  (data) => !(data.debe > 0 && data.haber > 0),
  "No puede tener Debe y Haber simultáneamente"
);

/**
 * Schema para asiento contable (múltiples movimientos)
 */
export const AsientoContableSchema = z.object({
  fecha: z.string().datetime(),
  concepto: z.string().min(1),
  referencia: z.string().optional(),
  movimientos: z.array(
    z.object({
      cuentaId: z.number().int().positive(),
      debe: z.number().nonnegative(),
      haber: z.number().nonnegative(),
    })
  ).min(2, "Un asiento debe tener al menos 2 movimientos"),
}).refine(
  (data) => {
    const totalDebe = data.movimientos.reduce((sum, m) => sum + m.debe, 0);
    const totalHaber = data.movimientos.reduce((sum, m) => sum + m.haber, 0);
    return Math.abs(totalDebe - totalHaber) < 0.01;
  },
  "El asiento no está balanceado (Debe ≠ Haber)"
);

// Tipos inferidos
export type MovimientoContable = z.infer<typeof MovimientoContableSchema>;
export type CrearMovimiento = z.infer<typeof CrearMovimientoSchema>;
export type AsientoContable = z.infer<typeof AsientoContableSchema>;
```

---

## Uso en Backend (Microservicios)

### Validación en Controllers

```typescript
// api-autorizacion/src/controllers/auth.controller.ts
import { Hono } from "hono";
import {
  LoginCredentialsSchema,
  LoginAreasCredentialsSchema,
  type LoginCredentials,
} from "@municipal/contracts/auth";

const app = new Hono();

app.post("/login", async (c) => {
  // Validar request con Zod
  const result = LoginCredentialsSchema.safeParse(await c.req.json());

  if (!result.success) {
    return c.json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Datos de login inválidos",
        details: result.error.flatten().fieldErrors,
      },
      timestamp: new Date().toISOString(),
    }, 400);
  }

  // result.data está tipado como LoginCredentials
  const credentials: LoginCredentials = result.data;

  // ... lógica de autenticación
});

app.post("/areas", async (c) => {
  const result = LoginAreasCredentialsSchema.safeParse(await c.req.json());

  if (!result.success) {
    return c.json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Credenciales inválidas",
        details: result.error.flatten().fieldErrors,
      },
      timestamp: new Date().toISOString(),
    }, 400);
  }

  // ... lógica para obtener áreas
});
```

### Middleware de Validación Genérico

```typescript
// api-gateway/src/middleware/validate.ts
import type { Context, Next } from "hono";
import type { ZodSchema } from "zod";

/**
 * Middleware para validar body con Zod
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    const result = schema.safeParse(await c.req.json());

    if (!result.success) {
      return c.json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Datos inválidos en el request",
          details: result.error.flatten().fieldErrors,
        },
        timestamp: new Date().toISOString(),
      }, 400);
    }

    // Almacenar datos validados en context
    c.set("validatedBody", result.data);
    await next();
  };
}

/**
 * Middleware para validar query params
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    const result = schema.safeParse(c.req.query());

    if (!result.success) {
      return c.json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Parámetros de consulta inválidos",
          details: result.error.flatten().fieldErrors,
        },
        timestamp: new Date().toISOString(),
      }, 400);
    }

    c.set("validatedQuery", result.data);
    await next();
  };
}
```

### Uso del Middleware

```typescript
// api-contabilidad/src/routes/cuentas.routes.ts
import { Hono } from "hono";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  CrearCuentaSchema,
  FiltrosCuentasSchema,
  PaginationParamsSchema,
} from "@municipal/contracts/contabilidad";

const cuentas = new Hono();

// GET /cuentas?page=1&pageSize=20&tipo=activo
cuentas.get(
  "/",
  validateQuery(FiltrosCuentasSchema.merge(PaginationParamsSchema)),
  async (c) => {
    const filters = c.get("validatedQuery");
    // filters está tipado correctamente
    // ...
  }
);

// POST /cuentas
cuentas.post(
  "/",
  validateBody(CrearCuentaSchema),
  async (c) => {
    const nuevaCuenta = c.get("validatedBody");
    // nuevaCuenta está tipado como CrearCuenta
    // ...
  }
);

export default cuentas;
```

---

## Uso en Frontend (Microfrontends)

### En RTK Query

```typescript
// mf_store/src/store/api/authApi.ts
import { baseApi } from "./baseApi";
import type {
  LoginCredentials,
  LoginResponse,
  AreaDisponible,
} from "@municipal/contracts/auth";
import type { ApiSuccessResponse } from "@municipal/contracts/common";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiSuccessResponse<LoginResponse>,
      LoginCredentials
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    getAreas: builder.mutation<
      ApiSuccessResponse<AreaDisponible[]>,
      { correo: string; contrasena: string }
    >({
      query: (credentials) => ({
        url: "/auth/areas",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation, useGetAreasMutation } = authApi;
```

### Validación en Formularios

```typescript
// mf_shell/src/pages/Login.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoginCredentialsSchema,
  type LoginCredentials,
} from "@municipal/contracts/auth";
import { useLoginMutation } from "mf_store/api/auth";

export function LoginPage() {
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(LoginCredentialsSchema),
    defaultValues: {
      correo: "",
      contrasena: "",
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      const result = await login(data).unwrap();
      // result.data tiene tipo LoginResponse
      console.log("Usuario:", result.data.usuario);
    } catch (err) {
      // Manejo de error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("correo")}
        type="email"
        placeholder="Correo"
      />
      {errors.correo && <span>{errors.correo.message}</span>}

      <input
        {...register("contrasena")}
        type="password"
        placeholder="Contraseña"
      />
      {errors.contrasena && <span>{errors.contrasena.message}</span>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Iniciando..." : "Iniciar Sesión"}
      </button>
    </form>
  );
}
```

---

## Package.json del Paquete de Contratos

```json
// packages/contracts/package.json
{
  "name": "@municipal/contracts",
  "version": "1.0.0",
  "description": "Contratos de API con Zod para el Sistema Municipal",
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
    "./contabilidad": {
      "types": "./dist/contabilidad/index.d.ts",
      "import": "./dist/contabilidad/index.mjs",
      "require": "./dist/contabilidad/index.js"
    },
    "./common": {
      "types": "./dist/common/index.d.ts",
      "import": "./dist/common/index.mjs",
      "require": "./dist/common/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts src/*/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts src/*/index.ts --format cjs,esm --dts --watch"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  }
}
```

---

## Beneficios de Esta Arquitectura

| Aspecto | Sin Contratos | Con Contratos |
|---------|---------------|---------------|
| **Validación** | Manual en cada lugar | Automática con schema |
| **Tipos** | Definidos 2 veces (FE+BE) | Inferidos del schema |
| **Errores** | Descubiertos en runtime | Detectados en compile time |
| **Documentación** | Separada del código | El schema ES documentación |
| **Cambios de API** | Rompen silenciosamente | TypeScript alerta |
| **Consistencia** | Requiere disciplina | Garantizada por diseño |

---

## Referencias

- [Zod Documentation](https://zod.dev/)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [tRPC (inspiración para type-safe APIs)](https://trpc.io/)

---

*Siguiente: [07-NUEVO-MICROFRONTEND-GUIDE.md](./07-NUEVO-MICROFRONTEND-GUIDE.md)*
