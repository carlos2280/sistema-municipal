# Checklist de Onboarding para Nuevos Desarrolladores

## Información General del Proyecto

### Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SISTEMA MUNICIPAL                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND (Microfrontends)                │   │
│  │                                                             │   │
│  │   ┌─────────────┐                                          │   │
│  │   │  mf_shell   │ ◄── Host (Puerto 5000)                   │   │
│  │   │  (React)    │     Orquesta todos los MFs               │   │
│  │   └──────┬──────┘                                          │   │
│  │          │                                                  │   │
│  │   ┌──────┴──────┬──────────────┬──────────────┐           │   │
│  │   │             │              │              │            │   │
│  │   ▼             ▼              ▼              ▼            │   │
│  │ ┌────────┐ ┌────────┐ ┌────────────┐ ┌────────────┐       │   │
│  │ │mf_store│ │ mf_ui  │ │mf_contabil.│ │mf_tesorería│       │   │
│  │ │ :5010  │ │ :5011  │ │   :5020    │ │   :5030    │       │   │
│  │ │ Redux  │ │  MUI   │ │  Dominio   │ │  Dominio   │       │   │
│  │ └────────┘ └────────┘ └────────────┘ └────────────┘       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    BACKEND (Microservicios)                 │   │
│  │                                                             │   │
│  │   ┌─────────────┐                                          │   │
│  │   │ api-gateway │ ◄── Puerto 3000                          │   │
│  │   │   (Hono)    │     Proxy y autenticación                │   │
│  │   └──────┬──────┘                                          │   │
│  │          │                                                  │   │
│  │   ┌──────┴──────┬──────────────┬──────────────┐           │   │
│  │   │             │              │              │            │   │
│  │   ▼             ▼              ▼              ▼            │   │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │   │
│  │ │   api-   │ │   api-   │ │   api-   │ │   api-   │       │   │
│  │ │identidad │ │autoriz.  │ │contabil. │ │tesorería │       │   │
│  │ │  :3001   │ │  :3003   │ │  :3002   │ │  :3004   │       │   │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      BASE DE DATOS                          │   │
│  │                      PostgreSQL                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Module Federation |
| **State Management** | Redux Toolkit, RTK Query |
| **UI Framework** | Material UI (MUI) 7.x |
| **Backend** | Hono, Node.js, TypeScript |
| **ORM** | Drizzle ORM |
| **Base de Datos** | PostgreSQL |
| **Monorepo** | pnpm workspaces, Turborepo |
| **Linting** | Biome |
| **Deployment** | Railway |

---

## Checklist de Onboarding

### Día 1: Setup del Entorno

#### Requisitos Previos
- [ ] Node.js v20+ instalado (`node --version`)
- [ ] pnpm v10+ instalado (`pnpm --version`)
- [ ] Git configurado con SSH
- [ ] Editor de código (VS Code recomendado)
- [ ] Extensiones de VS Code instaladas:
  - [ ] Biome
  - [ ] TypeScript Vue Plugin (Volar) - opcional
  - [ ] ES7+ React/Redux/React-Native snippets

#### Clonar y Setup
- [ ] Clonar repositorio
  ```bash
  git clone git@github.com:[org]/sistema-municipal.git
  cd sistema-municipal
  ```
- [ ] Instalar dependencias
  ```bash
  pnpm install
  ```
- [ ] Copiar archivos de entorno
  ```bash
  cp .env.example .env
  # Repetir para cada microservicio/microfrontend si es necesario
  ```
- [ ] Configurar variables de entorno (pedir al equipo)
- [ ] Levantar base de datos (Docker o conexión a staging)
  ```bash
  docker-compose up -d postgres
  ```

#### Verificar Instalación
- [ ] Build exitoso
  ```bash
  pnpm build
  ```
- [ ] Levantar en desarrollo
  ```bash
  pnpm dev:all
  ```
- [ ] Acceder a http://localhost:5000 y ver el login

---

### Día 2: Entender la Arquitectura

