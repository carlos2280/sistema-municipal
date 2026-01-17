# Plan de Infraestructura: Sistema Municipal

## Resumen Ejecutivo

Reestructuración de la infraestructura del proyecto para soportar:
- Crecimiento de microservicios y microfrontends
- Control de acceso granular por desarrollador
- Dockerización híbrida (desarrollo vs producción)
- Integración con MCP Hub

---

## Fase 1: Reestructuración de Carpetas

### 1.1 Crear estructura `/infra`

```
infra/
├── compose/
│   ├── docker-compose.yml          # Base: solo infraestructura
│   ├── docker-compose.dev.yml      # Override: desarrollo
│   ├── docker-compose.prod.yml     # Override: producción
│   └── docker-compose.test.yml     # Override: CI/CD
├── nginx/
│   ├── nginx.dev.conf              # Proxy reverso desarrollo
│   └── nginx.prod.conf             # Proxy reverso producción
├── scripts/
│   ├── dev.sh                      # Iniciar entorno desarrollo
│   ├── build.sh                    # Build de imágenes
│   ├── deploy.sh                   # Deploy a ambientes
│   └── sparse-clone.sh             # Clone parcial para devs externos
└── k8s/
    └── .gitkeep                    # Preparado para Kubernetes
```

### 1.2 Agregar Dockerfiles por servicio

```
apps/
├── microfrontends/
│   ├── mf_shell/
│   │   ├── Dockerfile              # NUEVO
│   │   └── .dockerignore           # NUEVO
│   ├── mf_store/
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── mf_ui/
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   └── mf_contabilidad/
│       ├── Dockerfile
│       └── .dockerignore
└── microservices/
    ├── api-gateway/
    │   ├── Dockerfile
    │   └── .dockerignore
    ├── api-identidad/
    │   ├── Dockerfile
    │   └── .dockerignore
    ├── api-autorizacion/
    │   ├── Dockerfile
    │   └── .dockerignore
    └── api-contabilidad/
        ├── Dockerfile
        └── .dockerignore
```

### 1.3 Crear estructura de documentación

```
docs/
├── CONTRIBUTING.md                 # Guía de contribución
├── ONBOARDING.md                   # Guía para nuevos desarrolladores
├── ARCHITECTURE.md                 # Arquitectura del sistema
└── modules/
    ├── contabilidad.md             # Doc específica del módulo
    └── template-modulo.md          # Template para nuevos módulos
```

### 1.4 Crear configuración de acceso

```
.github/
├── CODEOWNERS                      # Control de acceso por carpeta
└── workflows/
    ├── ci.yml                      # Pipeline CI
    ├── cd-staging.yml              # Deploy a staging
    └── cd-production.yml           # Deploy a producción
```

---

## Fase 2: Docker Compose por Ambiente

### 2.1 Base: `docker-compose.yml` (Solo infraestructura)

Contiene únicamente servicios de infraestructura que se comparten:

| Servicio | Puerto | Propósito |
|----------|--------|-----------|
| postgres | 5432 | Base de datos principal |
| redis | 6379 | Cache y sesiones |
| mailhog | 8025 | Testing de emails |

### 2.2 Desarrollo: `docker-compose.dev.yml`

- NO dockeriza los servicios de aplicación
- Aplicaciones corren con `pnpm dev` (hot reload nativo)
- Solo levanta infraestructura

```bash
# Uso en desarrollo
docker compose -f infra/compose/docker-compose.yml \
               -f infra/compose/docker-compose.dev.yml up -d
pnpm dev  # Turbo inicia todos los servicios
```

### 2.3 Producción: `docker-compose.prod.yml`

- Dockeriza TODO (aplicaciones + infraestructura)
- Imágenes optimizadas multi-stage
- Nginx como proxy reverso
- Variables de entorno de producción

```bash
# Uso en producción/staging
docker compose -f infra/compose/docker-compose.yml \
               -f infra/compose/docker-compose.prod.yml up -d
```

### 2.4 Testing: `docker-compose.test.yml`

- Para CI/CD pipelines
- Base de datos efímera
- Sin volúmenes persistentes

---

## Fase 3: Dockerfiles Multi-stage

### 3.1 Patrón para Microservicios (API)

```dockerfile
# Dockerfile para api-*
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 3: Runner (producción)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
USER node
CMD ["node", "dist/index.js"]
```

