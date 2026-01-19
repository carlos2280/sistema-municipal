# Guía de Microservicios - Sistema Municipal

> Documentación técnica para el desarrollo y mantenimiento de la arquitectura de microservicios.

---

## Arquitectura General

```
                                    ┌─────────────────┐
                                    │   Navegador     │
                                    │   (Frontend)    │
                                    └────────┬────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY                                       │
│                         Puerto: 3000                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    CORS     │  │   Helmet    │  │ Rate Limit  │  │   Proxy     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└───────────┬───────────────────────┬───────────────────────┬────────────────┘
            │                       │                       │
            ▼                       ▼                       ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│  api-autorizacion │   │   api-identidad   │   │  api-contabilidad │
│   Puerto: 3003    │   │   Puerto: 3001    │   │   Puerto: 3002    │
│                   │   │                   │   │                   │
│  • Login/Logout   │   │  • CRUD Usuarios  │   │  • Plan Cuentas   │
│  • JWT Tokens     │   │  • Áreas          │   │  • Presupuesto    │
│  • Menús          │   │  • Perfiles       │   │  • Movimientos    │
│  • Permisos       │   │  • Sistemas       │   │                   │
└─────────┬─────────┘   └─────────┬─────────┘   └─────────┬─────────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                                  ▼
                        ┌───────────────────┐
                        │    PostgreSQL     │
                        │   (Railway DB)    │
                        └───────────────────┘
```

---

## API Gateway

### Responsabilidades

| Responsabilidad | Estado | Implementación |
|-----------------|--------|----------------|
| Proxy reverso | ✅ | http-proxy-middleware |
| CORS | ✅ | cors middleware |
| Rate limiting | ✅ | express-rate-limit |
| Headers seguridad | ✅ | helmet |
| Logging | ✅ | pino |
| Autenticación | ❌ | Por implementar |
| Circuit breaker | ❌ | Por implementar |
| Caché | ❌ | Por implementar |

### Configuración de Rutas

```typescript
// src/proxy/index.ts
const services: Record<string, ServiceConfig> = {
  autorizacion: {
    baseUrl: env.AUTH_URL,           // http://api-autorizacion:3003
    path: "/api/v1/autorizacion",    // Ruta en gateway
    pathRewrite: "/api/v1/autorizacion",  // Ruta en servicio
    timeout: 5000,
  },
  identity: {
    baseUrl: env.IDENTITY_URL,
    path: "/api/v1/identidad",
    pathRewrite: "/api/v1/identidad",
    timeout: 10000,
  },
  contabilidad: {
    baseUrl: env.CONTABILIDAD_URL,
    path: "/api/v1/contabilidad",
    pathRewrite: "/api/v1",          // Diferente pathRewrite
    timeout: 10000,
  },
};
```

### Variables de Entorno

```env
PORT=3000
NODE_ENV=production
AUTH_URL=http://api-autorizacion.railway.internal:3003
IDENTITY_URL=http://api-identidad.railway.internal:3001
CONTABILIDAD_URL=http://api-contabilidad.railway.internal:3002
```

### Endpoints del Gateway

| Método | Ruta Gateway | Servicio Destino |
|--------|--------------|------------------|
| POST | /api/v1/autorizacion/login | api-autorizacion |
| POST | /api/v1/autorizacion/areas | api-autorizacion |
| POST | /api/v1/autorizacion/sistemas | api-autorizacion |
| GET | /api/v1/autorizacion/menu-sistema | api-autorizacion |
| GET | /api/v1/identidad/usuarios | api-identidad |
| POST | /api/v1/identidad/usuarios | api-identidad |
| GET | /api/v1/contabilidad/plan-cuentas | api-contabilidad |

---

## Estructura de Microservicios

### Estructura de Carpetas Estándar

