# Templates de Configuración Vite para Module Federation

## Visión General

Este documento proporciona templates copy-paste para cada tipo de módulo federado.

```
┌─────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA                           │
│                                                             │
│                    ┌──────────────┐                        │
│                    │    HOST      │                        │
│                    │  (mf_shell)  │                        │
│                    │  Puerto 5000 │                        │
│                    └──────┬───────┘                        │
│                           │                                 │
│           ┌───────────────┼───────────────┐                │
│           │               │               │                 │
│           ▼               ▼               ▼                 │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│    │  REMOTE  │    │  REMOTE  │    │  HÍBRIDO │           │
│    │ mf_store │    │  mf_ui   │    │mf_contab.│           │
│    │   5010   │    │   5011   │    │   5020   │           │
│    └──────────┘    └──────────┘    └────┬─────┘           │
│                                         │                  │
│                                         ▼                  │
│                                   Consume mf_store         │
└─────────────────────────────────────────────────────────────┘
```

---

## Template 1: HOST (Contenedor Principal)

### Archivo: `mf_shell/vite.config.ts`

```typescript
import path from "node:path";
import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/**
 * ═══════════════════════════════════════════════════════════════════
 * mf_shell - HOST Application
 * ═══════════════════════════════════════════════════════════════════
 *
 * Aplicación contenedora principal que:
 * - Orquesta todos los microfrontends
 * - Provee las dependencias compartidas (singleton)
 * - NO expone módulos (solo consume)
 *
 * Variables de entorno requeridas:
 * - VITE_MF_STORE_URL: URL del remoteEntry.js de mf_store
 * - VITE_MF_UI_URL: URL del remoteEntry.js de mf_ui
 * - VITE_MF_CONTABILIDAD_URL: URL del remoteEntry.js de mf_contabilidad
 */

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";
  const isProduction = mode === "production";

  // Leer versiones desde package.json
  const pkg = require("./package.json");
  const deps = pkg.dependencies;

  // URLs de remotos desde variables de entorno
  const remoteUrls = {
    mf_store: env.VITE_MF_STORE_URL,
    mf_ui: env.VITE_MF_UI_URL,
    mf_contabilidad: env.VITE_MF_CONTABILIDAD_URL,
  };

  // Validar que todas las URLs estén definidas
  Object.entries(remoteUrls).forEach(([name, url]) => {
    if (!url) {
      console.warn(`⚠️ Missing env variable for ${name}`);
    }
  });

  return {
    base: "/",

    plugins: [
      react(),
      federation({
        name: "mf_shell",

        // ═══════════════════════════════════════════════════════════
        // REMOTES - Módulos que consume este host
        // ═══════════════════════════════════════════════════════════
        remotes: {
          mf_store: {
            external: remoteUrls.mf_store,
            format: "esm",
            externalType: "url",
          },
          mf_ui: {
            external: remoteUrls.mf_ui,
            format: "esm",
            externalType: "url",
          },
          mf_contabilidad: {
            external: remoteUrls.mf_contabilidad,
            format: "esm",
            externalType: "url",
          },
        },

        // ═══════════════════════════════════════════════════════════
        // SHARED - Dependencias compartidas (HOST las provee)
        // ═══════════════════════════════════════════════════════════
        shared: {
          // ─────────────────────────────────────────────────────────
          // CRÍTICAS - React core (singleton + eager + strict)
          // ─────────────────────────────────────────────────────────
          react: {
            singleton: true,
            requiredVersion: deps.react,
            strictVersion: true,
            eager: true,
          },
          "react-dom": {
            singleton: true,
            requiredVersion: deps["react-dom"],
            strictVersion: true,
            eager: true,
          },

          // ─────────────────────────────────────────────────────────
          // ESTADO GLOBAL - Redux (singleton + eager)
          // ─────────────────────────────────────────────────────────
          "@reduxjs/toolkit": {
            singleton: true,
            requiredVersion: deps["@reduxjs/toolkit"],
            eager: true,
          },
          "react-redux": {
            singleton: true,
            requiredVersion: deps["react-redux"],
            eager: true,
          },

          // ─────────────────────────────────────────────────────────
          // UI FRAMEWORK - MUI (singleton para theme consistente)
          // ─────────────────────────────────────────────────────────
          "@mui/material": {
            singleton: true,
            requiredVersion: deps["@mui/material"],
          },
          "@emotion/react": {
            singleton: true,
            requiredVersion: deps["@emotion/react"],
          },
          "@emotion/styled": {
            singleton: true,
            requiredVersion: deps["@emotion/styled"],
          },

          // ─────────────────────────────────────────────────────────
          // UTILIDADES - No requieren singleton
          // ─────────────────────────────────────────────────────────
          "react-hook-form": {
            singleton: false,
          },
          "lucide-react": {
            singleton: false,
          },
        },
      }),
    ],

    // ═══════════════════════════════════════════════════════════════
    // BUILD CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    build: {
      target: "esnext",
      minify: isProduction ? "esbuild" : false,
      sourcemap: isDev,
      cssCodeSplit: true,
      modulePreload: false,
      outDir: "dist",
      assetsDir: "assets",
    },

    // ═══════════════════════════════════════════════════════════════
    // RESOLVE
    // ═══════════════════════════════════════════════════════════════
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // SERVER (Development)
    // ═══════════════════════════════════════════════════════════════
    server: {
      port: Number(env.VITE_PORT) || 5000,
      strictPort: true,
      host: true,
      cors: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // PREVIEW (Production preview)
    // ═══════════════════════════════════════════════════════════════
    preview: {
      port: Number(env.VITE_PORT) || 5000,
      strictPort: true,
      host: true,
      cors: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // ASSETS
    // ═══════════════════════════════════════════════════════════════
    assetsInclude: ["**/*.ttf", "**/*.woff", "**/*.woff2"],
  };
});
```

