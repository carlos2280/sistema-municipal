# Guía de Microfrontends - Sistema Municipal

> Documentación técnica para el desarrollo y mantenimiento de microfrontends con Module Federation.

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    mf_shell (HOST)                       │   │
│  │  Puerto: 5000 | Rol: Contenedor Principal               │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │              React Router + Layout               │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │           │              │              │                │   │
│  │           ▼              ▼              ▼                │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │   │
│  │  │   mf_store   │ │    mf_ui     │ │mf_contabilidad│    │   │
│  │  │  (Remote)    │ │  (Remote)    │ │   (Remote)   │     │   │
│  │  │  Puerto:5010 │ │  Puerto:5011 │ │  Puerto:5020 │     │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuración de Cada Microfrontend

### mf_shell (Host Application)

**Responsabilidades:**
- Orquestar la carga de microfrontends remotos
- Proveer el layout principal (sidebar, header, navigation)
- Manejar el routing global
- Inicializar el store de Redux

**Configuración vite.config.ts:**
```typescript
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      federation({
        name: "mf_shell",
        remotes: {
          mf_store: env.VITE_MF_STORE_URL,
          mf_ui: env.VITE_MF_UI_URL,
          mf_contabilidad: env.VITE_MF_CONTABILIDAD_URL,
        },
        shared: {
          react: { singleton: true, requiredVersion: "^19.1.0" },
          "react-dom": { singleton: true, requiredVersion: "^19.1.0" },
          "@mui/material": { singleton: true, requiredVersion: "^7.1.0" },
          "@emotion/react": { singleton: true },
          "@emotion/styled": { singleton: true },
          "react-redux": { singleton: true, requiredVersion: "^9.2.0" },
          "@reduxjs/toolkit": { singleton: true, requiredVersion: "^2.8.0" },
        },
      }),
    ],
  };
});
```

**Variables de Entorno Requeridas:**
```env
VITE_PORT=5000
VITE_API_URL=http://localhost:3000
VITE_MF_STORE_URL=http://localhost:5010/assets/remoteEntry.js
VITE_MF_UI_URL=http://localhost:5011/assets/remoteEntry.js
VITE_MF_CONTABILIDAD_URL=http://localhost:5020/assets/remoteEntry.js
```

---

### mf_store (Estado Global)

**Responsabilidades:**
- Exponer el store de Redux para todos los microfrontends
- Manejar autenticación y autorización
- Gestionar APIs con RTK Query
- Persistir estado en sessionStorage

**Exports Disponibles:**
```typescript
// ./store - Export principal
export * from "./api/baseApi";
export * from "./api/contabilidadApi";
export * from "./api/menuApi";
export * from "./api/authApi";
export * from "./store";
export * from "./hooks";
export * from "./features/authSlice";
export * from "./features/menuSlice";
```

**Uso desde otros MF:**
```typescript
// En mf_shell o mf_contabilidad
import { useAppDispatch, useAppSelector, RootState } from "mf_store/store";
import { useLoginMutation } from "mf_store/store";
```

**Configuración RTK Query:**
```typescript
// baseApi.ts
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,  // Con refresh automático
  endpoints: () => ({}),
  tagTypes: ["autorizacion", "User", "PlanCuentas"],
});

// Extender en cada API
export const contabilidadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlanCuentas: builder.query({
      query: () => "/contabilidad/plan-cuentas",
      providesTags: ["PlanCuentas"],
    }),
  }),
});
```

---

### mf_ui (Componentes Compartidos)

**Responsabilidades:**
- Exponer componentes UI reutilizables
- Proveer el tema de Material-UI
- Mantener consistencia visual

**Exports Disponibles:**
```typescript
// ./theme
export { theme, ThemeProvider };

// ./components
export { Button, Card, Input, Modal, ... };
```

**Uso:**
```typescript
import { ThemeProvider, theme } from "mf_ui/theme";
import { Button, Card } from "mf_ui/components";
```

---

### mf_contabilidad (Módulo de Dominio)

**Responsabilidades:**
- Implementar funcionalidad del módulo de contabilidad
- Exponer rutas y componentes del módulo
- Consumir mf_store para estado global

**Exports Disponibles:**
```typescript
// ./routes - Rutas del módulo
export { contabilidadRoutes };

// ./components - Páginas principales
export {
  PlanDeCuentas,
  ContabilidadIngresoMovimientos,
  Presupuesto,
  // ...
};
```

**Particularidad - Híbrido (Consume y Expone):**
```typescript
federation({
  name: "mf_contabilidad",
  filename: "remoteEntry.js",
  exposes: {
    "./routes": "./src/routes/routes.tsx",
    "./components": "./src/page/index.ts",
  },
  remotes: {
    mf_store: env.VITE_MF_STORE_URL,  // Consume store
  },
  shared: { /* ... */ },
})
```

---

## Dependencias Compartidas (Shared)

### Configuración Obligatoria

```typescript
// TODAS las dependencias críticas deben ser singleton
shared: {
  // React Core - SIEMPRE singleton
  react: {
    singleton: true,
    requiredVersion: "^19.1.0",
  },
  "react-dom": {
    singleton: true,
    requiredVersion: "^19.1.0",
  },

  // Material-UI - singleton para consistencia de tema
  "@mui/material": {
    singleton: true,
    requiredVersion: "^7.1.0",
  },
  "@emotion/react": {
    singleton: true,
  },
  "@emotion/styled": {
    singleton: true,
  },

  // Redux - SIEMPRE singleton para estado único
  "react-redux": {
    singleton: true,
    requiredVersion: "^9.2.0",
  },
  "@reduxjs/toolkit": {
    singleton: true,
    requiredVersion: "^2.8.0",
  },

  // Router - singleton si se comparte navegación
  "react-router-dom": {
    singleton: true,
    requiredVersion: "^7.6.0",
  },
}
```

