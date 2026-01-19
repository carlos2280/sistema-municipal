# Manejo de Errores y Resiliencia en Module Federation

## El Problema

Por defecto, si UN microfrontend falla en cargar, TODA la aplicación crashea:

```
┌─────────────────────────────────────────────────────────────┐
│                      HOST (mf_shell)                        │
│                                                             │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│   │ mf_store │   │  mf_ui   │   │mf_contab.│              │
│   │    ✅    │   │    ✅    │   │    ❌    │ ← Servidor   │
│   └──────────┘   └──────────┘   └──────────┘    caído     │
│                                                             │
│                    ❌ TODA LA APP CRASHEA                   │
└─────────────────────────────────────────────────────────────┘
```

**Objetivo:** Que la aplicación siga funcionando aunque algunos módulos no estén disponibles.

---

## Estrategia de 3 Niveles

```
┌─────────────────────────────────────────────────────────────┐
│                  NIVEL 1: RED                               │
│              Retry Plugin / Health Checks                   │
│   "¿El servidor está disponible? Si no, reintentar"        │
├─────────────────────────────────────────────────────────────┤
│                  NIVEL 2: CARGA                             │
│            Error Load Remote Hook                           │
│   "Si el módulo falla en cargar, usar fallback"            │
├─────────────────────────────────────────────────────────────┤
│                  NIVEL 3: RENDERIZADO                       │
│               React Error Boundary                          │
│   "Si el componente crashea, mostrar UI de error"          │
└─────────────────────────────────────────────────────────────┘
```

---

## Nivel 1: Verificación de Salud (Health Check)

### Implementación

```typescript
// src/utils/remoteHealthCheck.ts

interface RemoteHealth {
  name: string;
  url: string;
  available: boolean;
  latency?: number;
  error?: string;
}

interface RemoteConfig {
  [key: string]: string;
}

/**
 * Verifica la disponibilidad de todos los remotos
 */
export async function checkRemotesHealth(
  remotes: RemoteConfig,
  timeout: number = 5000
): Promise<RemoteHealth[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const checks = Object.entries(remotes).map(async ([name, url]) => {
    const start = performance.now();

    try {
      const response = await fetch(url, {
        method: "HEAD",
        cache: "no-cache",
        signal: controller.signal,
      });

      return {
        name,
        url,
        available: response.ok,
        latency: Math.round(performance.now() - start),
      };
    } catch (error) {
      return {
        name,
        url,
        available: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  const results = await Promise.all(checks);
  clearTimeout(timeoutId);

  return results;
}

/**
 * Log del estado de remotos al iniciar
 */
export function logRemotesStatus(results: RemoteHealth[]): void {
  console.group("🔍 Module Federation - Remote Status");

  results.forEach((remote) => {
    if (remote.available) {
      console.log(
        `✅ ${remote.name}: OK (${remote.latency}ms)`,
        remote.url
      );
    } else {
      console.warn(
        `❌ ${remote.name}: UNAVAILABLE`,
        remote.url,
        remote.error
      );
    }
  });

  console.groupEnd();
}
```

### Uso en la Aplicación

```typescript
// src/main.tsx
import { checkRemotesHealth, logRemotesStatus } from "./utils/remoteHealthCheck";

const REMOTE_URLS = {
  mf_store: import.meta.env.VITE_MF_STORE_URL,
  mf_ui: import.meta.env.VITE_MF_UI_URL,
  mf_contabilidad: import.meta.env.VITE_MF_CONTABILIDAD_URL,
};

// Verificar al iniciar
checkRemotesHealth(REMOTE_URLS).then((results) => {
  logRemotesStatus(results);

  // Almacenar estado para uso posterior
  window.__REMOTE_STATUS__ = results.reduce(
    (acc, r) => ({ ...acc, [r.name]: r.available }),
    {}
  );
});
```

---

## Nivel 2: Carga Segura de Módulos

### Wrapper para Import Dinámico

```typescript
// src/utils/loadRemoteModule.ts

interface LoadOptions {
  /** Nombre del módulo para logs */
  moduleName: string;
  /** Componente a mostrar si falla la carga */
  fallbackComponent?: React.ComponentType;
  /** Número de reintentos */
  retries?: number;
  /** Delay entre reintentos (ms) */
  retryDelay?: number;
}

/**
 * Carga un módulo remoto con manejo de errores y reintentos
 */
export async function loadRemoteModule<T>(
  importFn: () => Promise<T>,
  options: LoadOptions
): Promise<T> {
  const { moduleName, retries = 3, retryDelay = 1000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[MF] Loading ${moduleName} (attempt ${attempt}/${retries})`);
      const module = await importFn();
      console.log(`[MF] ✅ ${moduleName} loaded successfully`);
      return module;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `[MF] ⚠️ ${moduleName} failed (attempt ${attempt}/${retries}):`,
        lastError.message
      );

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  console.error(`[MF] ❌ ${moduleName} failed after ${retries} attempts`);
  throw lastError;
}
```

### Factory de Componentes Lazy con Fallback

```typescript
// src/utils/createRemoteComponent.tsx
import React, { lazy, Suspense, type ComponentType } from "react";
import { loadRemoteModule } from "./loadRemoteModule";

