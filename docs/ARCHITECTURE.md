# Arquitectura - Sistema Municipal

## Visión General

Sistema Municipal es una aplicación empresarial construida con arquitectura de **Microservicios** en el backend y **Microfrontends** en el frontend, orquestada como un **Monorepo** con Turbo y pnpm.

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    mf_shell (Host)                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────────────┐        │   │
│  │  │mf_store │  │ mf_ui   │  │ mf_contabilidad  │  ...   │   │
│  │  │(Redux)  │  │(Comps)  │  │   (Negocio)      │        │   │
│  │  └─────────┘  └─────────┘  └──────────────────┘        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • Routing          • Rate Limiting    • CORS           │   │
│  │  • Auth Middleware  • Logging          • Compression    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  api-identidad  │ │api-autorizacion │ │ api-contabilidad│
│  • Login        │ │  • Permisos     │ │  • Cuentas      │
│  • Usuarios     │ │  • Roles        │ │  • Asientos     │
│  • JWT          │ │  • Validación   │ │  • Reportes     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PostgreSQL                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  identidad  │  │autorizacion │  │ contabilidad│   ...       │
│  │   schema    │  │   schema    │  │   schema    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Frontend

| Tecnología | Propósito |
|------------|-----------|
| React 19 | UI Framework |
| Vite | Build tool |
| Module Federation | Microfrontends |
| MUI 7 | Componentes UI |
| Redux Toolkit | State Management |
| React Router 7 | Routing |
| React Hook Form + Zod | Forms + Validación |

### Backend

| Tecnología | Propósito |
|------------|-----------|
| Node.js 22 | Runtime |
| Express 5 | HTTP Framework |
| Drizzle ORM | Database ORM |
| Zod | Validación |
| JWT | Autenticación |
| Pino | Logging |

### Infraestructura

| Tecnología | Propósito |
|------------|-----------|
| PostgreSQL 16 | Base de datos |
| Redis 7 | Cache / Sessions |
| Nginx | Proxy reverso |
| Docker | Containerización |
| GitHub Actions | CI/CD |
| Railway | Hosting (Producción) |

### Herramientas de Desarrollo

| Tecnología | Propósito |
|------------|-----------|
| pnpm | Package manager |
| Turbo | Monorepo orchestration |
| Biome | Linting + Formatting |
| Husky | Git hooks |
| Commitizen | Conventional commits |

---

## Microfrontends

### Arquitectura Module Federation

```
┌─────────────────────────────────────────────────────────────┐
│                      mf_shell (Host)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  import { store } from 'mf_store/store'               │  │
│  │  import { Button } from 'mf_ui/Button'                │  │
│  │  import { ContabilidadModule } from 'mf_contabilidad' │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│   mf_store   │    │    mf_ui     │    │ mf_contabilidad  │
│  (Remote)    │    │   (Remote)   │    │    (Remote)      │
│              │    │              │    │                  │
│ exposes:     │    │ exposes:     │    │ exposes:         │
│ ./store      │    │ ./Button     │    │ ./App            │
│              │    │ ./Input      │    │ ./routes         │
│              │    │ ./Table      │    │                  │
└──────────────┘    └──────────────┘    └──────────────────┘
```

### Comunicación entre Microfrontends

1. **Estado Global (Redux)**
   - `mf_store` expone el store configurado
   - Todos los MF usan el mismo store
   - Slices por dominio

2. **Componentes Compartidos**
   - `mf_ui` expone componentes base
   - Temas y estilos centralizados
   - Design tokens compartidos

3. **Routing**
   - `mf_shell` maneja routing principal
   - Cada MF define sus rutas internas
   - Lazy loading de módulos

---

## Microservicios

### API Gateway

```
Request → Rate Limit → Auth → Proxy → Service → Response
```

Responsabilidades:
- **Routing**: Dirige requests al servicio correcto
- **Rate Limiting**: Protección contra abuse
- **CORS**: Políticas de cross-origin
- **Compression**: gzip para responses
- **Logging**: Request/response logging
- **Metrics**: Prometheus metrics (futuro)

### api-identidad

```
POST /auth/login     → Autenticación
POST /auth/register  → Registro
POST /auth/refresh   → Refresh token
GET  /users          → Listar usuarios
GET  /users/:id      → Obtener usuario
PUT  /users/:id      → Actualizar usuario
```

Responsabilidades:
- Gestión de usuarios
- Autenticación JWT
- Gestión de perfiles
- Recuperación de contraseña