### Matriz de Dependencias por MF

| Dependencia | mf_shell | mf_store | mf_ui | mf_contabilidad |
|-------------|:--------:|:--------:|:-----:|:---------------:|
| react | ✅ | ✅ | ✅ | ✅ |
| react-dom | ✅ | ✅ | ✅ | ✅ |
| @mui/material | ✅ | ❌ | ✅ | ✅ |
| @emotion/react | ✅ | ❌ | ✅ | ✅ |
| react-redux | ✅ | ✅ | ❌ | ✅ |
| @reduxjs/toolkit | ✅ | ✅ | ❌ | ✅ |
| react-router-dom | ✅ | ❌ | ❌ | ✅ |
| react-hook-form | ✅ | ❌ | ❌ | ✅ |
| zod | ✅ | ❌ | ❌ | ✅ |

---

## Orden de Carga

El orden de inicialización es crítico para evitar errores:

```
1. mf_store    → Se carga primero (no tiene dependencias de otros MF)
2. mf_ui       → Se carga segundo (no depende de store)
3. mf_contabilidad → Se carga después de mf_store (lo consume)
4. mf_shell    → Se carga último (orquesta todo)
```

### Diagrama de Dependencias

```
mf_shell
├── mf_store (remote)
├── mf_ui (remote)
└── mf_contabilidad (remote)
    └── mf_store (remote)  ← Dependencia anidada
```

---

## Desarrollo Local

### Iniciar todos los MF

```bash
# Desde la raíz del monorepo
pnpm dev:mf
```

Esto ejecuta:
1. `pnpm build:remotes` - Construye mf_store, mf_ui, mf_contabilidad
2. `pnpm preview:remotes` - Sirve los builds en sus puertos
3. `pnpm dev:shell` - Inicia mf_shell en modo desarrollo

### Iniciar MF individual

```bash
# mf_shell (host)
cd apps/microfrontends/mf_shell
pnpm dev

# mf_store (debe estar en preview, no dev)
cd apps/microfrontends/mf_store
pnpm build:dev && pnpm preview

# Similar para otros remotes
```

### Verificar remoteEntry.js

```bash
# Verificar que el remote está disponible
curl http://localhost:5010/assets/remoteEntry.js | head -5
curl http://localhost:5011/assets/remoteEntry.js | head -5
curl http://localhost:5020/assets/remoteEntry.js | head -5
```

---

## Manejo de Errores

### Error Boundary por Módulo

```tsx
// components/ModuleErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  moduleName: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error en módulo ${this.props.moduleName}:`, error, errorInfo);
    // Enviar a servicio de monitoreo
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="module-error">
          <h3>Error cargando {this.props.moduleName}</h3>
          <p>El módulo no está disponible temporalmente.</p>
          <button onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Lazy Loading con Fallback

```tsx
// En mf_shell
import { lazy, Suspense } from 'react';

const ContabilidadRoutes = lazy(() =>
  import('mf_contabilidad/routes')
    .catch(() => ({
      default: () => <div>Módulo Contabilidad no disponible</div>
    }))
);

export const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <ModuleErrorBoundary moduleName="Contabilidad">
      <ContabilidadRoutes />
    </ModuleErrorBoundary>
  </Suspense>
);
```

---

## Troubleshooting

### Error: "Shared module is not available"

**Causa:** Versión incompatible de dependencia compartida.

**Solución:**
1. Verificar que la versión esté dentro del rango de `requiredVersion`
2. Ejecutar `pnpm install` en todos los MF
3. Rebuild: `pnpm build:remotes`

### Error: "Failed to fetch dynamically imported module"

**Causa:** El remoteEntry.js no está disponible o hay error CORS.

**Solución:**
1. Verificar que el remote está corriendo: `curl <URL>/assets/remoteEntry.js`
2. Verificar CORS en el servidor del remote
3. Revisar la URL en variables de entorno

### Error: "Cannot read property 'default' of undefined"

**Causa:** El módulo exportado no existe o el nombre es incorrecto.

**Solución:**
1. Verificar el nombre del export en `exposes`
2. Verificar el import: `import X from 'mf_xxx/moduleName'`

### Rendimiento: Carga lenta inicial

**Causas posibles:**
- Muchos chunks sin optimizar
- Sin preload hints

**Solución:**
```typescript
// En mf_shell, precargar módulos críticos
useEffect(() => {
  // Preload store inmediatamente
  import('mf_store/store');

  // Preload UI después de un delay
  setTimeout(() => {
    import('mf_ui/components');
  }, 100);
}, []);
```

---

## Checklist para Nuevos MF

- [ ] Crear estructura de carpetas estándar
- [ ] Configurar vite.config.ts con federation
- [ ] Agregar dependencias compartidas correctamente
- [ ] Configurar variables de entorno
- [ ] Agregar scripts en package.json
- [ ] Configurar TypeScript paths
- [ ] Crear declaraciones de tipos para imports remotos
- [ ] Implementar Error Boundary
- [ ] Agregar al turbo.json del monorepo
- [ ] Documentar exports disponibles
- [ ] Probar integración con mf_shell

---

## Referencias

- [@originjs/vite-plugin-federation](https://github.com/originjs/vite-plugin-federation)
- [Module Federation Docs](https://module-federation.io/)
- [Vite Configuration](https://vitejs.dev/config/)
