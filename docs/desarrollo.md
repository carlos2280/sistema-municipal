# Guía de Desarrollo

## Requisitos Previos

- Node.js >= 20.x
- pnpm >= 10.x
- Docker y Docker Compose (opcional, para desarrollo con contenedores)
- PostgreSQL 16 (o usar Docker)

## Instalación Inicial

```bash
# Clonar el repositorio
git clone <repo-url>
cd MUNICIPALIDAD

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env
```

## Desarrollo Local

### Opción 1: Todo junto (Recomendado)

```bash
# Levantar MFs + Backend
pnpm dev:all
```

### Opción 2: Por capas

```bash
# Solo frontend (microfrontends)
pnpm dev:mf

# Solo backend (microservicios)
pnpm dev:backend
```

### Opción 3: Servicios individuales

```bash
# Solo el shell (requiere que los remotes estén corriendo)
pnpm dev:shell

# Solo api-identidad
pnpm dev --filter=api-identidad

# Múltiples servicios específicos
pnpm dev --filter=gateway --filter=api-identidad
```

### Flujo de Module Federation (Vite)

> **Nota técnica:** El plugin `@originjs/vite-plugin-federation` genera `remoteEntry.js`
> solo durante el **build**, no en modo dev. Por esto los remotes deben compilarse primero.

```bash
# El comando dev:mf hace esto automáticamente:
pnpm build:remotes     # 1. Compila mf_store, mf_ui, mf_contabilidad
pnpm preview:remotes   # 2. Sirve en puertos 5010, 5011, 5020
pnpm dev:shell         # 3. Shell en modo dev puerto 5000
```

**Puertos de Microfrontends:**
| MF | Puerto | Rol |
|----|--------|-----|
| mf_shell | 5000 | Host (consume remotes) |
| mf_store | 5010 | Remote (expone store) |
| mf_ui | 5011 | Remote (expone theme/components) |
| mf_contabilidad | 5020 | Remote (expone rutas/componentes) |

### Opción 3: Con Docker

```bash
# Levantar todo con Docker
pnpm docker:up

# Ver logs
pnpm docker:logs

# Detener
pnpm docker:down
```

## Flujo de Trabajo

### 1. Crear una nueva feature

```bash
# Crear branch
git checkout -b feat/nueva-funcionalidad

# Trabajar en el código...

# Commit con convención
pnpm commit
# o manualmente:
git commit -m "feat(contabilidad): agregar reporte mensual"
```

### 2. Convención de Commits

Formato: `tipo(scope): descripción`

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formateo (sin cambio de código)
- `refactor`: Refactorización
- `perf`: Mejora de rendimiento
- `test`: Tests
- `build`: Build system
- `ci`: CI/CD
- `chore`: Mantenimiento

**Scopes:**
- `shell`, `ui`, `contabilidad`, `store` (frontend)
- `gateway`, `identidad`, `autorizacion` (backend)
- `shared`, `infra`, `deps`, `config`

### 3. Linting y Formateo

```bash
# Lint de todo
pnpm lint

# Formatear todo
pnpm format

# Check completo
pnpm check
```

## Agregar un Nuevo Microfrontend

1. Crear carpeta en `apps/microfrontends/mf_[nombre]`
2. Copiar estructura base de otro microfrontend
3. Configurar `vite.config.ts` con Module Federation
4. Agregar al `docker-compose.yml`
5. Actualizar rutas en `mf_shell`

## Agregar un Nuevo Microservicio

1. Crear carpeta en `apps/microservices/api-[nombre]`
2. Copiar estructura base de otro microservicio
3. Configurar Drizzle si necesita DB
4. Agregar al `docker-compose.yml`
5. Configurar rutas en `api-gateway`

## Variables de Entorno

### Por Servicio
Cada servicio puede tener su propio `.env`:
```
apps/microservices/api-identidad/.env
apps/microfrontends/mf_shell/.env.development
```

### Globales
Variables compartidas en la raíz:
```
MUNICIPALIDAD/.env
```

## Debugging

### Frontend
- React DevTools
- Redux DevTools (para mf_store)
- Vite DevTools

### Backend
```bash
# Con logs detallados
NODE_ENV=development pnpm dev --filter=api-identidad
```

## Testing

```bash
# Tests de todo
pnpm test

# Tests de un servicio
pnpm test --filter=api-identidad

# Coverage
pnpm test:coverage
```

## Build

```bash
# Build de todo
pnpm build

# Build solo frontend
pnpm build:frontend

# Build solo backend
pnpm build:backend

# Build específico
pnpm build --filter=mf-shell
```
