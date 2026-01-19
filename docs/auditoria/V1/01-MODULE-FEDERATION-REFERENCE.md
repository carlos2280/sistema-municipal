# Module Federation - Referencia Completa

## Plugin: `@originjs/vite-plugin-federation`

### Información General

| Propiedad | Valor |
|-----------|-------|
| Repositorio | https://github.com/originjs/vite-plugin-federation |
| Documentación Oficial | https://originjs.org/en/guide/plugins/vite-plugin-federation/ |
| Compatibilidad | Vite 4.x, 5.x, 6.x |
| Basado en | Webpack 5 Module Federation |

---

## Parámetros del Plugin Principal

### Estructura Completa

```typescript
import federation from "@originjs/vite-plugin-federation";

federation({
  // ═══════════════════════════════════════════════════════════════════
  // IDENTIFICACIÓN DEL MÓDULO
  // ═══════════════════════════════════════════════════════════════════

  name: string,                    // REQUERIDO
  // Identificador único del módulo federado
  // Debe ser único en todo el ecosistema de MFs
  // Ejemplo: "mf_shell", "mf_store", "mf_contabilidad"

  filename: string,                // OPCIONAL - Default: "remoteEntry.js"
  // Nombre del archivo de entrada generado
  // Este archivo contiene el manifest del módulo

  // ═══════════════════════════════════════════════════════════════════
  // EXPOSICIÓN DE MÓDULOS (Solo para REMOTES)
  // ═══════════════════════════════════════════════════════════════════

  exposes: {
    // SINTAXIS SIMPLE
    "./NombrePublico": "./ruta/al/archivo.ts",

    // SINTAXIS AVANZADA
    "./NombrePublico": {
      import: "./ruta/al/archivo.ts",     // Ruta al archivo
      name: "AliasInterno",               // Nombre interno (opcional)
      dontAppendStylesToHead: boolean,    // No inyectar CSS (default: false)
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // CONSUMO DE REMOTOS (Para HOST o remotes híbridos)
  // ═══════════════════════════════════════════════════════════════════

  remotes: {
    // SINTAXIS SIMPLE (string)
    nombre_remoto: "http://localhost:5010/remoteEntry.js",

    // SINTAXIS AVANZADA (objeto)
    nombre_remoto: {
      external: string,              // URL del remoteEntry.js
      format: "esm" | "var" | "systemjs",  // Formato del módulo
      externalType: "url" | "promise",     // Tipo de resolución
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // DEPENDENCIAS COMPARTIDAS
  // ═══════════════════════════════════════════════════════════════════

  shared: {
    // Ver documento 02-SHARED-CONFIG-GUIDE.md para detalle completo
  },

  // ═══════════════════════════════════════════════════════════════════
  // TRANSFORMACIÓN DE ARCHIVOS
  // ═══════════════════════════════════════════════════════════════════

  transformFileTypes: string[],    // OPCIONAL
  // Default: [".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs", ".vue", ".svelte"]
  // Tipos de archivo que el plugin procesará
})
```

---

## Detalle de Parámetros

### `name` (Requerido)

```typescript
name: "mf_contabilidad"
```

| Aspecto | Descripción |
|---------|-------------|
| Tipo | `string` |
| Requerido | Sí |
| Uso | Identificador único del módulo en el ecosistema |

**Convención recomendada:**
- Usar prefijo `mf_` para microfrontends
- Usar snake_case
- Nombre descriptivo del dominio

**Ejemplos:**
```typescript
// ✅ Correcto
name: "mf_shell"
name: "mf_store"
name: "mf_contabilidad"
name: "mf_tesoreria"

// ❌ Incorrecto
name: "shell"           // Sin prefijo
name: "mfContabilidad"  // camelCase
name: "MF_STORE"        // MAYÚSCULAS
```

---

### `filename` (Opcional)

```typescript
filename: "remoteEntry.js"  // Default
```

| Aspecto | Descripción |
|---------|-------------|
| Tipo | `string` |
| Default | `"remoteEntry.js"` |
| Uso | Nombre del archivo manifest generado |

**Casos de uso para cambiar el default:**
```typescript
// Versionado en el nombre
filename: "remoteEntry.v1.js"

// Hash para cache busting (no recomendado, mejor usar headers)
filename: "remoteEntry.[hash].js"
```

---

### `exposes` (Para Remotes)

Define qué módulos expone este remote para ser consumidos por otros.

#### Sintaxis Simple

```typescript
exposes: {
  "./Button": "./src/components/Button.tsx",
  "./routes": "./src/routes/index.tsx",
}
```

#### Sintaxis Avanzada

```typescript
exposes: {
  "./Button": {
    import: "./src/components/Button.tsx",
    name: "ButtonComponent",           // Alias interno
    dontAppendStylesToHead: false,     // Inyectar CSS automáticamente
  }
}
```

#### Parámetros de `exposes` (objeto)

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `import` | `string` | - | Ruta al archivo fuente |
| `name` | `string` | Nombre del export | Alias interno del módulo |
| `dontAppendStylesToHead` | `boolean` | `false` | Si `true`, no inyecta estilos en `<head>` |