**Resultado:**
- Imagen base: ~1.2GB → Imagen final: ~150MB
- Sin devDependencies en producción
- Usuario no-root por seguridad

### 3.2 Patrón para Microfrontends

```dockerfile
# Dockerfile para mf_*
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_API_URL
ARG VITE_MF_STORE_URL
ARG VITE_MF_UI_URL
RUN pnpm build

# Stage 3: Nginx para servir estáticos
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Resultado:**
- Assets estáticos servidos por Nginx
- Imagen final: ~25MB
- Cache de browser optimizado

---

## Fase 4: Scripts de Automatización

### 4.1 Makefile (comandos unificados)

```makefile
# Desarrollo
dev:           Levanta infra + pnpm dev
dev-infra:     Solo infra (postgres, redis)
dev-stop:      Detiene todo

# Build
build:         Build de todas las imágenes
build-api:     Solo imágenes de APIs
build-mf:      Solo imágenes de microfrontends

# Producción
prod:          Stack completo dockerizado
prod-stop:     Detiene producción

# Utilidades
logs:          Ver logs de todos los servicios
logs-api:      Logs solo de APIs
clean:         Limpia contenedores y volúmenes
status:        Estado de servicios

# Deploy
deploy-staging:    Deploy a staging
deploy-production: Deploy a producción
```

### 4.2 Script `sparse-clone.sh`

Para desarrolladores externos con acceso limitado:

```bash
#!/bin/bash
# Uso: ./sparse-clone.sh <modulo>
# Ejemplo: ./sparse-clone.sh contabilidad

MODULE=$1
git clone --filter=blob:none --sparse <repo-url>
cd sistema-municipal
git sparse-checkout set \
  apps/microfrontends/mf_$MODULE \
  apps/microservices/api-$MODULE \
  packages/shared \
  infra/compose \
  docs/modules/$MODULE.md
```

---

## Fase 5: Control de Acceso (CODEOWNERS)

### 5.1 Archivo `.github/CODEOWNERS`

```codeowners
# Default: Core team aprueba todo
* @tu-usuario

# Infraestructura: Solo DevOps/Core
/infra/ @tu-usuario
/.github/ @tu-usuario

# Shared: Requiere aprobación de Core
/packages/shared/ @tu-usuario

# Shell y Gateway: Core team
/apps/microfrontends/mf_shell/ @tu-usuario
/apps/microservices/api-gateway/ @tu-usuario

# Módulo Contabilidad: Dev asignado + Core
/apps/microfrontends/mf_contabilidad/ @dev-contabilidad @tu-usuario
/apps/microservices/api-contabilidad/ @dev-contabilidad @tu-usuario

