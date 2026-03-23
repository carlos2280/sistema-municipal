---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/biome.json"
---

# Biome — Lint y formato en el monorepo

## Config por microservicio
- Cada microservicio y package tiene su propio `biome.json` con reglas de formato independientes
- La mayoría de microservicios (`apps/microservices/*`) usan: `"quoteStyle": "double"`, `"semicolons": "always"`
- Otros packages pueden tener reglas diferentes — siempre revisar el `biome.json` local

## Validacion obligatoria
- **SIEMPRE validar con `pnpm turbo check --force`** antes de commitear archivos nuevos o modificados
- `turbo check` ejecuta `biome check` **dentro de cada package**, usando su `biome.json` local
- NO confiar en `npx biome check` desde la raiz del monorepo — usa la config de la raiz, que puede diferir de la config local de cada package

## Formateo de archivos nuevos
- Al crear archivos nuevos en un microservicio, correr biome **desde el directorio del microservicio**:
  ```bash
  cd apps/microservices/<servicio> && npx biome format --write <archivos>
  ```
- NUNCA correr `npx biome format --write` desde la raiz del monorepo para archivos dentro de un microservicio

## Reglas comunes
- `noNonNullAssertion`: usar optional chaining (`?.`) en vez de non-null assertion (`!`)
- `noDelete`: usar asignacion a `undefined` en vez de `delete` operator
- `organizeImports`: biome ordena imports automaticamente — no reordenar manualmente
