# Matriz de Dependencias - Sistema Municipal

> Control de versiones y compatibilidad de dependencias en el monorepo.

---

## Versiones Objetivo (Estandarizadas)

Estas son las versiones que **DEBEN** usarse en todo el proyecto para evitar conflictos:

### Core Runtime

| Paquete | Versión | Tipo | Notas |
|---------|---------|------|-------|
| node | >=20.0.0 | Engine | LTS requerido |
| pnpm | >=10.0.0 | Package Manager | Workspace support |
| typescript | ~5.8.3 | Dev | Strict mode |

### Frontend - React Ecosystem

| Paquete | Versión | Singleton | Notas |
|---------|---------|:---------:|-------|
| react | ^19.1.0 | ✅ | Core |
| react-dom | ^19.1.0 | ✅ | Match react |
| react-router-dom | ^7.6.0 | ✅ | Solo en shell y módulos |

### Frontend - UI Components

| Paquete | Versión | Singleton | Notas |
|---------|---------|:---------:|-------|
| @mui/material | ^7.1.2 | ✅ | Última major 7 |
| @mui/icons-material | ^7.1.2 | ⚠️ | Match material |
| @mui/x-tree-view | ^8.0.0 | ⚠️ | Versión unificada pendiente |
| @emotion/react | ^11.14.0 | ✅ | Styling MUI |
| @emotion/styled | ^11.14.0 | ✅ | Styling MUI |

### Frontend - State Management

| Paquete | Versión | Singleton | Notas |
|---------|---------|:---------:|-------|
| @reduxjs/toolkit | ^2.8.0 | ✅ | RTK Query incluido |
| react-redux | ^9.2.0 | ✅ | Bindings React |
| redux-persist | ^6.0.0 | ⚠️ | Persistencia |

### Frontend - Forms & Validation

| Paquete | Versión | Singleton | Notas |
|---------|---------|:---------:|-------|
| react-hook-form | ^7.57.0 | ⚠️ | Forms |
| @hookform/resolvers | ^5.0.0 | ⚠️ | Zod integration |
| zod | ^3.25.0 | ⚠️ | Validación |

### Frontend - Build Tools

| Paquete | Versión | Notas |
|---------|---------|-------|
| vite | ^6.3.5 | Build tool |
| @vitejs/plugin-react | ^4.4.1 | React plugin |
| @originjs/vite-plugin-federation | ^1.4.1 | Module Federation |

### Backend - Runtime

| Paquete | Versión | Notas |
|---------|---------|-------|
| express | ^5.1.0 | Framework HTTP |
| cors | ^2.8.5 | CORS middleware |
| helmet | ^8.1.0 | Security headers |
| compression | ^1.8.0 | Gzip |

### Backend - Database

| Paquete | Versión | Notas |
|---------|---------|-------|
| drizzle-orm | ^0.43.1 | ORM type-safe |
| pg | ^8.16.0 | PostgreSQL driver |
| drizzle-kit | ^0.31.1 | Dev: migrations |

### Backend - Authentication

| Paquete | Versión | Notas |
|---------|---------|-------|
| jsonwebtoken | ^9.0.2 | JWT signing |
| bcryptjs | ^3.0.2 | Password hashing |
| cookie-parser | ^1.4.7 | Cookie parsing |

### Backend - Build Tools

| Paquete | Versión | Notas |
|---------|---------|-------|
| tsx | ^4.19.4 | TypeScript execution |
| tsup | ^8.5.0 | Build bundler |
| cross-env | ^7.0.3 | Cross-platform env |

### Tooling

| Paquete | Versión | Notas |
|---------|---------|-------|
| @biomejs/biome | ^1.9.4 | Linter + Formatter |
| turbo | ^2.3.0 | Monorepo orchestration |
| husky | ^9.1.7 | Git hooks |
| lint-staged | ^16.1.0 | Pre-commit linting |
| @commitlint/cli | ^19.8.1 | Commit linting |

---

## Estado Actual por Paquete

### Microfrontends

| Dependencia | mf_shell | mf_store | mf_ui | mf_contabilidad | Estado |
|-------------|:--------:|:--------:|:-----:|:---------------:|:------:|
| react | 19.1.0 | 19.1.0 | 19.1.0 | 19.1.0 | ✅ |
| react-dom | 19.1.0 | 19.1.0 | 19.1.0 | 19.1.0 | ✅ |
| @mui/material | 7.1.1 | ❌ | 7.1.2 | 7.1.2 | ⚠️ |
| @mui/icons-material | 7.1.1 | ❌ | 7.3.4 | 7.1.2 | ⚠️ |
| @mui/x-tree-view | 8.5.1 | ❌ | ❌ | 7.29.1 | ❌ |
| @emotion/react | 11.14.0 | ❌ | 11.14.0 | 11.14.0 | ✅ |
| @emotion/styled | 11.14.0 | ❌ | 11.14.0 | 11.14.0 | ✅ |
| @reduxjs/toolkit | 2.8.2 | ^2.8.2 | ❌ | 2.8.2 | ⚠️ |
| react-redux | 9.2.0 | 9.2.0 | ❌ | 9.2.0 | ✅ |
| react-router-dom | 7.6.1 | ❌ | ❌ | 7.6.1 | ✅ |
| react-hook-form | 7.57.0 | ❌ | ❌ | 7.59.0 | ⚠️ |
| zod | 3.25.49 | ❌ | ❌ | 3.25.67 | ⚠️ |
| vite | 6.3.5 | 6.3.5 | 6.3.5 | 6.3.5 | ✅ |
| typescript | 5.8.3 | 5.8.3 | 5.8.3 | 5.8.3 | ✅ |
| @biomejs/biome | 1.9.4 | 2.0.0 | 2.0.0 | 1.9.4 | ❌ |