---

### `remotes` (Para Host o Híbridos)

Define qué remotos consume este módulo.

#### Sintaxis Simple

```typescript
remotes: {
  mf_store: "http://localhost:5010/remoteEntry.js",
  mf_ui: "http://localhost:5011/remoteEntry.js",
}
```

#### Sintaxis con Variables de Entorno (Recomendado)

```typescript
const env = loadEnv(mode, process.cwd(), "");

remotes: {
  mf_store: env.VITE_MF_STORE_URL,
  mf_ui: env.VITE_MF_UI_URL,
}
```

#### Sintaxis Avanzada

```typescript
remotes: {
  mf_store: {
    external: "http://localhost:5010/remoteEntry.js",
    format: "esm",
    externalType: "url",
  }
}
```

#### Parámetros de `remotes` (objeto)

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `external` | `string` | - | URL del remoteEntry.js |
| `format` | `"esm"` \| `"var"` \| `"systemjs"` | `"esm"` | Formato del módulo remoto |
| `externalType` | `"url"` \| `"promise"` | `"url"` | Tipo de resolución de URL |

#### URLs Dinámicas con `externalType: "promise"`

```typescript
remotes: {
  mf_store: {
    external: `Promise.resolve(window.__MF_URLS__.store)`,
    externalType: "promise",
    format: "esm",
  }
}
```

**Caso de uso:** Cuando la URL del remote se determina en runtime (multi-tenancy, feature flags, etc.)

---

### `transformFileTypes` (Opcional)

```typescript
transformFileTypes: [".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs", ".vue"]
```

| Aspecto | Descripción |
|---------|-------------|
| Tipo | `string[]` |
| Default | `[".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs", ".vue", ".svelte"]` |
| Uso | Extensiones de archivo que el plugin procesará |

**Cuándo modificar:**
- Si usas extensiones custom
- Para excluir tipos de archivo del procesamiento

---

## Tipos de Módulos Federados

### 1. Host (Contenedor Principal)

```
┌─────────────────────────────────────────┐
│              HOST (mf_shell)            │
│  ┌─────────────────────────────────┐    │
│  │  remotes: {                     │    │
│  │    mf_store: "...",             │    │
│  │    mf_ui: "...",                │    │
│  │    mf_contabilidad: "...",      │    │
│  │  }                              │    │
│  │  exposes: {}  // Vacío          │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Características:**
- Consume remotos (`remotes` definido)
- No expone nada (`exposes` vacío o ausente)
- Provee dependencias compartidas con `eager: true`

### 2. Remote Puro

```
┌─────────────────────────────────────────┐
│          REMOTE (mf_store)              │
│  ┌─────────────────────────────────┐    │
│  │  exposes: {                     │    │
│  │    "./store": "...",            │    │
│  │    "./hooks": "...",            │    │
│  │  }                              │    │
│  │  remotes: {}  // Vacío          │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Características:**
- Expone módulos (`exposes` definido)
- No consume otros remotos (`remotes` vacío)
- Usa dependencias del Host con `import: false`

### 3. Remote Híbrido

```
┌─────────────────────────────────────────┐
│      HÍBRIDO (mf_contabilidad)          │
│  ┌─────────────────────────────────┐    │
│  │  exposes: {                     │    │
│  │    "./routes": "...",           │    │
│  │  }                              │    │
│  │  remotes: {                     │    │
│  │    mf_store: "...",             │    │
│  │  }                              │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Características:**
- Expone módulos Y consume otros remotos
- Más complejo de configurar
- Riesgo de dependencias circulares

---

## Orden de Carga de Módulos

```
1. HOST inicia
   │
2. HOST carga shared dependencies (eager: true)
   │
3. HOST solicita remoteEntry.js de cada remote
   │
   ├── mf_store/remoteEntry.js
   ├── mf_ui/remoteEntry.js
   └── mf_contabilidad/remoteEntry.js
       │
       └── mf_contabilidad solicita mf_store (dependencia)
           │
4. Módulos disponibles para uso
```

**Importante:** Los módulos híbridos deben cargar sus dependencias remotas antes de exponerse.

---

## Interoperabilidad con Webpack

El plugin soporta consumir remotos generados por Webpack 5:

```typescript
remotes: {
  webpack_remote: {
    external: "http://webpack-app.com/remoteEntry.js",
    format: "var",  // Webpack usa formato 'var' por defecto
    externalType: "url",
  }
}
```

| Formato | Descripción | Uso |
|---------|-------------|-----|
| `esm` | ES Modules | Vite a Vite |
| `var` | Variable global | Webpack a Vite |
| `systemjs` | SystemJS | Legacy systems |

---

## Referencias

- [GitHub - originjs/vite-plugin-federation](https://github.com/originjs/vite-plugin-federation)
- [Webpack Module Federation Plugin](https://webpack.js.org/plugins/module-federation-plugin/)
- [Module Federation Official](https://module-federation.io/guide/basic/vite)

---

*Siguiente: [02-SHARED-CONFIG-GUIDE.md](./02-SHARED-CONFIG-GUIDE.md)*
