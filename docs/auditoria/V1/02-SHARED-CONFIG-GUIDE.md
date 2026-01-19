# Configuración de Dependencias Compartidas (shared)

## Propósito

El parámetro `shared` define qué dependencias se comparten entre módulos federados para:

1. **Evitar duplicación** de código en bundles
2. **Garantizar singleton** para librerías con estado global
3. **Controlar versiones** entre módulos
4. **Optimizar carga** de la aplicación

---

## Referencia Completa de Parámetros

### Estructura del Objeto `shared`

```typescript
shared: {
  "nombre-paquete": {
    // ═══════════════════════════════════════════════════════════
    // SINGLETON - Control de instancias
    // ═══════════════════════════════════════════════════════════
    singleton: boolean,          // Default: false

    // ═══════════════════════════════════════════════════════════
    // VERSIONADO - Control de compatibilidad
    // ═══════════════════════════════════════════════════════════
    version: string | false,     // Default: inferido de package.json
    requiredVersion: string | false,  // Default: false
    strictVersion: boolean,      // Default: false

    // ═══════════════════════════════════════════════════════════
    // CARGA - Control de bundle
    // ═══════════════════════════════════════════════════════════
    eager: boolean,              // Default: false
    import: string | false,      // Default: nombre del paquete

    // ═══════════════════════════════════════════════════════════
    // SCOPE - Aislamiento de namespaces
    // ═══════════════════════════════════════════════════════════
    shareScope: string,          // Default: "default"
    shareKey: string,            // Default: nombre del paquete

    // ═══════════════════════════════════════════════════════════
    // PAQUETE - Resolución de módulos
    // ═══════════════════════════════════════════════════════════
    packageName: string,         // Default: inferido
    packagePath: string,         // Para paquetes custom
  }
}
```

---

## Detalle de Cada Parámetro

### `singleton`

**Tipo:** `boolean`
**Default:** `false`

Garantiza que solo exista UNA instancia del módulo en toda la aplicación.

```typescript
// ✅ OBLIGATORIO para estas librerías
shared: {
  react: { singleton: true },
  "react-dom": { singleton: true },
  "@reduxjs/toolkit": { singleton: true },
  "react-redux": { singleton: true },
}
```

**¿Por qué es crítico?**

```
Sin singleton: true (PROBLEMA)
┌─────────────┐     ┌─────────────┐
│   Host      │     │   Remote    │
│  React 19.1 │     │  React 19.1 │  ← Dos instancias diferentes
│  (instancia │     │  (instancia │
│      A)     │     │      B)     │
└─────────────┘     └─────────────┘
        │                  │
        └────────┬─────────┘
                 ▼
    ❌ Error: "Invalid hook call"
    ❌ Error: "Cannot read property of undefined"
    ❌ Estado no sincronizado entre módulos

Con singleton: true (CORRECTO)
┌─────────────┐     ┌─────────────┐
│   Host      │     │   Remote    │
│  React 19.1 │────▶│  (usa ref   │
│  (instancia │     │   al Host)  │
│    única)   │     │             │
└─────────────┘     └─────────────┘
        │                  │
        └────────┬─────────┘
                 ▼
    ✅ Una sola instancia compartida
    ✅ Hooks funcionan correctamente
    ✅ Estado sincronizado
```

**Librerías que REQUIEREN singleton:**

| Librería | Razón |
|----------|-------|
| `react` | Estado interno de hooks |
| `react-dom` | Reconciliador único |
| `@reduxjs/toolkit` | Store global |
| `react-redux` | Context del Provider |
| `@emotion/react` | Cache de estilos |
| `react-router-dom` | Historia de navegación |
| Cualquier Context Provider | Estado compartido |

---

### `version`

**Tipo:** `string | false`
**Default:** Inferido de `package.json`

Define la versión que este módulo PROVEE.

```typescript
shared: {
  react: {
    version: "19.1.0",  // Este módulo tiene React 19.1.0
  }
}
```

**Mejor práctica - Leer de package.json:**

```typescript
const pkg = require("./package.json");

shared: {
  react: {
    version: pkg.dependencies.react,  // "^19.1.0"
  }
}
```

---

### `requiredVersion`

**Tipo:** `string | false`
**Default:** `false` (acepta cualquier versión)

Define la versión que este módulo REQUIERE del host.

```typescript
shared: {
  react: {
    requiredVersion: "^19.0.0",  // Acepta 19.x.x
  }
}
```

**Sintaxis semver soportada:**

| Sintaxis | Significado | Ejemplo |
|----------|-------------|---------|
| `^19.0.0` | Compatible con 19.x.x | 19.0.0, 19.1.5, 19.99.0 |
| `~19.1.0` | Compatible con 19.1.x | 19.1.0, 19.1.5 |
| `>=19.0.0` | Mayor o igual | 19.0.0, 20.0.0, 21.0.0 |
| `19.1.0` | Exacta | Solo 19.1.0 |
| `>=19.0.0 <20.0.0` | Rango | 19.x.x solamente |

