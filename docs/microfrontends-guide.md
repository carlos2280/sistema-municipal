# Guia Completa de Microfrontends

## Indice

1. [Analisis de Arquitectura Actual](#analisis-de-arquitectura-actual)
2. [Vite Plugin Federation - Referencia Completa](#vite-plugin-federation---referencia-completa)
3. [Desarrollo Aislado de Microfrontends](#desarrollo-aislado-de-microfrontends)
4. [Sistema de Resiliencia y Fallbacks](#sistema-de-resiliencia-y-fallbacks)
5. [Configuracion de Shared Dependencies](#configuracion-de-shared-dependencies)
6. [Recomendaciones y Mejores Practicas](#recomendaciones-y-mejores-practicas)

---

## Analisis de Arquitectura Actual

### Diagrama de Microfrontends

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    mf_shell (Host)                       │    │
│  │                      Puerto 5000                         │    │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐   │    │
│  │  │  mf_ui   │  │mf_contabilidad│  │   mf_store      │   │    │
│  │  │  :5011   │  │    :5020      │  │    :5010        │   │    │
│  │  └──────────┘  └──────────────┘  └──────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Puntos Positivos

| Aspecto | Descripcion |
|---------|-------------|
| Separacion de responsabilidades | Cada MF tiene un rol claro y definido |
| Module Federation configurado | Shared dependencies definidas correctamente |
| Gestion de estado robusta | RTK Query con mutex para refresh token |
| Seguridad basica | Cookies httpOnly, refresh token automatico |
| Tooling moderno | Biome, Husky, Commitlint, Turborepo |

### Problemas Identificados

| Problema | Severidad | Solucion |
|----------|-----------|----------|
| `accessToken` en Redux state | Media | No exponer token en state si usas httpOnly cookies |
| `localStorage.setItem("sistemaId")` duplicado | Baja | Ya se persiste en sessionStorage |
| Falta CSP headers | Alta | Agregar Content-Security-Policy en servidor |
| `mf_contabilidad` consume `mf_store` como remote | Media | Acoplamiento bidireccional - shell debe inyectar store |
| Componentes duplicados (`ControllerTextField`) | Media | Mover a `mf_ui` |
| Shared dependencies inconsistentes | Media | Estandarizar en todos los MFs |
| Carpetas sin plural consistente | Baja | Estandarizar `components/`, `pages/`, `hooks/` |

### Puntuacion General

| Criterio | Puntuacion |
|----------|------------|
| Arquitectura MF | 7/10 |
| Seguridad | 6/10 |
| Convenciones | 7/10 |
| Mantenibilidad | 7/10 |
| Tooling | 9/10 |
| **Total** | **7.2/10** |

---

## Vite Plugin Federation - Referencia Completa

### Instalacion

```bash
pnpm add @originjs/vite-plugin-federation -D
```

### Configuracion Principal

| Propiedad | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| `name` | `string` | Si | Identificador unico del modulo |
| `filename` | `string` | No | Archivo de entrada. Default: `remoteEntry.js` |
| `transformFileTypes` | `string[]` | No | Tipos de archivo a procesar |
| `exposes` | `object` | Remote | Componentes expuestos al exterior |
| `remotes` | `object` | Host | Referencias a modulos remotos |
| `shared` | `object` | No | Dependencias compartidas |

### Configuracion de Exposes (Remote)

```typescript
// Forma simple
exposes: {
  './Button': './src/components/Button.tsx',
  './routes': './src/routes/routes.tsx',
}

// Forma avanzada
exposes: {
  './Component': {
    import: './src/Component.tsx',
    name: 'customChunkName',        // Nombre personalizado del chunk
    dontAppendStylesToHead: true    // Para ShadowDOM
  }
}
```

### Configuracion de Remotes (Host)

```typescript
// Forma simple - URL estatica
remotes: {
  mf_contabilidad: 'http://localhost:5020/assets/remoteEntry.js',
}

// Forma avanzada - con opciones
remotes: {
  mf_contabilidad: {
    external: 'http://localhost:5020/assets/remoteEntry.js',
    externalType: 'url',    // 'url' | 'promise'
    format: 'esm',          // 'esm' | 'systemjs' | 'var'
    from: 'vite'            // 'vite' | 'webpack'
  }
}

// Forma dinamica - promise
remotes: {
  mf_contabilidad: {
    external: `fetch('/api/remotes').then(r => r.json()).then(d => d.url)`,
    externalType: 'promise'
  }
}
```

### Configuracion de Shared Dependencies

```typescript
shared: {
  react: {
    singleton: true,            // Una sola instancia global
    requiredVersion: '^19.0.0', // Version minima requerida
    version: '19.0.0',          // Version a usar
    import: true,               // Incluir en bundle (default: true)
    shareScope: 'default',      // Scope de comparticion
    generate: true,             // Generar chunk separado
    packagePath: '',            // Path personalizado
    eager: false                // Cargar inmediatamente (no lazy)
  }
}
```

### API de Federation Virtual Module

```typescript
import {
  __federation_method_setRemote,
  __federation_method_getRemote,
  __federation_method_unwrapDefault,
  __federation_method_ensure,
  __federation_method_wrapDefault,
} from 'virtual:__federation__';

// Registrar remote en runtime
__federation_method_setRemote('remoteName', {
  url: () => Promise.resolve('http://localhost:5020/assets/remoteEntry.js'),
  format: 'esm',
  from: 'vite',
});

// Obtener modulo expuesto
const module = await __federation_method_getRemote('remoteName', './Component');

// Extraer default export
const Component = __federation_method_unwrapDefault(module);
```

### Limitaciones Importantes

1. **Dev Mode**: Solo el Host soporta dev mode. Los Remotes requieren `vite build`
2. **ESM**: Requiere ES2020+ o `vite-plugin-top-level-await`
3. **CSS**: Puede haber issues con CSS en carga dinamica

---

## Desarrollo Aislado de Microfrontends

### Problema

Actualmente `mf_contabilidad` depende de `mf_store` como remote, lo que obliga a tener el store corriendo para desarrollar.

### Solucion: Modo Standalone

#### Estructura de Archivos

```
apps/microfrontends/mf_contabilidad/
├── src/
│   ├── store/
│   │   └── mockStore.ts           # Store mock para dev standalone
│   ├── providers/
│   │   └── StoreProvider.tsx      # Provider que detecta contexto
│   └── main.standalone.tsx        # Entry point para dev aislado
├── vite.config.ts                 # Config con federation
└── vite.config.standalone.ts      # Config sin remotes
```

#### Archivo: `vite.config.standalone.ts`

```typescript
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Configuracion para desarrollo AISLADO
 * No requiere mf_store ni otros remotes
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Redirigir imports de mf_store al mock local
      "mf_store/store": path.resolve(__dirname, "./src/store/mockStore.ts"),
    },
  },
  server: {
    port: 5020,
    strictPort: true,
    host: true,
  },
});
```

#### Archivo: `src/store/mockStore.ts`

```typescript
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useSelector, useDispatch } from "react-redux";

// Mock de authSlice
const mockAuthSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: true,
    sistemaId: 2,
    areaId: 1,
    accessToken: "mock-token-for-development",
  },
  reducers: {
    tokenReceived: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    loggedOut: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
});

// Mock de menuSlice
const mockMenuSlice = createSlice({
  name: "menu",
  initialState: {
    nombreSistema: "Contabilidad (Dev)",
    menuRaiz: [],
  },
  reducers: {},
});

// Mock de baseApi (RTK Query)
const mockBaseApi = {
  reducerPath: "baseApi",
  reducer: (state = {}) => state,
  middleware: () => (next: any) => (action: any) => next(action),
};

// Crear store mock
export function createStore(preloadedState?: any) {
  const store = configureStore({
    reducer: {
      auth: mockAuthSlice.reducer,
      menu: mockMenuSlice.reducer,
      [mockBaseApi.reducerPath]: mockBaseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(mockBaseApi.middleware),
    preloadedState,
  });

  // Mock persistor
  const persistor = {
    persist: () => {},
    flush: () => Promise.resolve(),
    pause: () => {},
    purge: () => Promise.resolve(),
  };

  return { store, persistor };
}

// Tipos
export type AppStore = ReturnType<typeof createStore>["store"];
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Hooks tipados
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// Mock de queries (RTK Query)
export const useVerficarTokenQuery = () => ({
  isLoading: false,
  isError: false,
  data: { valid: true },
});

export const useGetMenuQuery = () => ({
  isLoading: false,
  isError: false,
  data: [],
});

// Re-exportar actions
export const { tokenReceived, loggedOut } = mockAuthSlice.actions;

// Selectores
export const selectSistemaId = (state: RootState) => state.auth.sistemaId;
export const selectAreaId = (state: RootState) => state.auth.areaId;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

console.log("🔧 Running with MOCK STORE - Development Mode");
```

#### Archivo: `src/main.standalone.tsx`

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import { Toaster } from "sonner";
import App from "./App";
import { createStore } from "./store/mockStore";
import theme from "./theme/theme";
import "./index.css";

const { store } = createStore();

console.log("🚀 mf_contabilidad running in STANDALONE mode");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
```

#### Scripts en `package.json`

```json
{
  "scripts": {
    "dev": "vite --config vite.config.standalone.ts",
    "dev:standalone": "vite --config vite.config.standalone.ts",
    "dev:integrated": "vite build && vite preview",
    "build": "vite build",
    "build:watch": "vite build --watch",
    "preview": "vite preview"
  }
}
```

### Flujo de Desarrollo

```bash
# Desarrollo AISLADO (sin dependencias)
cd apps/microfrontends/mf_contabilidad
pnpm dev

# Desarrollo INTEGRADO (con todos los MFs)
cd MUNICIPALIDAD
pnpm dev:mf
```

---

## Sistema de Resiliencia y Fallbacks

### Arquitectura de 3 Capas

```
┌─────────────────────────────────────────────────────────────┐
│                        mf_shell                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Capa 1: Dynamic Remote Registry            │    │
│  │         (Carga dinamica con retry/fallback)          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Capa 2: Error Boundary por MF              │    │
│  │         (Aisla fallos de cada microfrontend)         │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Capa 3: Fallback UI Components             │    │
│  │         (UI alternativa cuando falla un MF)          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Capa 1: Remote Loader con Retry

#### Archivo: `mf_shell/src/federation/remoteLoader.ts`

```typescript
import {
  __federation_method_setRemote,
  __federation_method_getRemote,
  __federation_method_unwrapDefault,
} from "virtual:__federation__";

interface RemoteConfig {
  url: string;
  format: "esm" | "systemjs" | "var";
  from: "vite" | "webpack";
}

interface RemoteRegistry {
  [key: string]: RemoteConfig;
}

// Registro centralizado de remotes
const remoteRegistry: RemoteRegistry = {
  mf_contabilidad: {
    url: import.meta.env.VITE_MF_CONTABILIDAD_URL,
    format: "esm",
    from: "vite",
  },
  mf_store: {
    url: import.meta.env.VITE_MF_STORE_URL,
    format: "esm",
    from: "vite",
  },
  mf_ui: {
    url: import.meta.env.VITE_MF_UI_URL,
    format: "esm",
    from: "vite",
  },
};

// Cache de estado de remotes
const remoteHealthCache: Map<string, { healthy: boolean; timestamp: number }> = new Map();
const CACHE_TTL = 30000; // 30 segundos

/**
 * Verifica si un remote esta disponible
 */
export async function checkRemoteHealth(remoteName: string): Promise<boolean> {
  const config = remoteRegistry[remoteName];
  if (!config) return false;

  // Verificar cache
  const cached = remoteHealthCache.get(remoteName);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.healthy;
  }

  try {
    const response = await fetch(config.url, {
      method: "HEAD",
      cache: "no-cache",
      signal: AbortSignal.timeout(5000),
    });
    const healthy = response.ok;
    remoteHealthCache.set(remoteName, { healthy, timestamp: Date.now() });
    return healthy;
  } catch {
    remoteHealthCache.set(remoteName, { healthy: false, timestamp: Date.now() });
    return false;
  }
}

/**
 * Carga un modulo remoto con reintentos
 */
export async function loadRemoteWithRetry<T>(
  remoteName: string,
  exposedModule: string,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T | null> {
  const { maxRetries = 3, retryDelay = 1000, onRetry } = options;
  const config = remoteRegistry[remoteName];

  if (!config) {
    console.error(`[Federation] Remote "${remoteName}" not found in registry`);
    return null;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Verificar disponibilidad
      const isHealthy = await checkRemoteHealth(remoteName);
      if (!isHealthy) {
        throw new Error(`Remote "${remoteName}" is not available`);
      }

      // Registrar remote dinamicamente
      __federation_method_setRemote(remoteName, {
        url: () => Promise.resolve(config.url),
        format: config.format,
        from: config.from,
      });

      // Cargar modulo
      const module = await __federation_method_getRemote(remoteName, exposedModule);
      return __federation_method_unwrapDefault(module) as T;
    } catch (error) {
      const err = error as Error;
      console.warn(
        `[Federation] Attempt ${attempt}/${maxRetries} failed for ${remoteName}:`,
        err.message
      );

      onRetry?.(attempt, err);

      if (attempt < maxRetries) {
        // Delay exponencial
        await new Promise((r) => setTimeout(r, retryDelay * attempt));
      }
    }
  }

  console.error(`[Federation] Failed to load "${remoteName}" after ${maxRetries} attempts`);
  return null;
}

/**
 * Obtiene el estado de todos los remotes
 */
export async function getRemotesStatus(): Promise<Record<string, boolean>> {
  const status: Record<string, boolean> = {};

  await Promise.all(
    Object.keys(remoteRegistry).map(async (name) => {
      status[name] = await checkRemoteHealth(name);
    })
  );

  return status;
}

/**
 * Invalida el cache de un remote
 */
export function invalidateRemoteCache(remoteName?: string): void {
  if (remoteName) {
    remoteHealthCache.delete(remoteName);
  } else {
    remoteHealthCache.clear();
  }
}
```

### Capa 2: Error Boundary para Microfrontends

#### Archivo: `mf_shell/src/components/MicrofrontendErrorBoundary.tsx`

```typescript
import { Component, type ReactNode } from "react";
import { Box, Button, Typography, Paper, Alert } from "@mui/material";
import { RefreshCw, AlertTriangle, WifiOff } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  remoteName: string;
  onRetry?: () => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class MicrofrontendErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log para debugging
    console.error(`[MF Error] ${this.props.remoteName}:`, error);
    console.error("Component Stack:", errorInfo.componentStack);

    // Aqui podrias enviar a un servicio de monitoreo
    // sendToErrorTracking({ remoteName: this.props.remoteName, error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      // Si hay fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de error por defecto
      return (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            m: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            backgroundColor: "background.default",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "warning.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={40} color="#ed6c02" />
          </Box>

          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Modulo temporalmente no disponible
          </Typography>

          <Typography
            color="text.secondary"
            textAlign="center"
            maxWidth={400}
          >
            El modulo <strong>{this.props.remoteName}</strong> esta en
            mantenimiento o experimentando problemas tecnicos. Los demas
            modulos del sistema siguen funcionando normalmente.
          </Typography>

          {this.props.showDetails && this.state.error && (
            <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
              <Typography variant="body2" fontFamily="monospace">
                {this.state.error.message}
              </Typography>
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={16} />}
              onClick={this.handleRetry}
            >
              Reintentar
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Recargar pagina
            </Button>
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default MicrofrontendErrorBoundary;
```

### Capa 3: Lazy Loading con Fallback

#### Archivo: `mf_shell/src/components/LazyMicrofrontend.tsx`

```typescript
import { lazy, Suspense, useState, useCallback } from "react";
import { Box, CircularProgress, Typography, Skeleton } from "@mui/material";
import { MicrofrontendErrorBoundary } from "./MicrofrontendErrorBoundary";
import { loadRemoteWithRetry } from "../federation/remoteLoader";

// Componente de carga
function LoadingFallback({ moduleName }: { moduleName: string }) {
  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography color="text.secondary">
        Cargando {moduleName}...
      </Typography>
    </Box>
  );
}

// Componente de mantenimiento
function MaintenanceFallback({ moduleName }: { moduleName: string }) {
  return (
    <Box
      sx={{
        p: 4,
        textAlign: "center",
        backgroundColor: "info.light",
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Modulo en Mantenimiento
      </Typography>
      <Typography color="text.secondary">
        El modulo {moduleName} esta siendo actualizado.
        Por favor, intente mas tarde.
      </Typography>
    </Box>
  );
}

interface LazyMicrofrontendProps {
  remoteName: string;
  exposedModule: string;
  fallbackComponent?: React.ComponentType;
  loadingComponent?: React.ComponentType;
  componentProps?: Record<string, unknown>;
}

/**
 * Factory para crear componentes lazy con fallback automatico
 */
export function createLazyMicrofrontend(
  remoteName: string,
  exposedModule: string,
  fallbackComponent?: React.ComponentType
) {
  const LazyComponent = lazy(async () => {
    const module = await loadRemoteWithRetry(remoteName, exposedModule);

    if (!module) {
      // Retornar fallback si el remote no esta disponible
      const Fallback = fallbackComponent || (() => (
        <MaintenanceFallback moduleName={remoteName} />
      ));
      return { default: Fallback };
    }

    return { default: module as React.ComponentType };
  });

  // Wrapper con Error Boundary
  return function WrappedMicrofrontend(props: Record<string, unknown>) {
    const [retryKey, setRetryKey] = useState(0);

    const handleRetry = useCallback(() => {
      setRetryKey((k) => k + 1);
    }, []);

    return (
      <MicrofrontendErrorBoundary
        key={retryKey}
        remoteName={remoteName}
        onRetry={handleRetry}
      >
        <Suspense fallback={<LoadingFallback moduleName={remoteName} />}>
          <LazyComponent {...props} />
        </Suspense>
      </MicrofrontendErrorBoundary>
    );
  };
}

/**
 * Componente declarativo para cargar microfrontends
 */
export function LazyMicrofrontend({
  remoteName,
  exposedModule,
  fallbackComponent,
  loadingComponent,
  componentProps = {},
}: LazyMicrofrontendProps) {
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  const LazyComponent = lazy(async () => {
    const module = await loadRemoteWithRetry(remoteName, exposedModule);

    if (!module) {
      const Fallback = fallbackComponent || (() => (
        <MaintenanceFallback moduleName={remoteName} />
      ));
      return { default: Fallback };
    }

    return { default: module as React.ComponentType };
  });

  const Loading = loadingComponent || (() => (
    <LoadingFallback moduleName={remoteName} />
  ));

  return (
    <MicrofrontendErrorBoundary
      key={retryKey}
      remoteName={remoteName}
      onRetry={handleRetry}
    >
      <Suspense fallback={<Loading />}>
        <LazyComponent {...componentProps} />
      </Suspense>
    </MicrofrontendErrorBoundary>
  );
}

export default LazyMicrofrontend;
```

### Actualizacion del Registry de Microfrontends

#### Archivo: `mf_shell/src/routes/microfrontRegistry.ts`

```typescript
import { loadRemoteWithRetry } from "../federation/remoteLoader";

interface MicrofrontRoutes {
  sistemaId: number;
  components: Record<string, React.ReactNode>;
}

// Fallback components para cuando un MF no esta disponible
const MaintenancePlaceholder = () => (
  <div style={{ padding: 20, textAlign: "center" }}>
    <h3>Modulo en Mantenimiento</h3>
    <p>Este modulo estara disponible pronto.</p>
  </div>
);

/**
 * Carga los componentes de un microfrontend con fallback
 */
export async function loadMicrofrontComponents(
  sistemaId: number
): Promise<MicrofrontRoutes> {
  switch (sistemaId) {
    case 1:
    case 2: {
      try {
        // Intentar cargar mf_contabilidad
        const contabilidad = await import("mf_contabilidad/routes");
        return contabilidad.default;
      } catch (error) {
        console.warn(
          "[MicrofrontRegistry] mf_contabilidad not available, using fallback",
          error
        );

        // Retornar fallbacks para todas las rutas
        return {
          sistemaId,
          components: {
            plan_de_cuentas: <MaintenancePlaceholder />,
            presupuesto_inicial: <MaintenancePlaceholder />,
            presupuesto_actualizaciones: <MaintenancePlaceholder />,
            presupuesto_informes: <MaintenancePlaceholder />,
            presupuesto_ejecucion_presuestaria: <MaintenancePlaceholder />,
            contabilidad_ingreso_movimientos: <MaintenancePlaceholder />,
            contabilidad_analisis_por_rut: <MaintenancePlaceholder />,
            contabilidad_saldos_iniciales: <MaintenancePlaceholder />,
            contabilidad_informes: <MaintenancePlaceholder />,
            decreto_pago_ingreso_directo: <MaintenancePlaceholder />,
            decreto_pago_informes: <MaintenancePlaceholder />,
            documento_garantia_ingreso_documentos: <MaintenancePlaceholder />,
            documento_garantia_informes: <MaintenancePlaceholder />,
            parametros_mantenedor: <MaintenancePlaceholder />,
          },
        };
      }
    }

    default:
      return {
        sistemaId,
        components: {},
      };
  }
}

/**
 * Carga un componente especifico con retry
 */
export async function loadMicrofrontComponent<T>(
  remoteName: string,
  componentName: string
): Promise<T | null> {
  return loadRemoteWithRetry<T>(remoteName, `./${componentName}`, {
    maxRetries: 3,
    retryDelay: 1000,
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt} for ${remoteName}/${componentName}:`, error.message);
    },
  });
}
```

### Diagrama de Flujo de Resiliencia

```
Usuario accede a /contabilidad/plan-de-cuentas
                    │
                    ▼
┌─────────────────────────────────────────┐
│           mf_shell (Host)               │
│  1. Verifica health del remote          │
│  2. Intenta cargar mf_contabilidad      │
│     └─ Retry x3 con delay exponencial   │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   ✅ Disponible           ❌ No disponible
        │                       │
        ▼                       ▼
┌───────────────┐       ┌───────────────────┐
│   Suspense    │       │   loadRemote      │
│   Loading...  │       │   retorna null    │
└───────────────┘       └───────────────────┘
        │                       │
        ▼                       ▼
┌───────────────┐       ┌───────────────────┐
│   Renderiza   │       │ MaintenanceFallback│
│   componente  │       │   se renderiza    │
└───────────────┘       └───────────────────┘
        │                       │
        ▼                       ▼
   App funciona           "Modulo en mantenimiento"
   normalmente            (resto de la app OK)
```

---

## Configuracion de Shared Dependencies

### Configuracion Recomendada para mf_shell (Host)

```typescript
// mf_shell/vite.config.ts
federation({
  name: "mf_shell",
  remotes: {
    mf_store: env.VITE_MF_STORE_URL,
    mf_ui: env.VITE_MF_UI_URL,
    mf_contabilidad: env.VITE_MF_CONTABILIDAD_URL,
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: "^19.0.0",
    },
    "react-dom": {
      singleton: true,
      requiredVersion: "^19.0.0",
    },
    "@mui/material": {
      singleton: true,
      requiredVersion: "^6.0.0",
    },
    "@emotion/react": {
      singleton: true,
    },
    "@emotion/styled": {
      singleton: true,
    },
    "react-redux": {
      singleton: true,
      requiredVersion: "^9.0.0",
    },
    "@reduxjs/toolkit": {
      singleton: true,
      requiredVersion: "^2.0.0",
    },
    "react-router-dom": {
      singleton: true,
      requiredVersion: "^7.0.0",
    },
  },
}),
```

### Configuracion para Remotes (mf_store, mf_ui, mf_contabilidad)

```typescript
// mf_store/vite.config.ts
federation({
  name: "mf_store",
  filename: "remoteEntry.js",
  exposes: {
    "./store": "./src/store/index.ts",
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: "^19.0.0",
    },
    "react-dom": {
      singleton: true,
      requiredVersion: "^19.0.0",
    },
    "react-redux": {
      singleton: true,
      requiredVersion: "^9.0.0",
    },
    "@reduxjs/toolkit": {
      singleton: true,
      requiredVersion: "^2.0.0",
    },
  },
}),
```

### Matriz de Shared Dependencies

| Dependencia | mf_shell | mf_store | mf_ui | mf_contabilidad |
|-------------|----------|----------|-------|-----------------|
| react | singleton | singleton | singleton | singleton |
| react-dom | singleton | singleton | singleton | singleton |
| @mui/material | singleton | - | singleton | singleton |
| @emotion/react | singleton | - | singleton | singleton |
| @emotion/styled | singleton | - | singleton | singleton |
| react-redux | singleton | singleton | - | singleton |
| @reduxjs/toolkit | singleton | singleton | - | singleton |
| react-router-dom | singleton | - | - | - |
| react-hook-form | - | - | - | singleton |
| sonner | singleton | - | - | singleton |

---

## Recomendaciones y Mejores Practicas

### 1. Convenciones de Nombres

| Elemento | Convencion | Ejemplo |
|----------|------------|---------|
| Microfrontend | `mf_[nombre]` | `mf_contabilidad` |
| Carpeta componentes | `components/` (plural) | `src/components/` |
| Carpeta paginas | `pages/` (plural) | `src/pages/` |
| Carpeta hooks | `hooks/` (plural) | `src/hooks/` |
| Hooks sin JSX | `.ts` | `useLogin.ts` |
| Componentes | `.tsx` | `Button.tsx` |

### 2. Estructura de Carpetas Estandar

```
mf_[nombre]/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── ui/           # Componentes UI basicos
│   │   └── form/         # Componentes de formulario
│   ├── pages/            # Paginas/Vistas
│   ├── hooks/            # Custom hooks
│   ├── services/         # Llamadas API
│   ├── store/            # Estado local (si aplica)
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Utilidades
│   ├── routes/           # Configuracion de rutas
│   └── App.tsx
├── public/
├── vite.config.ts
├── vite.config.standalone.ts  # Para dev aislado
├── tsconfig.json
└── package.json
```

### 3. Checklist de Seguridad

- [ ] No exponer tokens en Redux state si usas httpOnly cookies
- [ ] Implementar CSP headers en el servidor
- [ ] Validar inputs en frontend Y backend
- [ ] Sanitizar datos antes de renderizar (XSS)
- [ ] Usar HTTPS en produccion
- [ ] Configurar CORS correctamente
- [ ] Rotar refresh tokens periodicamente

### 4. Checklist de Deployment

- [ ] Verificar que todos los remotes estan disponibles
- [ ] Testear fallbacks funcionan correctamente
- [ ] Verificar shared dependencies son compatibles
- [ ] Revisar que no hay memory leaks
- [ ] Configurar health checks en cada MF
- [ ] Implementar blue-green deployment si es posible

### 5. Comandos de Desarrollo

```bash
# Desarrollo completo (todo integrado)
pnpm dev:all

# Solo microfrontends
pnpm dev:mf

# Desarrollo aislado de un MF
cd apps/microfrontends/mf_contabilidad
pnpm dev  # Usa mock store

# Build de remotes + preview
pnpm build:remotes && pnpm preview:remotes

# Verificar tipos
pnpm typecheck

# Lint y format
pnpm check
```

---

## Referencias

- [vite-plugin-federation GitHub](https://github.com/originjs/vite-plugin-federation)
- [Module Federation Docs](https://module-federation.io/)
- [Error Handling in Module Federation](https://module-federation.io/blog/error-load-remote)
- [Dynamic Remotes Discussion](https://github.com/originjs/vite-plugin-federation/discussions/193)