---

## Template 2: REMOTE Puro (mf_store, mf_ui)

### Archivo: `mf_store/vite.config.ts`

```typescript
import path from "node:path";
import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * ═══════════════════════════════════════════════════════════════════
 * mf_store - REMOTE Application (State Management)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Módulo remoto que:
 * - Expone el store de Redux y APIs
 * - NO consume otros remotos
 * - USA dependencias del Host (import: false)
 */

const DEV_PORT = 5010;

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const isProduction = mode === "production";

  // Leer versiones desde package.json
  const pkg = require("./package.json");
  const deps = pkg.dependencies;

  return {
    base: "/",

    plugins: [
      react(),
      federation({
        name: "mf_store",
        filename: "remoteEntry.js",

        // ═══════════════════════════════════════════════════════════
        // EXPOSES - Módulos que este remote provee
        // ═══════════════════════════════════════════════════════════
        exposes: {
          // Core - Todos los MF necesitan acceso
          "./store": "./src/store/store.ts",
          "./hooks": "./src/store/hooks.ts",

          // Features - Por dominio
          "./auth": "./src/store/features/authSlice.ts",
          "./menu": "./src/store/features/menuSlice.ts",

          // APIs - Granulares por dominio
          "./api/base": "./src/store/api/baseApi.ts",
          "./api/auth": "./src/store/api/authApi.ts",
          "./api/menu": "./src/store/api/menuApi.ts",
          "./api/contabilidad": "./src/store/api/contabilidadApi.ts",
          "./api/tesoreria": "./src/store/api/tesoreriaApi.ts",
          "./api/indicadores": "./src/store/api/indicadoresApi.ts",
        },

        // ═══════════════════════════════════════════════════════════
        // SHARED - Usar dependencias del HOST (import: false)
        // ═══════════════════════════════════════════════════════════
        shared: {
          react: {
            singleton: true,
            requiredVersion: deps.react,
            import: false,  // ← NO incluir en bundle
          },
          "react-dom": {
            singleton: true,
            requiredVersion: deps["react-dom"],
            import: false,
          },
          "@reduxjs/toolkit": {
            singleton: true,
            requiredVersion: deps["@reduxjs/toolkit"],
            import: false,
          },
          "react-redux": {
            singleton: true,
            requiredVersion: deps["react-redux"],
            import: false,
          },
        },
      }),
    ],

    // ═══════════════════════════════════════════════════════════════
    // BUILD
    // ═══════════════════════════════════════════════════════════════
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
      port: DEV_PORT,
      strictPort: true,
      host: true,
      cors: true,
    },

    preview: {
      port: DEV_PORT,
      strictPort: true,
      host: true,
      cors: true,
    },
  };
});
```

### Archivo: `mf_ui/vite.config.ts`