```
api-{nombre}/
├── src/
│   ├── app.ts              # Configuración Express
│   ├── index.ts            # Entry point
│   ├── config/
│   │   ├── env.ts          # Carga de variables
│   │   └── schemaPG.ts     # Schema PostgreSQL
│   ├── controllers/        # Handlers HTTP
│   │   └── {recurso}.controller.ts
│   ├── services/           # Lógica de negocio
│   │   └── {recurso}.service.ts
│   ├── routes/
│   │   ├── index.ts        # Router principal
│   │   └── v1/             # Rutas versionadas
│   │       ├── index.ts
│   │       └── {recurso}.route.ts
│   ├── db/
│   │   ├── client.ts       # Conexión Drizzle
│   │   └── schemas/        # Schemas de tablas
│   ├── libs/
│   │   ├── middleware/     # Middlewares
│   │   │   ├── AppError.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── verficarToken.ts
│   │   └── utils/          # Utilidades
│   │       └── jwt.utils.ts
│   ├── types/              # Tipos TypeScript
│   │   └── express/
│   │       └── index.d.ts
│   └── env/
│       └── schema.ts       # Validación Zod
├── biome.json
├── package.json
├── railway.json
└── tsconfig.json
```

---

## api-autorizacion

### Responsabilidades

- Autenticación de usuarios (login/logout)
- Gestión de tokens JWT (access + refresh)
- Obtención de menús según sistema/perfil
- Validación de permisos
- Cambio de contraseña temporal

### Endpoints

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| POST | /api/v1/autorizacion/areas | Pública* | Obtener áreas del usuario |
| POST | /api/v1/autorizacion/sistemas | Pública* | Obtener sistemas por área |
| POST | /api/v1/autorizacion/login | Pública | Iniciar sesión |
| POST | /api/v1/autorizacion/refresh-token | Cookie | Refrescar access token |
| POST | /api/v1/autorizacion/logout | JWT | Cerrar sesión |
| GET | /api/v1/autorizacion/menu-sistema | JWT | Obtener menú del sistema |
| GET | /api/v1/autorizacion/me | JWT | Datos del usuario actual |
| POST | /api/v1/autorizacion/cambiar-contrasena-temporal | Token Temporal | Cambiar contraseña |

*Requiere email/password en body

### Flujo de Autenticación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │     │   Gateway   │     │ Autorizacion│     │     DB      │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ POST /areas       │                   │                   │
       │ {email, password} │                   │                   │
       │──────────────────>│                   │                   │
       │                   │──────────────────>│                   │
       │                   │                   │ Buscar usuario    │
       │                   │                   │──────────────────>│
       │                   │                   │<──────────────────│
       │                   │                   │ Verificar password│
       │                   │                   │ Obtener áreas     │
       │                   │<──────────────────│                   │
       │<──────────────────│                   │                   │
       │ {usuario, areas}  │                   │                   │
       │                   │                   │                   │
       │ POST /sistemas    │                   │                   │
       │ {email, password, │                   │                   │
       │  areaId}          │                   │                   │
       │──────────────────>│──────────────────>│                   │
       │                   │                   │──────────────────>│
       │<──────────────────│<──────────────────│<──────────────────│
       │ {sistemas}        │                   │                   │
       │                   │                   │                   │
       │ POST /login       │                   │                   │
       │ {email, password, │                   │                   │
       │  areaId, sistemaId}                   │                   │
       │──────────────────>│──────────────────>│                   │
       │                   │                   │ Generar tokens    │
       │                   │<──────────────────│                   │
       │<──────────────────│                   │                   │
       │ {accessToken}     │                   │                   │
       │ Set-Cookie:       │                   │                   │
       │ refreshToken      │                   │                   │
       │                   │                   │                   │
```

### Modelo de Tokens

```typescript
// Access Token (5min)
interface AccessTokenPayload {
  userId: number;
  email: string;
  nombreCompleto: string;
  areaId: number;
  sistemaId: number;
  tipo: "access";
  exp: number;
}

