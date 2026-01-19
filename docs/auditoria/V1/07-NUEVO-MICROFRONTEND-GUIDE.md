# Guía: Crear un Nuevo Microfrontend

## Prerequisitos

Antes de crear un nuevo MF, asegúrate de tener:

- [ ] Node.js >= 20.0.0
- [ ] pnpm >= 10.0.0
- [ ] Acceso al repositorio del monorepo
- [ ] Puerto asignado para el nuevo MF (coordinar con el equipo)

---

## Paso 1: Crear la Estructura del Proyecto

### 1.1 Crear el directorio

```bash
# Desde la raíz del monorepo
mkdir -p apps/microfrontends/mf_[nombre]
cd apps/microfrontends/mf_[nombre]
```

### 1.2 Inicializar package.json

```bash
pnpm init
```

Editar `package.json`:

```json
{
  "name": "mf-[nombre]",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint": "biome lint ./src",
    "format": "biome format ./src --write",
    "check": "biome check ./src --write"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.1"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@originjs/vite-plugin-federation": "^1.3.6",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.4.1",
    "typescript": "~5.7.2",
    "vite": "^6.3.5"
  }
}
```

### 1.3 Instalar dependencias

```bash
pnpm install
```

---

## Paso 2: Configurar TypeScript

### 2.1 Crear tsconfig.json

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@municipal/types": ["../../packages/types/src"],
      "@municipal/types/*": ["../../packages/types/src/*"],
      "@municipal/contracts": ["../../packages/contracts/src"],
      "@municipal/contracts/*": ["../../packages/contracts/src/*"]
    }
  },
  "include": ["src"]
}
```

### 2.2 Crear declaraciones de tipos para Module Federation

```typescript
// src/types/federation.d.ts

// Declaraciones para mf_store
declare module "mf_store/store" {
  import type { Store } from "@reduxjs/toolkit";
  export const store: Store;
  export type RootState = ReturnType<typeof store.getState>;
  export type AppDispatch = typeof store.dispatch;
}

declare module "mf_store/hooks" {
  import type { TypedUseSelectorHook } from "react-redux";
  import type { RootState, AppDispatch } from "mf_store/store";
  export const useAppDispatch: () => AppDispatch;
  export const useAppSelector: TypedUseSelectorHook<RootState>;
}

// Agregar más declaraciones según las APIs que consumas
declare module "mf_store/api/[nombre]" {
  // Declarar los hooks de RTK Query que uses
}

// Declaraciones para mf_ui (si lo usas)
declare module "mf_ui/components" {
  export * from "@mui/material";
}