---

### `strictVersion`

**Tipo:** `boolean`
**Default:** `false`

Si `true`, lanza ERROR en runtime cuando la versión no cumple `requiredVersion`.

```typescript
shared: {
  react: {
    requiredVersion: "^19.0.0",
    strictVersion: true,  // ❌ Error si Host tiene React 18.x
  }
}
```

**Comportamiento:**

| `strictVersion` | Versión no cumple | Resultado |
|-----------------|-------------------|-----------|
| `false` | Host: 18.x, Required: ^19.0 | ⚠️ Usa versión local (fallback) |
| `true` | Host: 18.x, Required: ^19.0 | ❌ Error en runtime |
| `true` + `import: false` | Host: 18.x, Required: ^19.0 | ❌ Error fatal (sin fallback) |

**Recomendación:**

```typescript
// Para el HOST - strict en críticas
shared: {
  react: {
    singleton: true,
    strictVersion: true,  // Host define la versión autoritativa
  }
}

// Para REMOTES - flexible
shared: {
  react: {
    singleton: true,
    strictVersion: false,  // Acepta lo que provea el Host
    import: false,
  }
}
```

---

### `eager`

**Tipo:** `boolean`
**Default:** `false`

Si `true`, incluye la dependencia en el bundle inicial (no lazy load).

```typescript
// Solo en el HOST
shared: {
  react: {
    singleton: true,
    eager: true,  // Carga React inmediatamente
  }
}
```

**¿Cuándo usar `eager: true`?**

| Escenario | `eager` | Razón |
|-----------|---------|-------|
| Host + dependencias críticas | `true` | Disponibles antes de cargar remotos |
| Remotes | `false` | Usar las del Host |
| Dependencias opcionales | `false` | Cargar solo si se necesitan |

**Diagrama de carga:**

```
Sin eager (default):
1. Host bundle carga
2. Remote solicita dependencia
3. Dependencia se carga async    ← Posible delay
4. Componente renderiza

Con eager: true:
1. Host bundle + dependencias cargan juntos
2. Remote solicita dependencia
3. Ya disponible inmediatamente   ← Sin delay
4. Componente renderiza
```

---

### `import`

**Tipo:** `string | false`
**Default:** Nombre del paquete

Controla si este módulo PROVEE una versión local de la dependencia.

```typescript
// HOST - Provee la dependencia
shared: {
  react: {
    import: "react",  // Default: usa el paquete 'react'
  }
}

// REMOTE - NO provee, usa del Host
shared: {
  react: {
    import: false,  // ← No incluir en bundle, usar del Host
  }
}
```

**Este es el parámetro MÁS IMPORTANTE para evitar duplicación:**

```
import: true (default) en TODOS los módulos:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Host     │     │   Remote A  │     │   Remote B  │
│  React 150KB│     │  React 150KB│     │  React 150KB│
└─────────────┘     └─────────────┘     └─────────────┘
                Total: 450KB de React 😱

import: false en REMOTES:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Host     │     │   Remote A  │     │   Remote B  │
│  React 150KB│     │  (ref Host) │     │  (ref Host) │
└─────────────┘     └─────────────┘     └─────────────┘
                Total: 150KB de React ✅
```

**Regla de oro:**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   HOST:    import: true  (o default) → PROVEE          │
│   REMOTE:  import: false             → CONSUME         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### `shareScope`

**Tipo:** `string`
**Default:** `"default"`

Define un namespace para aislar grupos de dependencias compartidas.

```typescript
// Aplicación principal
shared: {
  react: {
    shareScope: "default",
  }
}

// Micro-app legacy aislada
shared: {
  react: {
    shareScope: "legacy",  // No comparte con "default"
  }
}
```

**Caso de uso:** Múltiples aplicaciones independientes en la misma página.

---

### `shareKey`

**Tipo:** `string`
**Default:** Nombre del paquete

Clave bajo la cual se registra el módulo en el scope.

```typescript
shared: {
  "mi-react-fork": {
    shareKey: "react",  // Se registra como "react"
    import: "mi-react-fork",
  }
}
```

**Caso de uso:** Cuando el nombre del paquete npm difiere del módulo lógico.

---

### `packageName`

**Tipo:** `string`
**Default:** Inferido del nombre

Nombre del paquete en `package.json` para determinar versión.

```typescript
shared: {
  "react-alias": {
    packageName: "react",  // Leer versión de 'react' en package.json
  }
}
```

---

### `packagePath`

**Tipo:** `string`
**Default:** Resuelve desde `node_modules`

Ruta a un paquete fuera de `node_modules`.

```typescript
shared: {
  "mi-libreria-interna": {
    packagePath: "./src/shared/mi-libreria/index.ts",
  }
}
```