#### Leer Documentación
- [ ] Leer este checklist completo
- [ ] Leer [01-MODULE-FEDERATION-REFERENCE.md](./01-MODULE-FEDERATION-REFERENCE.md)
- [ ] Leer [02-SHARED-CONFIG-GUIDE.md](./02-SHARED-CONFIG-GUIDE.md)
- [ ] Leer [05-TIPOS-COMPARTIDOS-ARQUITECTURA.md](./05-TIPOS-COMPARTIDOS-ARQUITECTURA.md)

#### Explorar el Código
- [ ] Revisar estructura del monorepo
  ```
  sistema-municipal/
  ├── apps/
  │   ├── microfrontends/
  │   │   ├── mf_shell/       ← Host principal
  │   │   ├── mf_store/       ← Estado global (Redux)
  │   │   ├── mf_ui/          ← Componentes compartidos
  │   │   └── mf_contabilidad/← Módulo de dominio
  │   └── microservices/
  │       ├── api-gateway/    ← Proxy central
  │       ├── api-identidad/  ← Usuarios, áreas
  │       ├── api-autorizacion/← Login, JWT
  │       └── api-contabilidad/← Lógica de negocio
  ├── packages/
  │   ├── shared/             ← Schemas de BD (Drizzle)
  │   ├── types/              ← Tipos TypeScript (si existe)
  │   └── contracts/          ← Schemas Zod (si existe)
  └── docs/
      └── auditoria/          ← Esta documentación
  ```
- [ ] Entender el flujo de autenticación
- [ ] Entender cómo mf_store expone el estado
- [ ] Ver cómo mf_contabilidad consume mf_store

---

### Día 3: Primera Tarea

#### Antes de Codificar
- [ ] Entender el ticket/issue asignado
- [ ] Identificar qué MF/microservicio afecta
- [ ] Revisar código existente relacionado
- [ ] Preguntar dudas al equipo

#### Flujo de Trabajo Git
- [ ] Crear branch desde `main`
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feat/[ticket]-descripcion-corta
  ```
- [ ] Commits con conventional commits
  ```bash
  git commit -m "feat(mf_contabilidad): add cuenta creation form"
  git commit -m "fix(api-gateway): handle timeout errors"
  ```
- [ ] Push y crear PR
  ```bash
  git push -u origin feat/[ticket]-descripcion-corta
  ```

---

## Guía Rápida por Tipo de Tarea

### Si trabajas en un Microfrontend Existente

1. **Ubicar el código**
   ```bash
   cd apps/microfrontends/mf_[nombre]
   ```

2. **Levantar en desarrollo**
   ```bash
   # Solo el MF (sin dependencias)
   pnpm dev

   # Con mf_store (si lo necesitas)
   turbo run dev --filter=mf-[nombre] --filter=mf-store
   ```

3. **Importar desde mf_store** (si necesitas estado/APIs)
   ```typescript
   import { useAppSelector, useAppDispatch } from "mf_store/hooks";
   import { useGetXxxQuery } from "mf_store/api/xxx";
   ```

4. **Importar tipos** (cuando exista @municipal/types)
   ```typescript
   import type { MiTipo } from "@municipal/types/dominio";
   ```

### Si trabajas en un Microservicio

1. **Ubicar el código**
   ```bash
   cd apps/microservices/api-[nombre]
   ```

2. **Levantar en desarrollo**
   ```bash
   pnpm dev
   ```

3. **Probar endpoints**
   - Usar Postman/Insomnia
   - O curl directamente
   ```bash
   curl http://localhost:300X/api/endpoint
   ```

4. **Schemas de BD**
   ```typescript
   import { usuarios, areas } from "@municipal/shared/database";
   ```

### Si creas un Nuevo Microfrontend

1. **Seguir la guía completa**
   - [07-NUEVO-MICROFRONTEND-GUIDE.md](./07-NUEVO-MICROFRONTEND-GUIDE.md)

2. **Solicitar**
   - Puerto asignado (50XX)
   - Revisión de arquitectura con tech lead

---

## Comandos Frecuentes

### Monorepo

```bash
# Instalar dependencias
pnpm install

# Build de todo
pnpm build

# Dev de todo
pnpm dev:all

# Dev solo frontend
pnpm dev:mf

# Dev solo backend
pnpm dev:backend

# Limpiar todo
pnpm clean:all
```

### Por Módulo

```bash
# Ejecutar comando en un módulo específico
pnpm --filter mf-shell dev
pnpm --filter api-gateway build

