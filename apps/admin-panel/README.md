# admin-panel — Estado actual

## Estado: MVP experimental (no integrado al CI/CD)

Este panel es una SPA construida con **Vite + React** para administracion interna de la plataforma SaaS.
NO forma parte del pipeline CI/CD del monorepo ni tiene Dockerfile.

## Diferencias con el resto del monorepo

| Aspecto | Monorepo | admin-panel |
|---|---|---|
| Bundler | rsbuild | Vite |
| State | Redux (mf_store) | TanStack React Query |
| Tables | MUI DataGrid | material-react-table |
| Charts | (ninguno) | recharts |
| Module Federation | Si | No |
| Dockerfile | Si | No |
| CI/CD | Si | No |

## Razon de exclusion

El admin-panel fue creado como prototipo rapido para gestion de tenants/modulos.
No se integra al pipeline porque:
1. Usa Vite en lugar de rsbuild (requeriria migracion para consistencia)
2. No participa en Module Federation (es independiente)
3. Sus dependencias unicas (recharts, material-react-table, tanstack-query) no son compartidas

## Como ejecutar localmente

```bash
pnpm --filter admin-panel dev    # Vite dev server
pnpm --filter admin-panel build  # Build de produccion
pnpm --filter admin-panel start  # Serve con Express
```

## Decision pendiente

Evaluar si:
- **Integrar**: migrar a rsbuild, crear Dockerfile, agregar a cd-production.yml
- **Separar**: mover a repositorio independiente
- **Mantener**: dejarlo como herramienta interna sin deploy automatizado