```typescript
import path from "node:path";
import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * ═══════════════════════════════════════════════════════════════════
 * mf_ui - REMOTE Application (UI Components)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Módulo remoto que:
 * - Expone componentes UI reutilizables y theme
 * - NO consume otros remotos
 * - USA dependencias del Host (import: false)
 */

const DEV_PORT = 5011;

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const isProduction = mode === "production";

  const pkg = require("./package.json");
  const deps = pkg.dependencies;

  return {
    base: "/",

    plugins: [
      react(),
      federation({
        name: "mf_ui",
        filename: "remoteEntry.js",

        // ═══════════════════════════════════════════════════════════
        // EXPOSES - Componentes y theme
        // ═══════════════════════════════════════════════════════════
        exposes: {
          "./theme": "./src/theme/index.ts",
          "./components": "./src/components/index.ts",
          // Componentes individuales para tree-shaking
          "./Button": "./src/components/Button.tsx",
          "./Input": "./src/components/Input.tsx",
          "./Card": "./src/components/Card.tsx",
        },

        // ═══════════════════════════════════════════════════════════
        // SHARED
        // ═══════════════════════════════════════════════════════════
        shared: {
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
          "@mui/material": {
            singleton: true,
            requiredVersion: deps["@mui/material"],
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
      port: DEV_PORT,
      strictPort: true,
      host: true,
      cors: true,
    },

    preview: {
      port: DEV_PORT,
      strictPort: true,
      host: true,
      cors: true,
    },
  };
});
```

---

## Template 3: REMOTE Híbrido (Consume y Expone)

### Archivo: `mf_contabilidad/vite.config.ts`

```typescript
import path from "node:path";
import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/**
 * ═══════════════════════════════════════════════════════════════════
 * mf_contabilidad - REMOTE Híbrido (Módulo de Dominio)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Módulo remoto híbrido que:
 * - EXPONE: rutas y componentes del módulo de contabilidad
 * - CONSUME: mf_store para acceso al estado global
 * - USA dependencias del Host (import: false para críticas)
 *
 * Variables de entorno:
 * - VITE_PORT: Puerto del servidor (default: 5020)
 * - VITE_MF_STORE_URL: URL del remoteEntry.js de mf_store
 */

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
        name: "mf_contabilidad",
        filename: "remoteEntry.js",

        // ═══════════════════════════════════════════════════════════
        // EXPOSES - Lo que este módulo provee al host
        // ═══════════════════════════════════════════════════════════
        exposes: {
          "./routes": "./src/routes/routes.tsx",
          "./components": "./src/page/index.ts",
        },

        // ═══════════════════════════════════════════════════════════
        // REMOTES - Lo que este módulo consume
        // ═══════════════════════════════════════════════════════════
        remotes: {
          mf_store: {
            external: env.VITE_MF_STORE_URL,
            format: "esm",
            externalType: "url",
          },
        },

        // ═══════════════════════════════════════════════════════════
        // SHARED - Híbrido: críticas del host, específicas propias
        // ═══════════════════════════════════════════════════════════
        shared: {
          // ─────────────────────────────────────────────────────────
          // CRÍTICAS - Siempre del Host (import: false)
          // ─────────────────────────────────────────────────────────
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
          "@reduxjs/toolkit": {
            singleton: true,
            requiredVersion: deps["@reduxjs/toolkit"],
            import: false,
          },
          "react-redux": {
            singleton: true,
            requiredVersion: deps["react-redux"],
            import: false,
          },

          // ─────────────────────────────────────────────────────────
          // UI FRAMEWORK - Del Host para theme consistente
          // ─────────────────────────────────────────────────────────
          "@mui/material": {
            singleton: true,
            requiredVersion: deps["@mui/material"],
            import: false,
          },
          "@mui/icons-material": {
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

          // ─────────────────────────────────────────────────────────
          // ESPECÍFICAS DEL MÓDULO - Puede proveer si Host no tiene
          // ─────────────────────────────────────────────────────────
          "@mui/x-tree-view": {
            singleton: true,
            requiredVersion: deps["@mui/x-tree-view"],
            // import: true (default) - provee si necesario
          },
          "react-hook-form": {
            singleton: false,  // Cada MF puede tener su versión
          },
          "lucide-react": {
            singleton: false,
          },
          sonner: {
            singleton: false,
          },
        },
      }),
    ],

    // ═══════════════════════════════════════════════════════════════
    // BUILD
    // ═══════════════════════════════════════════════════════════════
    build: {
      target: "esnext",
      minify: isProduction ? "esbuild" : false,
      sourcemap: isDev,
      cssCodeSplit: true,
      modulePreload: false,
      outDir: "dist",
      assetsDir: "assets",
      chunkSizeWarningLimit: 1000,
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      port: Number(env.VITE_PORT) || 5020,
      strictPort: true,
      host: true,
      cors: true,
    },

    preview: {
      port: Number(env.VITE_PORT) || 5020,
      strictPort: true,
      host: true,
      cors: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // OPTIMIZE DEPS - Pre-bundle para mejor performance
    // ═══════════════════════════════════════════════════════════════
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@mui/material",
        "@emotion/styled",
        "@mui/x-tree-view",
        "@mui/icons-material",
        "react-hook-form",
        "sonner",
      ],
    },
  };
});
```