// Refresh Token (1h)
interface RefreshTokenPayload {
  userId: number;
  email: string;
  nombreCompleto: string;
  areaId: number;
  sistemaId: number;
  tipo: "refresh";
  exp: number;
}
```

---

## api-identidad

### Responsabilidades

- CRUD de usuarios
- Gestión de áreas organizacionales
- Gestión de perfiles y permisos
- Gestión de sistemas
- Envío de emails (bienvenida, reset password)

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/identidad/usuarios | Listar usuarios |
| POST | /api/v1/identidad/usuarios | Crear usuario |
| GET | /api/v1/identidad/usuarios/:id | Obtener usuario |
| PUT | /api/v1/identidad/usuarios/:id | Actualizar usuario |
| DELETE | /api/v1/identidad/usuarios/:id | Eliminar usuario |
| GET | /api/v1/identidad/areas | Listar áreas |
| GET | /api/v1/identidad/perfiles | Listar perfiles |
| GET | /api/v1/identidad/sistemas | Listar sistemas |
| GET | /api/v1/identidad/menus | Listar menús |

### Integración con Swagger

```typescript
// src/app.ts
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const specs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
```

Acceso: `http://localhost:3001/api-docs`

---

## api-contabilidad

### Responsabilidades

- Gestión del Plan de Cuentas
- Cuentas y subgrupos
- Presupuesto
- Movimientos contables

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/plan-cuentas | Listar plan de cuentas |
| POST | /api/v1/plan-cuentas | Crear cuenta |
| PUT | /api/v1/plan-cuentas/:id | Actualizar cuenta |
| DELETE | /api/v1/plan-cuentas/:id | Eliminar cuenta |
| GET | /api/v1/cuentas-subgrupos | Listar subgrupos |
| POST | /api/v1/cuentas-subgrupos | Crear subgrupo |

---

## Base de Datos

### Conexión con Drizzle ORM

```typescript
// src/db/client.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schemas";

export function createDbClient(config: EnvConfig) {
  const connectionString = `postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;

  const pool = new Pool({
    connectionString,
    ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
    max: config.DB_POOL_MAX,
  });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  return drizzle(pool, { schema, logger: true });
}
```

### Schemas Principales

```
┌───────────────────────────────────────────────────────────────────┐
│                        SCHEMA: IDENTIDAD                          │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │
│  │   usuarios   │    │    areas     │    │   perfiles   │        │
│  ├──────────────┤    ├──────────────┤    ├──────────────┤        │
│  │ id           │    │ id           │    │ id           │        │
│  │ email        │    │ nombre       │    │ nombre       │        │
│  │ password     │    │ descripcion  │    │ descripcion  │        │
│  │ nombreCompleto│   │ direccionId  │    │ activo       │        │
│  │ activo       │    └──────────────┘    └──────────────┘        │
│  │ passwordTemp │                                                 │
│  └──────────────┘                                                 │
│         │                    │                    │               │
│         └────────────────────┼────────────────────┘               │
│                              ▼                                    │
│                  ┌─────────────────────┐                         │
│                  │ perfilAreaUsuario   │                         │
│                  ├─────────────────────┤                         │
│                  │ usuarioId           │                         │
│                  │ areaId              │                         │
│                  │ perfilId            │                         │
│                  └─────────────────────┘                         │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │
│  │   sistemas   │    │ sistemaPerfil│    │    menus     │        │
│  ├──────────────┤    ├──────────────┤    ├──────────────┤        │
│  │ id           │◄───│ sistemaId    │    │ id           │        │
│  │ nombre       │    │ perfilId     │───►│ nombre       │        │
│  │ descripcion  │    └──────────────┘    │ ruta         │        │
│  │ icono        │                        │ icono        │        │
│  └──────────────┘                        │ idPadre      │        │
│         │                                │ idSistema    │───┘    │
│         └────────────────────────────────┴───────────────        │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                      SCHEMA: CONTABILIDAD                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │
│  │ planesCuentas│    │cuentasSubgrupo│   │titulosCuentas│        │
│  ├──────────────┤    ├──────────────┤    ├──────────────┤        │
│  │ id           │    │ id           │    │ id           │        │
│  │ codigo       │    │ codigo       │    │ nombre       │        │
│  │ nombre       │    │ nombre       │    │ descripcion  │        │
│  │ tipo         │    │ planCuentaId │    └──────────────┘        │
│  │ naturaleza   │    └──────────────┘                            │
│  │ nivel        │                                                 │
│  └──────────────┘                                                 │
└───────────────────────────────────────────────────────────────────┘
```

---

## Patrones de Código

### Controller Pattern

```typescript
// controllers/usuarios.controller.ts
import { AppError } from "@/libs/middleware/AppError";
import * as usuarioService from "@services/usuarios.service";
import type { RequestHandler } from "express";