interface CreateRemoteOptions {
  /** Nombre para identificar el módulo */
  moduleName: string;
  /** Componente de loading */
  loadingComponent?: React.ReactNode;
  /** Componente de error/fallback */
  errorComponent?: React.ReactNode;
  /** Número de reintentos */
  retries?: number;
}

const DefaultLoading = () => (
  <div style={{ padding: "20px", textAlign: "center" }}>
    <div>Cargando módulo...</div>
  </div>
);

const DefaultError = ({ moduleName }: { moduleName: string }) => (
  <div style={{
    padding: "20px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "4px",
    margin: "10px"
  }}>
    <strong>⚠️ Módulo no disponible</strong>
    <p>El módulo "{moduleName}" no pudo cargarse. La aplicación continúa funcionando.</p>
  </div>
);

/**
 * Crea un componente lazy que carga un módulo remoto con fallback
 */
export function createRemoteComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: CreateRemoteOptions
): ComponentType<P> {
  const {
    moduleName,
    loadingComponent = <DefaultLoading />,
    errorComponent = <DefaultError moduleName={moduleName} />,
    retries = 3,
  } = options;

  const LazyComponent = lazy(() =>
    loadRemoteModule(importFn, { moduleName, retries }).catch(() => ({
      default: () => errorComponent as React.ReactElement,
    }))
  );

  return function RemoteComponentWrapper(props: P) {
    return (
      <Suspense fallback={loadingComponent}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
```

### Uso

```typescript
// src/routes/remoteRoutes.tsx
import { createRemoteComponent } from "../utils/createRemoteComponent";

// Componentes remotos con fallback automático
export const ContabilidadRoutes = createRemoteComponent(
  () => import("mf_contabilidad/routes"),
  {
    moduleName: "Contabilidad",
    loadingComponent: <div>Cargando módulo de contabilidad...</div>,
  }
);

export const TesoreriaRoutes = createRemoteComponent(
  () => import("mf_tesoreria/routes"),
  { moduleName: "Tesorería" }
);

// En el router
const routes = [
  { path: "/contabilidad/*", element: <ContabilidadRoutes /> },
  { path: "/tesoreria/*", element: <TesoreriaRoutes /> },
];
```

---

## Nivel 3: Error Boundary para Renderizado

### Componente Error Boundary

```typescript
// src/components/MicroFrontendErrorBoundary.tsx
import React, { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  /** Nombre del módulo para identificación */
  moduleName: string;
  /** UI personalizada para mostrar en error */
  fallback?: ReactNode;
  /** Callback cuando ocurre un error */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Mostrar botón de reintentar */
  showRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class MicroFrontendErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log detallado
    console.group(`🔴 Error en MicroFrontend: ${this.props.moduleName}`);
    console.error("Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);
    console.groupEnd();

    // Callback opcional (para telemetría)
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: "24px",
          margin: "16px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
        }}>
          <h3 style={{ color: "#dc2626", marginTop: 0 }}>
            ⚠️ Error en módulo: {this.props.moduleName}
          </h3>

          <p style={{ color: "#7f1d1d" }}>
            Ha ocurrido un error al renderizar este módulo.
            El resto de la aplicación sigue funcionando normalmente.
          </p>

          {this.props.showRetry !== false && (
            <button
              onClick={this.handleRetry}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          )}

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details style={{ marginTop: "16px" }}>
              <summary style={{ cursor: "pointer", color: "#7f1d1d" }}>
                Detalles del error (solo desarrollo)
              </summary>
              <pre style={{
                fontSize: "12px",
                overflow: "auto",
                backgroundColor: "#1f2937",
                color: "#f3f4f6",
                padding: "12px",
                borderRadius: "4px",
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Uso con Error Boundary

```typescript
// src/App.tsx
import { MicroFrontendErrorBoundary } from "./components/MicroFrontendErrorBoundary";
import { ContabilidadRoutes, TesoreriaRoutes } from "./routes/remoteRoutes";

function App() {
  return (
    <div>
      <header>Sistema Municipal</header>

      <main>
        <Routes>
          {/* Cada módulo con su propio Error Boundary */}
          <Route
            path="/contabilidad/*"
            element={
              <MicroFrontendErrorBoundary moduleName="Contabilidad">
                <ContabilidadRoutes />
              </MicroFrontendErrorBoundary>
            }
          />

          <Route
            path="/tesoreria/*"
            element={
              <MicroFrontendErrorBoundary moduleName="Tesorería">
                <TesoreriaRoutes />
              </MicroFrontendErrorBoundary>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
```

---

## Implementación Completa: Hook useRemoteModule

```typescript
// src/hooks/useRemoteModule.ts
import { useState, useEffect, useCallback, type ComponentType } from "react";

type ModuleStatus = "idle" | "loading" | "success" | "error";

interface UseRemoteModuleResult<T> {
  module: T | null;
  status: ModuleStatus;
  error: Error | null;
  retry: () => void;
}

interface UseRemoteModuleOptions {
  /** Cargar automáticamente al montar */
  autoLoad?: boolean;
  /** Número de reintentos */
  retries?: number;
  /** Delay entre reintentos (ms) */
  retryDelay?: number;
}

/**
 * Hook para cargar módulos remotos con estado y reintentos
 */
export function useRemoteModule<T>(
  importFn: () => Promise<T>,
  options: UseRemoteModuleOptions = {}
): UseRemoteModuleResult<T> {
  const { autoLoad = true, retries = 3, retryDelay = 1000 } = options;

  const [module, setModule] = useState<T | null>(null);
  const [status, setStatus] = useState<ModuleStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await importFn();
        setModule(result);
        setStatus("success");
        return;
      } catch (err) {
        if (attempt === retries) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setStatus("error");
        } else {
          await new Promise((r) => setTimeout(r, retryDelay));
        }
      }
    }
  }, [importFn, retries, retryDelay]);

  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad, load]);

  return {
    module,
    status,
    error,
    retry: load,
  };
}

// Uso:
function ContabilidadPage() {
  const { module: Routes, status, error, retry } = useRemoteModule(
    () => import("mf_contabilidad/routes")
  );

  if (status === "loading") return <div>Cargando...</div>;
  if (status === "error") return (
    <div>
      Error: {error?.message}
      <button onClick={retry}>Reintentar</button>
    </div>
  );
  if (!Routes) return null;

  return <Routes.default />;
}
```

---

## Integración con Telemetría

```typescript
// src/utils/errorReporting.ts

interface MFErrorReport {
  moduleName: string;
  errorType: "load" | "render";
  error: Error;
  timestamp: string;
  userAgent: string;
  url: string;
}

/**
 * Reportar errores de MF a sistema de telemetría
 */
export function reportMFError(
  moduleName: string,
  errorType: "load" | "render",
  error: Error
): void {
  const report: MFErrorReport = {
    moduleName,
    errorType,
    error,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Enviar a tu sistema de telemetría
  console.error("[MF Error Report]", report);

  // Ejemplo: enviar a endpoint
  // fetch("/api/telemetry/mf-error", {
  //   method: "POST",
  //   body: JSON.stringify(report),
  // });
}
```

---

## Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INICIO: Cargar Módulo Remoto                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ NIVEL 1: Health Check                                               │
│ ¿El remoteEntry.js está disponible?                                │
├───────────────────────────┬─────────────────────────────────────────┤
│            SÍ             │                NO                        │
│            │              │                │                         │
│            ▼              │                ▼                         │
│    Continuar carga        │    ┌────────────────────┐               │
│                           │    │ Marcar como        │               │
│                           │    │ no disponible      │               │
│                           │    │ Log warning        │               │
│                           │    └────────────────────┘               │
└───────────────────────────┴─────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ NIVEL 2: Carga del Módulo                                           │
│ import("mf_contabilidad/routes")                                    │
├───────────────────────────┬─────────────────────────────────────────┤
│          ÉXITO            │               ERROR                      │
│            │              │                │                         │
│            ▼              │                ▼                         │
│   Componente cargado      │    ┌────────────────────┐               │
│                           │    │ Reintentar?        │               │
│                           │    │ (hasta 3 veces)    │               │
│                           │    ├────────────────────┤               │
│                           │    │ Aún falla →        │               │
│                           │    │ Usar fallback      │               │
│                           │    └────────────────────┘               │
└───────────────────────────┴─────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ NIVEL 3: Renderizado                                                │
│ <ComponenteRemoto />                                                │
├───────────────────────────┬─────────────────────────────────────────┤
│          ÉXITO            │           ERROR EN RENDER                │
│            │              │                │                         │
│            ▼              │                ▼                         │
│   ✅ Módulo visible       │    ┌────────────────────┐               │
│      y funcional          │    │ Error Boundary     │               │
│                           │    │ captura el error   │               │
│                           │    │ Muestra UI de      │               │
│                           │    │ fallback           │               │
│                           │    │ App sigue          │               │
│                           │    │ funcionando ✅     │               │
│                           │    └────────────────────┘               │
└───────────────────────────┴─────────────────────────────────────────┘
```

---

## Checklist de Implementación

### Mínimo Viable

- [ ] Error Boundary por cada módulo remoto
- [ ] Fallback UI cuando módulo no carga
- [ ] Logs de errores en consola

### Recomendado

- [ ] Health check al iniciar aplicación
- [ ] Reintentos automáticos (3x con delay)
- [ ] Hook `useRemoteModule` para control granular
- [ ] Loading states por módulo

### Avanzado

- [ ] Telemetría de errores
- [ ] Circuit breaker pattern
- [ ] Caché de módulos cargados
- [ ] Precarga de módulos críticos

---

## Referencias

- [Module Federation Error Handling](https://module-federation.io/blog/error-load-remote)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [GitHub Issue: Graceful Degradation](https://github.com/module-federation/vite/issues/96)

---

*Siguiente: [04-VITE-CONFIG-TEMPLATES.md](./04-VITE-CONFIG-TEMPLATES.md)*