# Con turbo (más rápido, con cache)
turbo run dev --filter=mf-shell
turbo run build --filter=api-*
```

### Git

```bash
# Actualizar main
git checkout main && git pull

# Crear feature branch
git checkout -b feat/xxx

# Rebase con main (preferido sobre merge)
git fetch origin && git rebase origin/main

# Commit con mensaje convencional
git commit -m "feat(scope): description"
git commit -m "fix(scope): description"
git commit -m "refactor(scope): description"
```

### Base de Datos

```bash
# Generar migración (desde packages/shared)
cd packages/shared
pnpm db:generate

# Aplicar migraciones
pnpm db:migrate

# Seed de datos
pnpm db:seed
```

---

## Convenciones del Proyecto

### Nombres de Archivos

```
# Componentes React
PascalCase.tsx          ✅ UserProfile.tsx
kebab-case.tsx          ❌

# Hooks
camelCase.ts            ✅ useUserData.ts
use-user-data.ts        ❌

# Utilidades
camelCase.ts            ✅ formatDate.ts

# Tipos
kebab-case.types.ts     ✅ user.types.ts
PascalCase.ts           ❌
```

### Estructura de Imports

```typescript
// 1. React y librerías externas
import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";

// 2. Módulos federados
import { useAppSelector } from "mf_store/hooks";

// 3. Paquetes internos (@municipal/*)
import type { Usuario } from "@municipal/types/auth";

// 4. Imports relativos del proyecto
import { MyComponent } from "@/components/MyComponent";
import { formatDate } from "@/utils/formatDate";
```

### Commits (Conventional Commits)

```
feat(scope): add new feature
fix(scope): fix bug
refactor(scope): code refactoring
docs(scope): documentation changes
style(scope): formatting, no code change
test(scope): adding tests
chore(scope): maintenance tasks
```

**Scopes comunes:**
- `mf_shell`, `mf_store`, `mf_contabilidad`
- `api-gateway`, `api-identidad`, `api-contabilidad`
- `shared`, `types`, `contracts`

---

## Recursos Útiles

### Documentación Externa

- [React 19 Docs](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [Material UI](https://mui.com/)
- [Vite](https://vitejs.dev/)
- [Module Federation](https://module-federation.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Hono](https://hono.dev/)
- [Zod](https://zod.dev/)

### Documentación Interna

- [Auditoría de Arquitectura](./00-INDICE.md)
- [Module Federation Reference](./01-MODULE-FEDERATION-REFERENCE.md)
- [Shared Config Guide](./02-SHARED-CONFIG-GUIDE.md)
- [Error Handling](./03-ERROR-HANDLING-RESILIENCE.md)
- [Vite Config Templates](./04-VITE-CONFIG-TEMPLATES.md)
- [Tipos Compartidos](./05-TIPOS-COMPARTIDOS-ARQUITECTURA.md)
- [Contratos API](./06-CONTRATOS-API-ZOD.md)
- [Crear Nuevo MF](./07-NUEVO-MICROFRONTEND-GUIDE.md)

---

## Contactos y Soporte

### Preguntas Técnicas

1. Revisar documentación primero
2. Buscar en el código existente
3. Preguntar en el canal de desarrollo
4. Agendar call si es complejo

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Module not found" al importar de mf_store | Verificar que mf_store esté corriendo |
| "Invalid hook call" | Verificar `singleton: true` en shared |
| Build falla | `pnpm clean:all && pnpm install` |
| Tipos no reconocidos | Verificar `tsconfig.json` paths |
| CORS errors | Verificar configuración de api-gateway |

---

## Checklist de Primer PR

Antes de crear tu primer PR, verifica:

- [ ] El código compila sin errores (`pnpm build`)
- [ ] Linting pasa (`pnpm lint`)
- [ ] No hay `console.log` de debug
- [ ] Nombres de variables/funciones descriptivos
- [ ] Tipos TypeScript correctos (no `any`)
- [ ] Imports organizados según convención
- [ ] Commit messages siguen conventional commits
- [ ] PR description explica el cambio
- [ ] PR está basado en `main` actualizado

---

*¡Bienvenido al equipo! Si tienes dudas, no dudes en preguntar.*