export const getUsuarioById: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.usuarioId);

  // Validación de entrada
  if (Number.isNaN(id)) {
    return next(new AppError("ID inválido", 400));
  }

  try {
    const data = await usuarioService.getUsuarioById(id);

    if (!data) {
      return next(new AppError("Usuario no encontrado", 404));
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
```

### Service Pattern

```typescript
// services/usuarios.service.ts
import { db } from "@/app";
import { usuarios } from "@/db/schemas";
import { eq } from "drizzle-orm";

export const getUsuarioById = async (id: number) => {
  try {
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, id));

    return usuario;
  } catch (error) {
    throw new Error(
      `Error al obtener el usuario: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
```

### Error Handling

```typescript
// libs/middleware/AppError.ts
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// libs/middleware/error.middleware.ts
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Error no operacional (bug)
  console.error("ERROR:", err);
  return res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
  });
};
```

---

## Variables de Entorno

### Validación con Zod

```typescript
// env/schema.ts
import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]),

  // Database
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SSL: z.string().transform((v) => v === "true").default("false"),
  DB_POOL_MAX: z.string().transform(Number).default("10"),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("5m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("1h"),
});

export type EnvConfig = z.infer<typeof envSchema>;
```

### Archivo .env Ejemplo

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=municipal
DB_SSL=false
DB_POOL_MAX=10

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-chars
JWT_EXPIRES_IN=5m
JWT_REFRESH_EXPIRES_IN=1h

# Email (solo api-identidad)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
```

---

## Desarrollo Local

### Iniciar todos los servicios

```bash
# Desde la raíz
pnpm dev:backend
```

### Iniciar servicio individual

```bash
cd apps/microservices/api-identidad
pnpm dev
```

### Health Check

```bash
curl http://localhost:3000/health          # Gateway
curl http://localhost:3001/api/health      # Identidad
curl http://localhost:3002/api/health      # Contabilidad
curl http://localhost:3003/api/health      # Autorizacion
```

---

## Deployment (Railway)

### Configuración railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100
  }
}
```

### Variables en Railway

```env
# Todas las APIs
NODE_ENV=production
PORT=3000  # Railway asigna automáticamente

# Database (referencia al servicio postgres)
DATABASE_URL=${{postgres.DATABASE_URL}}

# O variables individuales
DB_HOST=${{postgres.PGHOST}}
DB_PORT=${{postgres.PGPORT}}
DB_USER=${{postgres.PGUSER}}
DB_PASSWORD=${{postgres.PGPASSWORD}}
DB_NAME=${{postgres.PGDATABASE}}
DB_SSL=true

# Gateway específicas
AUTH_URL=http://api-autorizacion.railway.internal:3000
IDENTITY_URL=http://api-identidad.railway.internal:3000
CONTABILIDAD_URL=http://api-contabilidad.railway.internal:3000
```

---

## Checklist para Nuevo Microservicio

- [ ] Crear estructura de carpetas
- [ ] Configurar package.json con scripts estándar
- [ ] Configurar tsconfig.json con paths
- [ ] Crear schema de validación de env (Zod)
- [ ] Implementar conexión DB con Drizzle
- [ ] Crear middleware de errores
- [ ] Implementar health check endpoint
- [ ] Agregar rutas versionadas (/api/v1/)
- [ ] Configurar CORS si es necesario
- [ ] Agregar railway.json
- [ ] Agregar al turbo.json del monorepo
- [ ] Configurar proxy en api-gateway
- [ ] Documentar endpoints

---

## Referencias

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Railway Deployment](https://docs.railway.app/deploy/deployments)