# Módulo RRHH (futuro): Dev asignado + Core
# /apps/microfrontends/mf_rrhh/ @dev-rrhh @tu-usuario
# /apps/microservices/api-rrhh/ @dev-rrhh @tu-usuario
```

### 5.2 Branch Protection Rules

Configurar en GitHub/GitLab:
- `main`: Requiere PR + aprobación de CODEOWNERS
- `develop`: Requiere PR
- `feature/*`: Libre

---

## Fase 6: Integración con MCP Hub

### 6.1 Actualizar perfil `.env.sistema-municipal`

```env
# Workspace apunta al proyecto
WORKSPACE_ROOT=/home/carca/sistema-municipal

# PostgreSQL del proyecto
DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/municipal

# URLs de los servicios (para playwright/lighthouse)
APP_SHELL_URL=http://host.docker.internal:5000
APP_GATEWAY_URL=http://host.docker.internal:3000
```

### 6.2 Red Docker compartida (opcional)

Si necesitas que MCP acceda a contenedores directamente:

```yaml
# En infra/compose/docker-compose.yml
networks:
  municipal-network:
    name: municipal-network
    driver: bridge
```

```yaml
# En mcp-hub/docker-compose.yml
networks:
  municipal-network:
    external: true
    name: municipal-network
```

---

## Fase 7: Variables de Entorno

### 7.1 Estructura de archivos `.env`

```
sistema-municipal/
├── .env.example          # Template para todos
├── .env                  # Local (git ignored)
├── .env.development      # Valores de desarrollo
├── .env.staging          # Valores de staging
└── .env.production       # Valores de producción (secretos en CI/CD)
```

### 7.2 Variables por ambiente

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| NODE_ENV | development | staging | production |
| DATABASE_URL | localhost:5432 | db.staging:5432 | db.prod:5432 |
| REDIS_URL | localhost:6379 | redis.staging:6379 | redis.prod:6379 |
| JWT_SECRET | dev-secret | staging-secret | (desde secrets) |
| VITE_API_URL | localhost:3000 | api.staging.com | api.prod.com |

---

## Fase 8: CI/CD Pipelines

### 8.1 Pipeline de CI (en cada PR)

```yaml
jobs:
  lint:      Biome check
  test:      Tests unitarios
  build:     Build de todos los servicios
  e2e:       Tests e2e con Playwright (opcional)
```

### 8.2 Pipeline de CD

```yaml
# Staging: Auto-deploy en merge a develop
# Production: Manual trigger o tag release
jobs:
  build-images:   Build y push a registry
  deploy:         Deploy a ambiente
  healthcheck:    Verificar servicios
  notify:         Notificar en Slack/Discord
```

---

## Resumen de Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `infra/compose/docker-compose.yml` | Base: PostgreSQL, Redis, Mailhog |
| `infra/compose/docker-compose.dev.yml` | Override desarrollo |
| `infra/compose/docker-compose.prod.yml` | Override producción + apps |
| `infra/compose/docker-compose.test.yml` | Override para CI |
| `infra/nginx/nginx.dev.conf` | Proxy reverso desarrollo |
| `infra/nginx/nginx.prod.conf` | Proxy reverso producción |
| `infra/scripts/dev.sh` | Script inicio desarrollo |
| `infra/scripts/build.sh` | Script build imágenes |
| `infra/scripts/deploy.sh` | Script deploy |
| `infra/scripts/sparse-clone.sh` | Clone parcial para devs |
| `apps/*/Dockerfile` | 8 Dockerfiles (4 MF + 4 API) |
| `apps/*/.dockerignore` | 8 archivos dockerignore |
| `.github/CODEOWNERS` | Control de acceso |
| `.github/workflows/ci.yml` | Pipeline CI |
| `docs/CONTRIBUTING.md` | Guía contribución |
| `docs/ONBOARDING.md` | Guía nuevos devs |
| `docs/ARCHITECTURE.md` | Arquitectura |
| `Makefile` | Comandos unificados |
| `.env.example` | Actualizado |
| `.env.development` | Variables desarrollo |

**Total: ~30 archivos nuevos/modificados**

---

## Orden de Implementación

```
Fase 1: Estructura de carpetas     ████░░░░░░  (30 min)
Fase 2: Docker Compose             ████████░░  (1 hora)
Fase 3: Dockerfiles                ██████████  (1.5 horas)
Fase 4: Scripts/Makefile           ████░░░░░░  (30 min)
Fase 5: CODEOWNERS                 ██░░░░░░░░  (15 min)
Fase 6: MCP Hub                    ██░░░░░░░░  (15 min)
Fase 7: Variables de entorno       ████░░░░░░  (30 min)
Fase 8: CI/CD                      ████████░░  (1 hora)
```

---

## Resultado Final

### Antes (actual)
```bash
# Desarrollo
docker compose up -d          # Levanta TODO (lento)
# No hay separación de ambientes
# No hay control de acceso
# Dockerfiles en docker-compose.yml (builds inline)
```

### Después (propuesto)
```bash
# Desarrollo
make dev                      # Infra + pnpm dev (rápido)

# Producción local
make prod                     # Stack completo

# Nuevo desarrollador
./infra/scripts/sparse-clone.sh contabilidad
make dev                      # Solo ve su módulo

# Deploy
make deploy-staging
make deploy-production
```

---

## Pregunta de Validación

Antes de implementar, confirmar:

1. ¿El repositorio está en GitHub o GitLab?
2. ¿Tienes un registry de Docker (DockerHub, GitHub CR, AWS ECR)?
3. ¿Dónde planeas hacer deploy? (VPS, AWS, Railway, etc.)
4. ¿Necesitas Redis ahora o lo agregamos preparado pero comentado?
5. ¿Mailhog para testing de emails o no es necesario?

---

**Estado:** Pendiente aprobación

**Siguiente paso:** Una vez aprobado, comenzar con Fase 1
