# [INFRA-002] Correcciones de Arquitectura del Monorepo — Auditoria 2026-03-22

## Metadata
- **Modulos**: monorepo raiz, todos los tsconfig, rsbuild configs, Dockerfiles
- **Prioridad**: alta
- **Estado**: completado
- **Fecha**: 2026-03-22
- **Origen**: Auditoria automatizada — reporte 04-arquitectura-audit.md

## Objetivo
Corregir las inconsistencias de configuracion del monorepo que causan builds fragiles, version mismatches en runtime, y configuraciones TypeScript contradictorias. Establecer una base solida para escalar sin riesgo.

## Alcance

### Incluye
- A1: Estandarizar `@module-federation/rsbuild-plugin` a version unica en todos los MFs
- A2: Crear `tsconfig.base.json` raiz y hacer que todos los proyectos extiendan de el
- A3: Corregir paths invalidos en tsconfig.app.json (packages/package_store)
- A4: Estandarizar versiones de `@mui/x-tree-view` entre MFs
- A5: Estandarizar version de `socket.io-client` entre MFs
- A6: Corregir `@types/bcrypt` → usar tipos de `bcryptjs`
- A7: Eliminar `shamefully-hoist=true` de Dockerfiles + declarar dependencias fantasma
- A8: Fijar version de `livekit-server` en docker-compose (no usar `latest`)
- A9: Evaluar y documentar `api-platform → db-mesa-ayuda` dependencia
- A10: Integrar admin-panel al pipeline de CI/CD o documentar su estado

### NO incluye
- Migracion de admin-panel de Vite a rsbuild (evaluacion separada)
- Cambios en la logica de negocio
- Cambios en la arquitectura de bases de datos

## Especificacion

### A1 — Estandarizar Module Federation plugin
**Estado actual**:
- mf_shell, mf_chat: `^0.13.0`
- mf_ui, mf_store, mf_contabilidad, mf_configuracion, mf_mesa_ayuda: `^0.8.0`

**Accion**: Actualizar los 5 MFs a `^0.13.0` (la version del host). Verificar que:
1. Los manifests sean compatibles
2. Los shared singletons resuelvan correctamente
3. Las exposes/remotes funcionen sin cambios

Tambien estandarizar `@rsbuild/core` a `^1.3.0` en todos los MFs.

### A2 — tsconfig.base.json compartido
Crear en raiz del monorepo:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

Cada proyecto extiende:
- Microservicios: `"extends": "../../../tsconfig.base.json"` + overrides necesarios
- MFs: `"extends": "../../../tsconfig.base.json"` + `"jsx": "react-jsx"`, `"noEmit": true`
- Packages: `"extends": "../../tsconfig.base.json"` + overrides de compilacion

Excepcion documentada: `api-chat` puede mantener `NodeNext` si hay razones tecnicas (documentar).

### A3 — Corregir paths invalidos
**Archivos**: `mf_shell/tsconfig.app.json`, `mf_contabilidad/tsconfig.app.json`
- Eliminar path `"@municipalidad/store": ["../../packages/package_store/src"]` — no existe
- Eliminar `"src/pages/prueba/.tsx"` del include — glob invalido

### A4 — Estandarizar @mui/x-tree-view
- mf_shell: `^8.5.1`
- mf_contabilidad: `^7.29.1`

Decidir version target (v8 si los breaking changes son manejables) y actualizar ambos. Verificar que Module Federation shared resuelva la version correcta.

### A5 — Estandarizar socket.io-client
Fijar ambos MFs (mf_shell y mf_chat) en la misma version exacta. Agregar al `pnpm-workspace.yaml` un `overrides` si es necesario para forzar version unica.

### A6 — Corregir tipos de bcryptjs
**Archivos**: `api-identidad/package.json`, `api-contabilidad/package.json`
- Eliminar `@types/bcrypt` de devDependencies
- `bcryptjs` incluye sus propios tipos — no necesita paquete adicional

### A7 — Eliminar shamefully-hoist de Dockerfiles
1. Identificar que dependencias requieren hoisting (ejecutar build sin el flag)
2. Declarar las dependencias faltantes explicitamente en los package.json correspondientes
3. Eliminar `RUN echo "shamefully-hoist=true" > .npmrc` de los 7 Dockerfiles
4. Si alguna dependencia es irremediablemente incompatible con strict mode, usar `.npmrc` comprometido en el repo con comentario explicativo

### A8 — Fijar version de LiveKit
**Archivo**: `docker-compose.yml`
Cambiar `livekit/livekit-server:latest` por una version fija (ej: `livekit/livekit-server:v1.7.2`). Documentar la version elegida.

### A9 — Documentar dependencia api-platform → db-mesa-ayuda
Investigar por que `api-platform` necesita `db-mesa-ayuda`. Si es para el admin de tickets (que vive en api-platform):
- Documentar con comentario en package.json
- Evaluar si esa funcionalidad deberia moverse a api-mesa-ayuda

### A10 — Integrar admin-panel
Decidir:
- **Opcion A**: Integrar al CI/CD como un servicio mas (Dockerfile + Railway)
- **Opcion B**: Documentar que es un MVP experimental y excluirlo explicitamente del monorepo scope
Si opcion A: crear Dockerfile, agregar a cd-production.yml, agregar scope a commitlint.

## Criterios de Aceptacion
- [x] A1: `grep -r "rsbuild-plugin" apps/microfrontends/*/package.json` muestra misma version en todos (^0.13.0)
- [x] A2: `tsconfig.base.json` existe en raiz. Todos los tsconfig.json contienen `"extends"`
- [x] A3: `grep -r "package_store" .` retorna 0 resultados
- [x] A4: `@mui/x-tree-view` tiene misma major version en todos los MFs (^8.5.1)
- [x] A5: `socket.io-client` tiene misma version en mf_shell y mf_chat (^4.8.3)
- [x] A6: `@types/bcrypt` no aparece en ningun package.json
- [x] A7: `grep -r "shamefully-hoist" apps/` retorna 0 resultados (usa COPY .npmrc en Dockerfiles)
- [x] A8: `docker-compose.yml` no contiene `:latest` para livekit (fijado a v1.9.12)
- [x] A9: Comentario en api-platform/package.json explica la dependencia de db-mesa-ayuda
- [x] A10: admin-panel tiene README.md explicando su estado como MVP experimental

## Restricciones
- A1 requiere testing completo de Module Federation en dev local antes de mergear
- A2 no debe romper ningun `tsc --noEmit` existente
- A7 puede requerir multiples iteraciones (identificar deps fantasma es tedioso)
- Los cambios de version (A1, A4, A5) deben testearse juntos ya que afectan el shared scope de MF

## Notas
- Orden sugerido: A3 → A6 → A8 → A2 → A5 → A4 → A1 → A9 → A10 → A7
- A3, A6, A8 son fixes triviales (minutos)
- A1 es el mas riesgoso (breaking changes entre ^0.8 y ^0.13) — hacer en rama aislada
- A7 es el mas tedioso — dejar para el final
