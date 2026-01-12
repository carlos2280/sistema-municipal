# Comandos Disponibles

## Desarrollo

| Comando | Descripción |
|---------|-------------|
| `pnpm dev:mf` | Levantar microfrontends (build remotes + preview + dev shell) |
| `pnpm dev:backend` | Levantar microservicios |
| `pnpm dev:all` | Levantar **todo** (MFs + Backend) |
| `pnpm dev:shell` | Levantar solo mf_shell en modo dev |
| `pnpm build:remotes` | Compilar remotes (mf_store, mf_ui, mf_contabilidad) |
| `pnpm preview:remotes` | Servir remotes compilados |

### Flujo de Module Federation

> **Importante:** Los remotes deben estar compilados para que el host pueda consumirlos.
> El archivo `remoteEntry.js` solo se genera durante el build, no en modo dev.

```bash
# Flujo correcto para desarrollo de MFs
pnpm dev:mf
# Esto ejecuta:
# 1. pnpm build:remotes    -> Compila los remotes
# 2. pnpm preview:remotes  -> Sirve remotes en puertos 5010, 5011, 5020
# 3. pnpm dev:shell        -> Shell en modo dev puerto 5000
```

## Build

| Comando | Descripción |
|---------|-------------|
| `pnpm build` | Build de producción de todo |
| `pnpm build:frontend` | Build solo microfrontends |
| `pnpm build:backend` | Build solo microservicios |

## Calidad de Código

| Comando | Descripción |
|---------|-------------|
| `pnpm lint` | Ejecutar linter (Biome) en todo |
| `pnpm format` | Formatear código en todo |
| `pnpm check` | Lint + Format en todo |

## Limpieza

| Comando | Descripción |
|---------|-------------|
| `pnpm clean` | Limpiar dist y .turbo |
| `pnpm clean:all` | Limpiar todo incluyendo node_modules |

## Docker

| Comando | Descripción |
|---------|-------------|
| `pnpm docker:up` | Levantar contenedores |
| `pnpm docker:down` | Detener contenedores |
| `pnpm docker:logs` | Ver logs de contenedores |

## Filtros de Turborepo

Ejecutar comandos en servicios específicos:

```bash
# Un solo servicio
pnpm dev --filter=mf-shell
pnpm build --filter=api-identidad

# Múltiples servicios
pnpm dev --filter=mf-shell --filter=mf-contabilidad

# Por directorio
pnpm dev --filter='./apps/microfrontends/*'
pnpm dev --filter='./apps/microservices/*'

# Dependencias de un servicio
pnpm build --filter=mf-shell...

# Servicios que dependen de shared
pnpm build --filter=...shared
```

## Commits

| Comando | Descripción |
|---------|-------------|
| `pnpm commit` | Commit interactivo con Commitizen |
| `git commit -m "tipo(scope): mensaje"` | Commit manual |

### Ejemplos de Commits

```bash
git commit -m "feat(contabilidad): agregar módulo de reportes"
git commit -m "fix(identidad): corregir validación de email"
git commit -m "refactor(shell): reorganizar rutas"
git commit -m "docs(shared): actualizar tipos exportados"
git commit -m "chore(deps): actualizar dependencias"
```

## Railway (Deployment)

```bash
# Ver estado del proyecto
railway status

# Ver logs de un servicio
railway logs

# Desplegar
railway up

# Abrir dashboard
railway open
```

## GitHub

```bash
# Estado de autenticación
gh auth status

# Crear PR
gh pr create

# Ver PRs
gh pr list

# Clonar repo
gh repo clone carlos2280/[repo-name]
```

## Base de Datos

```bash
# Conectar a PostgreSQL local
psql -h localhost -U postgres -d municipal

# Con Docker
docker exec -it municipal-postgres psql -U postgres -d municipal

# Migraciones con Drizzle (dentro de un microservicio)
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Atajos Útiles

```bash
# Instalar dependencias en un servicio específico
pnpm --filter=api-identidad add express

# Instalar devDependency
pnpm --filter=mf-shell add -D @types/node

# Actualizar dependencias
pnpm update -r

# Ver qué se va a buildear
pnpm turbo build --dry-run
```