**Caso de uso:** Compartir código interno del monorepo sin publicar a npm.

---

## Configuraciones Recomendadas por Tipo de Módulo

### Para HOST (mf_shell)

```typescript
const pkg = require("./package.json");
const deps = pkg.dependencies;

shared: {
  // ═══════════════════════════════════════════════════════════
  // CRÍTICAS - Singleton + Eager + Strict
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  // ESTADO GLOBAL - Singleton obligatorio
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  // UI FRAMEWORK - Singleton para consistencia
  // ═══════════════════════════════════════════════════════════
  "@mui/material": {
    singleton: true,
    requiredVersion: deps["@mui/material"],
  },
  "@emotion/react": {
    singleton: true,
  },
  "@emotion/styled": {
    singleton: true,
  },

  // ═══════════════════════════════════════════════════════════
  // UTILIDADES - Pueden variar entre módulos
  // ═══════════════════════════════════════════════════════════
  "react-hook-form": {
    singleton: false,
  },
  "lucide-react": {
    singleton: false,
  },
}
```

### Para REMOTE Puro (mf_store, mf_ui)

```typescript
const pkg = require("./package.json");
const deps = pkg.dependencies;

shared: {
  // ═══════════════════════════════════════════════════════════
  // CRÍTICAS - Singleton + import: false (usar del Host)
  // ═══════════════════════════════════════════════════════════
  react: {
    singleton: true,
    requiredVersion: deps.react,
    import: false,           // ← NO incluir en bundle
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
}
```

### Para REMOTE Híbrido (mf_contabilidad)

```typescript
const pkg = require("./package.json");
const deps = pkg.dependencies;

shared: {
  // ═══════════════════════════════════════════════════════════
  // CRÍTICAS - Del Host
  // ═══════════════════════════════════════════════════════════
  react: {
    singleton: true,
    requiredVersion: deps.react,
    import: false,
  },
  "react-dom": {
    singleton: true,
    import: false,
  },
  "@reduxjs/toolkit": {
    singleton: true,
    import: false,
  },
  "react-redux": {
    singleton: true,
    import: false,
  },

  // ═══════════════════════════════════════════════════════════
  // UI - Del Host para consistencia de theme
  // ═══════════════════════════════════════════════════════════
  "@mui/material": {
    singleton: true,
    import: false,
  },
  "@emotion/react": {
    singleton: true,
    import: false,
  },

  // ═══════════════════════════════════════════════════════════
  // ESPECÍFICAS - Este MF puede proveer si Host no tiene
  // ═══════════════════════════════════════════════════════════
  "@mui/x-tree-view": {
    singleton: true,
    // import: true (default) - provee si necesario
  },
  "react-hook-form": {
    singleton: false,
  },
}
```

---

## Matriz de Decisión Rápida

| Dependencia | `singleton` | `import` (Host) | `import` (Remote) | `eager` (Host) |
|-------------|-------------|-----------------|-------------------|----------------|
| react | ✅ `true` | ✅ `true` | ❌ `false` | ✅ `true` |
| react-dom | ✅ `true` | ✅ `true` | ❌ `false` | ✅ `true` |
| @reduxjs/toolkit | ✅ `true` | ✅ `true` | ❌ `false` | ✅ `true` |
| react-redux | ✅ `true` | ✅ `true` | ❌ `false` | ✅ `true` |
| @mui/material | ✅ `true` | ✅ `true` | ❌ `false` | ⚪ `false` |
| @emotion/* | ✅ `true` | ✅ `true` | ❌ `false` | ⚪ `false` |
| react-hook-form | ⚪ `false` | ✅ `true` | ✅ `true` | ⚪ `false` |
| lodash | ⚪ `false` | ✅ `true` | ✅ `true` | ⚪ `false` |
| date-fns | ⚪ `false` | ✅ `true` | ✅ `true` | ⚪ `false` |

---

## Sintaxis Abreviadas

### Array Simple

```typescript
// Todas las opciones en default
shared: ["react", "react-dom", "lodash"]
```

### String con Versión

```typescript
shared: {
  react: "^19.0.0",  // Equivale a { requiredVersion: "^19.0.0" }
}
```

### Objeto Vacío

```typescript
shared: {
  react: {},  // Todas las opciones en default
}
```

---

## Debugging de Shared

### Ver qué versiones se están usando

```javascript
// En consola del navegador
console.log(__webpack_share_scopes__);
```

### Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Invalid hook call" | Múltiples instancias de React | Agregar `singleton: true` |
| "Cannot read property of undefined" | Dependencia no compartida | Agregar a `shared` |
| "Unsatisfied version" | `strictVersion` + versión incompatible | Ajustar `requiredVersion` |
| Bundle muy grande | `import: true` en remotes | Usar `import: false` |

---

*Siguiente: [03-ERROR-HANDLING-RESILIENCE.md](./03-ERROR-HANDLING-RESILIENCE.md)*
