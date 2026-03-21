---
name: microfrontend-react-express
description: Patrones de arquitectura para microfrontends React con Module Federation y microservicios Express. Aplicar cuando se trabaje con mf_shell, mf_ui, mf_contabilidad, mf_chat, mf_store, api-gateway, api-identidad, api-contabilidad, api-chat o api-autorizacion.
context: fork
allowed-tools: [Read, Grep, Glob, Bash]
---

# Stack: Microfrontends + Microservicios (React + Express)

## Arquitectura

- **Frontend**: Microfrontends con Module Federation (RSBuild)
- **Backend**: Microservicios con Express 5 (Node.js)
- **Comunicacion**: REST entre servicios, API Gateway como entry point
- **Base de datos**: PostgreSQL 16 (un schema/DB por servicio)
- **Orquestacion**: Docker Compose para desarrollo local

```
[mf_shell] ── Module Federation ── [mf_ui] [mf_contabilidad] [mf_chat] [mf_store]
     │
[api-gateway:3000] ── HTTP ── [api-identidad:3001] [api-contabilidad:3002] [api-autorizacion:3003]
     │                              │                        │
     └─── cada servicio tiene su propia DB/schema ──────────┘
```

## Estructura Monorepo

```
apps/
├── microfrontends/
│   ├── mf_ui/              # SYSTEM — componentes compartidos (Atomic Design)
│   ├── mf_shell/           # PRODUCT — layout, login, routing
│   ├── mf_store/           # Redux store compartido
│   ├── mf_contabilidad/    # Modulo contabilidad
│   ├── mf_chat/            # Modulo mensajeria
│   └── mf_configuracion/   # Modulo configuracion
└── microservices/
    ├── api-gateway/        # Proxy + rate limit + CORS
    ├── api-identidad/      # Auth, usuarios, perfiles
    ├── api-contabilidad/   # Presupuestos, cuentas
    ├── api-autorizacion/   # RBAC, permisos
    ├── api-chat/           # Mensajeria, LiveKit
    └── api-platform/       # Operaciones plataforma
packages/
├── core/                   # Auth, logger, errors, database
├── db-identidad/           # Schemas Drizzle identidad
├── db-contabilidad/        # Schemas Drizzle contabilidad
├── db-mensajeria/          # Schemas Drizzle mensajeria
├── db-platform/            # Schemas Drizzle plataforma
└── seeders/                # Seeds de base de datos
```

## Convenciones Microfrontends (React)

- Cada MF es independiente: su propio `package.json`, build, y despliegue
- Module Federation (RSBuild) para compartir dependencias (React, react-dom)
- Componentes compartidos van en `mf_ui`, nunca duplicar entre MFs
- Comunicacion entre MFs: Custom Events o Redux store compartido (mf_store)
- Cada MF expone su componente raiz via Module Federation
- Lazy loading de MFs remotos con Suspense + fallback

### Atomic Design — Dos niveles

- **SYSTEM (mf_ui)**: atoms, molecules, organisms — compartidos por TODOS los MFs
- **PRODUCT (mf_shell, mf_*)**: layout, pages — consumen del SYSTEM

Reglas:
- Un atom nunca importa molecules ni organisms
- Una molecule solo importa atoms
- Un organism puede importar atoms y molecules
- Componentes de mf_ui son compartidos; los de cada MF son locales
- Antes de crear un componente, verificar si ya existe en mf_ui

## Convenciones Microservicios (Express 5)

- Cada servicio es autonomo: su propia DB, su propio esquema, su propio deploy
- Comunicacion sincrona via REST (HTTP)
- API Gateway como unico punto de entrada externo
- Estructura interna:

```
service/src/
├── index.ts          # Entry point, setup Express
├── routes/           # Definicion de rutas
├── controllers/      # Request/Response handling
├── services/         # Logica de negocio
├── middleware/        # Auth, validacion, errores
├── types/            # Tipos locales del servicio
└── config/           # Variables de entorno
```

## Naming

| Elemento | Convencion | Ejemplo |
|----------|------------|---------|
| Microfrontend | mf_snake_case | `mf_contabilidad`, `mf_chat` |
| Microservicio | api-kebab-case | `api-identidad`, `api-contabilidad` |
| Componente React | PascalCase.tsx | `UserCard.tsx` |
| Hook | use + camelCase | `useAuth.ts` |
| Ruta Express | kebab-case plural | `/api/users`, `/api/invoice-items` |
| Controller | PascalCase + Controller | `UserController` |
| Service | PascalCase + Service | `UserService` |
| Package compartido | @municipal/nombre | `@municipal/core`, `@municipal/db-identidad` |

## Tarea: $ARGUMENTS

Analiza lo solicitado considerando la arquitectura completa de microfrontends + microservicios.
