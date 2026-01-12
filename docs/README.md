# Sistema Municipal - Documentación

## Indice

1. [Arquitectura](./arquitectura.md)
2. [Guia de Desarrollo](./desarrollo.md)
3. [Estructura del Monorepo](./estructura.md)
4. [Comandos Disponibles](./comandos.md)
5. [Deployment](./deployment.md)
6. [MCP Servers](./mcp-servers.md)
7. [**Guia Completa de Microfrontends**](./microfrontends-guide.md) - Module Federation, desarrollo aislado, resiliencia y fallbacks

## Descripción General

Sistema Municipal es una plataforma construida con arquitectura de **Microfrontends** y **Microservicios**, diseñada para escalar y mantener de forma independiente cada módulo del sistema.

### Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite, Module Federation |
| Backend | Express 5, TypeScript, Drizzle ORM |
| Base de Datos | PostgreSQL 16 |
| Build System | Turborepo, pnpm workspaces |
| Linting | Biome |
| CI/CD | Railway |

### Puertos de Desarrollo

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| mf_shell (Host) | 5000 | Shell principal - consume los remotes |
| mf_store | 5010 | Estado global compartido (Redux) |
| mf_ui | 5011 | Componentes UI y tema compartido |
| mf_contabilidad | 5020 | Módulo de contabilidad |
| api-gateway | 3000 | API Gateway - punto de entrada |
| api-identidad | 3001 | Autenticación y usuarios |
| api-autorizacion | 3002 | Permisos y roles |
| api-contabilidad | 3003 | Operaciones contables |
| PostgreSQL | 5432 | Base de datos |

### Comandos Principales

```bash
# Desarrollo
pnpm dev:mf      # Microfrontends (build + preview remotes + dev shell)
pnpm dev:backend # Microservicios
pnpm dev:all     # Todo junto (MFs + Backend)

# Build
pnpm build       # Build de producción
```