declare module "mf_ui/theme" {
  import type { Theme } from "@mui/material";
  export const theme: Theme;
}
```

---

## Paso 3: Configurar Vite

### 3.1 Crear vite.config.ts

```typescript
import path from "node:path";
import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/**
 * ═══════════════════════════════════════════════════════════════════
 * mf_[NOMBRE] - Remote Application (Módulo de [DOMINIO])
 * ═══════════════════════════════════════════════════════════════════
 *
 * [DESCRIPCIÓN BREVE DEL MÓDULO]
 *
 * Variables de entorno:
 * - VITE_PORT: Puerto del servidor (default: [PUERTO])
 * - VITE_MF_STORE_URL: URL del remoteEntry.js de mf_store
 */

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL MÓDULO - EDITAR ESTOS VALORES
// ═══════════════════════════════════════════════════════════════════
const MODULE_NAME = "mf_[nombre]";
const DEFAULT_PORT = 50XX;  // Asignar puerto único
const CONSUMES_STORE = true;  // ¿Este MF usa mf_store?

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";
  const isProduction = mode === "production";

  const pkg = require("./package.json");
  const deps = pkg.dependencies;

  return {
    base: "/",

    plugins: [
      react(),
      federation({
        name: MODULE_NAME,
        filename: "remoteEntry.js",

        // ═══════════════════════════════════════════════════════════
        // EXPOSES - Lo que este módulo expone al host
        // ═══════════════════════════════════════════════════════════
        exposes: {
          "./routes": "./src/routes/index.tsx",
          // Agregar más exports según necesidad:
          // "./components": "./src/components/index.ts",
          // "./hooks": "./src/hooks/index.ts",
        },

        // ═══════════════════════════════════════════════════════════
        // REMOTES - Solo si consume otros módulos
        // ═══════════════════════════════════════════════════════════
        ...(CONSUMES_STORE && {
          remotes: {
            mf_store: {
              external: env.VITE_MF_STORE_URL,
              format: "esm",
              externalType: "url",
            },
          },
        }),

        // ═══════════════════════════════════════════════════════════
        // SHARED - Configuración estándar (NO MODIFICAR sin razón)
        // ═══════════════════════════════════════════════════════════
        shared: {
          // Core React - SIEMPRE del Host
          react: {
            singleton: true,
            requiredVersion: deps.react,
            import: false,
          },
          "react-dom": {
            singleton: true,
            requiredVersion: deps["react-dom"],
            import: false,
          },

          // State Management - SIEMPRE del Host
          "@reduxjs/toolkit": {
            singleton: true,
            import: false,
          },
          "react-redux": {
            singleton: true,
            import: false,
          },

          // UI Framework - Del Host
          "@mui/material": {
            singleton: true,
            import: false,
          },
          "@emotion/react": {
            singleton: true,
            import: false,
          },
          "@emotion/styled": {
            singleton: true,
            import: false,
          },

          // Router
          "react-router-dom": {
            singleton: true,
            import: false,
          },
        },
      }),
    ],

    build: {
      target: "esnext",
      minify: isProduction ? "esbuild" : false,
      sourcemap: isDev,
      cssCodeSplit: true,
      modulePreload: false,
      outDir: "dist",
      assetsDir: "assets",
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      port: Number(env.VITE_PORT) || DEFAULT_PORT,
      strictPort: true,
      host: true,
      cors: true,
    },

    preview: {
      port: Number(env.VITE_PORT) || DEFAULT_PORT,
      strictPort: true,
      host: true,
      cors: true,
    },
  };
});
```

### 3.2 Crear archivo .env

```bash
# .env
VITE_PORT=50XX
VITE_MF_STORE_URL=http://localhost:5010/remoteEntry.js
```

```bash
# .env.example (para documentar)
VITE_PORT=50XX
VITE_MF_STORE_URL=http://localhost:5010/remoteEntry.js
```

---

## Paso 4: Crear Estructura de Código

### 4.1 Estructura de directorios recomendada

```
src/
├── components/          # Componentes del módulo
│   ├── common/         # Componentes reutilizables dentro del módulo
│   └── index.ts        # Barrel export
├── pages/              # Páginas/Vistas
│   ├── Dashboard.tsx
│   └── index.ts
├── routes/             # Configuración de rutas
│   └── index.tsx
├── hooks/              # Hooks personalizados
│   └── index.ts
├── utils/              # Utilidades
│   └── index.ts
├── types/              # Tipos locales (solo si no están en @municipal/types)
│   └── federation.d.ts
├── App.tsx             # Componente root (para desarrollo standalone)
├── main.tsx            # Entry point (para desarrollo standalone)
└── vite-env.d.ts
```

### 4.2 Crear el componente de rutas

```typescript
// src/routes/index.tsx
import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../pages/Dashboard";
// Importar más páginas según necesidad

export default function ModuleRoutes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      {/* Agregar más rutas */}
      <Route path="*" element={<div>Página no encontrada</div>} />
    </Routes>
  );
}
```

### 4.3 Crear una página de ejemplo

```typescript
// src/pages/Dashboard.tsx
import { useAppSelector } from "mf_store/hooks";

export function Dashboard() {
  // Ejemplo de uso del store compartido
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div>
      <h1>Dashboard de [Nombre del Módulo]</h1>
      {user && <p>Bienvenido, {user.nombreCompleto}</p>}

      {/* Contenido del módulo */}
    </div>
  );
}
```

### 4.4 Crear App.tsx para desarrollo standalone

```typescript
// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import ModuleRoutes from "./routes";