### api-autorizacion

```
GET  /permissions        → Listar permisos
POST /permissions/check  → Verificar permiso
GET  /roles              → Listar roles
POST /roles              → Crear rol
```

Responsabilidades:
- RBAC (Role-Based Access Control)
- Validación de permisos
- Gestión de roles
- Políticas de acceso

### api-contabilidad

```
GET  /cuentas            → Plan de cuentas
POST /asientos           → Crear asiento
GET  /libros/diario      → Libro diario
GET  /libros/mayor       → Libro mayor
GET  /reportes/balance   → Balance general
```

Responsabilidades:
- Plan de cuentas
- Asientos contables
- Libros contables
- Reportes financieros

---

## Base de Datos

### Schemas (Drizzle ORM)

```typescript
// packages/shared/src/database/identidad/schemas/usuarios.schema.ts
export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// packages/shared/src/database/contabilidad/schemas/cuentas.schema.ts
export const cuentas = pgTable('cuentas', {
  id: uuid('id').primaryKey().defaultRandom(),
  codigo: varchar('codigo', { length: 20 }).notNull().unique(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  nivel: integer('nivel').notNull(),
  padre_id: uuid('padre_id').references(() => cuentas.id),
});
```

### Migraciones

```bash
# Generar migración
pnpm --filter @municipal/shared db:generate

# Ejecutar migraciones
pnpm --filter @municipal/shared db:migrate

# Ver estado
pnpm --filter @municipal/shared db:status
```

---

## Flujo de Autenticación

```
┌────────┐     ┌─────────┐     ┌─────────────┐     ┌──────────┐
│ Client │────►│ Gateway │────►│ api-identidad│────►│PostgreSQL│
└────────┘     └─────────┘     └─────────────┘     └──────────┘
    │              │                  │
    │  1. Login    │                  │
    │─────────────►│  2. Forward      │
    │              │─────────────────►│
    │              │                  │  3. Validate
    │              │                  │─────────────►│
    │              │                  │◄─────────────│
    │              │  4. JWT Token    │
    │              │◄─────────────────│
    │  5. Token    │
    │◄─────────────│
    │              │
    │  6. API Call │
    │  (with JWT)  │
    │─────────────►│  7. Validate JWT
    │              │─────────────────►│
    │              │                  │  8. Check permissions
    │              │                  │─────────────►│
    │              │  9. Response     │              │
    │◄─────────────│◄─────────────────│◄─────────────│
```

---

## Despliegue

### Desarrollo Local

```bash
make dev  # Infraestructura Docker + pnpm dev
```

### Producción (Railway)

Cada servicio se despliega independientemente:

```
Railway Project
├── PostgreSQL (Add-on)
├── Redis (Add-on)
├── api-gateway (Service)
├── api-identidad (Service)
├── api-autorizacion (Service)
├── api-contabilidad (Service)
├── mf-shell (Service)
├── mf-store (Service)
├── mf-ui (Service)
└── mf-contabilidad (Service)
```

---

## Escalabilidad

### Horizontal

- Cada microservicio puede escalar independientemente
- Stateless design (sesiones en Redis)
- Load balancer por servicio

### Vertical

- Resource limits definidos en Docker Compose
- Monitoring con Prometheus/Grafana (futuro)

### Agregar Nuevos Módulos

1. Crear carpetas en `apps/microfrontends/mf_nuevo` y `apps/microservices/api-nuevo`
2. Agregar schemas en `packages/shared/src/database/nuevo`
3. Actualizar CODEOWNERS con permisos
4. Configurar en Railway como nuevo servicio

---

## Seguridad

### Implementado

- JWT con refresh tokens
- CORS restrictivo
- Rate limiting
- Input validation (Zod)
- SQL injection prevention (Drizzle ORM)
- Password hashing (bcrypt)
- HTTPS (en producción)

### Por Implementar

- [ ] CSP headers
- [ ] CSRF tokens
- [ ] Audit logging
- [ ] Secrets rotation
- [ ] WAF (Web Application Firewall)

---

## Monitoreo (Futuro)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Prometheus  │────►│   Grafana    │────►│   Alertas    │
│  (Metrics)   │     │ (Dashboard)  │     │   (Slack)    │
└──────────────┘     └──────────────┘     └──────────────┘
        ▲
        │
┌───────┴───────┐
│  Servicios    │
│  /metrics     │
└───────────────┘
```