---

## Template 4: Nuevo Microfrontend (Plantilla Base)

### Archivo: `mf_nuevo/vite.config.ts`

```typescript
import path from "node:path";
import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/**
 * ═══════════════════════════════════════════════════════════════════
 * mf_[NOMBRE] - REMOTE Application (Módulo de [DOMINIO])
 * ═══════════════════════════════════════════════════════════════════
 *
 * [DESCRIPCIÓN DEL MÓDULO]
 *
 * Variables de entorno:
 * - VITE_PORT: Puerto del servidor (default: [PUERTO])
 * - VITE_MF_STORE_URL: URL del remoteEntry.js de mf_store (si consume)
 */

// Configuración del módulo
const MODULE_CONFIG = {
  name: "mf_[nombre]",         // Nombre único del módulo
  defaultPort: 5030,           // Puerto por defecto
  consumesStore: true,         // ¿Consume mf_store?
};

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
        name: MODULE_CONFIG.name,
        filename: "remoteEntry.js",

        // ═══════════════════════════════════════════════════════════
        // EXPOSES - Definir qué expone este módulo
        // ═══════════════════════════════════════════════════════════
        exposes: {
          "./routes": "./src/routes/index.tsx",
          "./components": "./src/components/index.ts",
          // Agregar más exports según necesidad
        },

        // ═══════════════════════════════════════════════════════════
        // REMOTES - Solo si consume otros módulos
        // ═══════════════════════════════════════════════════════════
        ...(MODULE_CONFIG.consumesStore && {
          remotes: {
            mf_store: {
              external: env.VITE_MF_STORE_URL,
              format: "esm",
              externalType: "url",
            },
          },
        }),

        // ═══════════════════════════════════════════════════════════
        // SHARED - Configuración estándar para remotes
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
            requiredVersion: deps["@reduxjs/toolkit"],
            import: false,
          },
          "react-redux": {
            singleton: true,
            requiredVersion: deps["react-redux"],
            import: false,
          },

          // UI Framework - Del Host para consistencia
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

          // Utilidades - Pueden tener versiones propias
          // Agregar según necesidad del módulo
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
      port: Number(env.VITE_PORT) || MODULE_CONFIG.defaultPort,
      strictPort: true,
      host: true,
      cors: true,
    },

    preview: {
      port: Number(env.VITE_PORT) || MODULE_CONFIG.defaultPort,
      strictPort: true,
      host: true,
      cors: true,
    },
  };
});
```

---

## Archivos Complementarios

### `.env.example` para cada módulo

```bash
# mf_shell/.env.example
VITE_PORT=5000
VITE_MF_STORE_URL=http://localhost:5010/remoteEntry.js
VITE_MF_UI_URL=http://localhost:5011/remoteEntry.js
VITE_MF_CONTABILIDAD_URL=http://localhost:5020/remoteEntry.js
```

```bash
# mf_store/.env.example
VITE_PORT=5010
```

```bash
# mf_contabilidad/.env.example
VITE_PORT=5020
VITE_MF_STORE_URL=http://localhost:5010/remoteEntry.js
```

### Type Definitions para Module Federation

```typescript
// src/types/federation.d.ts (en cada MF que consume remotos)

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

declare module "mf_store/api/contabilidad" {
  // Definir types de las APIs
}

declare module "mf_ui/components" {
  export * from "./components";
}

declare module "mf_ui/theme" {
  import type { Theme } from "@mui/material";
  export const theme: Theme;
}
```

---

## Matriz Comparativa de Templates

| Característica | HOST | Remote Puro | Remote Híbrido |
|----------------|------|-------------|----------------|
| `exposes` | ❌ No | ✅ Sí | ✅ Sí |
| `remotes` | ✅ Sí | ❌ No | ✅ Sí |
| `eager: true` | ✅ Para críticas | ❌ No | ❌ No |
| `import: false` | ❌ No (provee) | ✅ Para críticas | ✅ Para críticas |
| `strictVersion` | ✅ Opcional | ❌ No | ❌ No |

---

*Siguiente: [05-TIPOS-COMPARTIDOS-ARQUITECTURA.md](./05-TIPOS-COMPARTIDOS-ARQUITECTURA.md)*