/**
 * Este componente solo se usa para desarrollo standalone del módulo.
 * En producción, el Host carga las rutas directamente.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: "20px" }}>
        <h2>Desarrollo Standalone - mf_[nombre]</h2>
        <ModuleRoutes />
      </div>
    </BrowserRouter>
  );
}
```

### 4.5 Crear main.tsx

```typescript
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

/**
 * Entry point para desarrollo standalone.
 * En producción, este archivo no se usa - el Host importa las rutas.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 4.6 Crear index.html

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>mf_[nombre] - Desarrollo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Paso 5: Registrar en el Host

### 5.1 Actualizar variables de entorno del Host

```bash
# apps/microfrontends/mf_shell/.env
VITE_MF_[NOMBRE]_URL=http://localhost:50XX/remoteEntry.js
```

### 5.2 Actualizar vite.config.ts del Host

```typescript
// apps/microfrontends/mf_shell/vite.config.ts

// En la sección de remotes:
remotes: {
  // ... remotes existentes
  mf_[nombre]: {
    external: env.VITE_MF_[NOMBRE]_URL,
    format: "esm",
    externalType: "url",
  },
},
```

### 5.3 Agregar declaración de tipos en el Host

```typescript
// apps/microfrontends/mf_shell/src/types/federation.d.ts

declare module "mf_[nombre]/routes" {
  import type { ComponentType } from "react";
  const Routes: ComponentType;
  export default Routes;
}
```

### 5.4 Agregar rutas en el Host

```typescript
// apps/microfrontends/mf_shell/src/routes/index.tsx
import { lazy, Suspense } from "react";
import { MicroFrontendErrorBoundary } from "../components/MicroFrontendErrorBoundary";

// Importar el nuevo módulo
const NuevoModuloRoutes = lazy(() => import("mf_[nombre]/routes"));

// En el router:
{
  path: "/[nombre]/*",
  element: (
    <MicroFrontendErrorBoundary moduleName="[Nombre]">
      <Suspense fallback={<div>Cargando...</div>}>
        <NuevoModuloRoutes />
      </Suspense>
    </MicroFrontendErrorBoundary>
  ),
}
```

---

## Paso 6: Configurar Turbo

### 6.1 Verificar turbo.json

El archivo `turbo.json` en la raíz ya debería manejar el nuevo módulo automáticamente si sigue la convención de nombres.

Si necesitas configuración específica:

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## Paso 7: Desarrollo y Testing

### 7.1 Desarrollo standalone (solo el módulo)

```bash
# Desde el directorio del módulo
cd apps/microfrontends/mf_[nombre]
pnpm dev
```

Abrir http://localhost:50XX

### 7.2 Desarrollo integrado (con el Host)

```bash
# Desde la raíz del monorepo

# Opción 1: Todos los MFs
pnpm dev:mf

# Opción 2: Solo algunos MFs
turbo run dev --filter=mf-shell --filter=mf-store --filter=mf-[nombre]
```

### 7.3 Build y Preview

```bash
# Build del módulo
pnpm --filter mf-[nombre] build

# Preview
pnpm --filter mf-[nombre] preview
```

---

## Checklist Final

### Estructura
- [ ] `package.json` creado con dependencias correctas
- [ ] `tsconfig.json` configurado
- [ ] `vite.config.ts` configurado con Module Federation
- [ ] `.env` y `.env.example` creados
- [ ] Estructura de directorios creada

### Código
- [ ] `src/routes/index.tsx` exporta las rutas
- [ ] `src/types/federation.d.ts` con declaraciones
- [ ] Al menos una página funcional
- [ ] Imports de mf_store funcionando (si aplica)

### Integración
- [ ] Variable de entorno agregada al Host
- [ ] Remote configurado en Host `vite.config.ts`
- [ ] Declaración de tipos en Host
- [ ] Rutas agregadas en Host router
- [ ] Error Boundary configurado

### Documentación
- [ ] README.md del módulo (opcional pero recomendado)
- [ ] Puerto documentado en tabla de puertos

---

## Tabla de Puertos

| Módulo | Puerto | Estado |
|--------|--------|--------|
| mf_shell | 5000 | ✅ Activo |
| mf_store | 5010 | ✅ Activo |
| mf_ui | 5011 | ✅ Activo |
| mf_contabilidad | 5020 | ✅ Activo |
| mf_tesoreria | 5030 | 📝 Reservado |
| mf_rrhh | 5040 | 📝 Reservado |
| mf_[nuevo] | 50XX | 📝 Asignar |

---

*Siguiente: [08-CHECKLIST-NUEVO-DESARROLLADOR.md](./08-CHECKLIST-NUEVO-DESARROLLADOR.md)*