### Microservicios

| Dependencia | gateway | autorizacion | identidad | contabilidad | Estado |
|-------------|:-------:|:------------:|:---------:|:------------:|:------:|
| express | 5.1.0 | 5.1.0 | 5.1.0 | 5.1.0 | ✅ |
| cors | 2.8.5 | 2.8.5 | 2.8.5 | 2.8.5 | ✅ |
| drizzle-orm | ❌ | 0.43.1 | 0.43.1 | 0.43.1 | ✅ |
| pg | ❌ | 8.16.0 | 8.16.0 | 8.16.0 | ✅ |
| jsonwebtoken | 9.0.2 | 9.0.2 | 9.0.2 | 9.0.2 | ✅ |
| bcryptjs | ❌ | 3.0.2 | 3.0.2 | 3.0.2 | ✅ |
| zod | 3.24.4 | 3.24.4 | 3.25.20 | 3.25.20 | ⚠️ |
| typescript | 5.8.3 | 5.8.3 | 5.8.3 | 5.8.3 | ✅ |
| tsx | 4.19.4 | 4.19.4 | 4.19.4 | 4.19.4 | ✅ |
| tsup | 8.5.0 | 8.4.0 | 8.5.0 | 8.5.0 | ⚠️ |
| @biomejs/biome | (root) | 1.9.4 | 1.9.4 | 1.9.4 | ✅ |

---

## Problemas Detectados

### ❌ Críticos (Resolver inmediatamente)

1. **@biomejs/biome: 1.9.4 vs 2.0.0**
   - mf_store y mf_ui usan 2.0.0
   - Resto usa 1.9.4
   - **Riesgo:** Conflictos de formato

2. **@mui/x-tree-view: 8.5.1 vs 7.29.1**
   - mf_shell: 8.5.1
   - mf_contabilidad: 7.29.1
   - **Riesgo:** APIs incompatibles

### ⚠️ Advertencias (Resolver pronto)

3. **zod versiones dispersas**
   - 3.24.4, 3.25.20, 3.25.49, 3.25.67
   - **Riesgo:** Comportamiento inconsistente

4. **@mui/icons-material inconsistente**
   - 7.1.1, 7.1.2, 7.3.4
   - **Riesgo:** Iconos faltantes

5. **react-hook-form: 7.57.0 vs 7.59.0**
   - **Riesgo:** Bajo, pero mejor unificar

---

## Dependencias a Eliminar

| Paquete | Ubicación | Razón |
|---------|-----------|-------|
| pnpm | mf_shell dependencies | No debería ser dependency |
| fs | mf_store devDependencies | Placeholder package |
| crypto | api-identidad, api-contabilidad | Built-in de Node.js |
| bcrypt + bcryptjs | duplicado | Elegir solo bcryptjs |
| add | mf_shell | Paquete incorrecto |
| install | mf_contabilidad | Paquete incorrecto |

---

## Configuración Recomendada: pnpm overrides

Agregar al `package.json` raíz para forzar versiones:

```json
{
  "pnpm": {
    "overrides": {
      "react": "^19.1.0",
      "react-dom": "^19.1.0",
      "@mui/material": "^7.1.2",
      "@emotion/react": "^11.14.0",
      "@emotion/styled": "^11.14.0",
      "@reduxjs/toolkit": "^2.8.2",
      "react-redux": "^9.2.0",
      "zod": "^3.25.0",
      "typescript": "~5.8.3"
    }
  }
}
```

---

## Scripts de Verificación

### Verificar versiones inconsistentes

```bash
# Listar todas las versiones de react
pnpm ls react --depth=0 -r

# Listar todas las versiones de @mui/material
pnpm ls @mui/material --depth=0 -r

# Listar todas las versiones de biome
pnpm ls @biomejs/biome --depth=0 -r
```

### Auditar vulnerabilidades

```bash
pnpm audit
```

### Actualizar dependencias

```bash
# Ver outdated
pnpm outdated -r

# Actualizar interactivamente
pnpm update -i -r
```

---

## Changelog de Versiones

### 2026-01-17

- Documentación inicial de matriz de dependencias
- Identificados problemas de versiones
- Propuesta de versiones objetivo

---

*Este documento debe actualizarse al agregar o actualizar dependencias.*
