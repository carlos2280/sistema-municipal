# Estrategia de Aislamiento de Deployments

## Problema Actual

El monorepo `sistema-municipal` tiene **un único repositorio** conectado a Railway. Cuando se hace push a `main`, Railway redespliega **todos los servicios** aunque solo se haya modificado un archivo de un servicio específico.

```
sistema-municipal/
├── apps/
│   ├── microfrontends/
│   │   ├── mf_shell          → Railway Service 1
│   │   ├── mf_store          → Railway Service 2
│   │   ├── mf_ui             → Railway Service 3
│   │   └── mf_contabilidad   → Railway Service 4
│   └── microservices/
│       ├── api-gateway       → Railway Service 5
│       ├── api-autorizacion  → Railway Service 6
│       ├── api-identidad     → Railway Service 7
│       └── api-contabilidad  → Railway Service 8
└── packages/
    └── shared/               → Biblioteca compartida
```

**Consecuencias:**
- Desperdicio de recursos (builds innecesarios)
- Downtime potencial en servicios no modificados
- No hay aislamiento para desarrolladores

---

## Soluciones Disponibles

### Opción 1: Watch Paths en Railway (Recomendada para tu caso)

Railway soporta **watch paths** que permiten especificar qué directorios debe monitorear cada servicio.

#### Configuración en Railway Dashboard

Para cada servicio en Railway:

1. Ir a **Service Settings → Build → Watch Paths**
2. Configurar el path específico:

| Servicio | Watch Path |
|----------|------------|
| mf-shell | `apps/microfrontends/mf_shell/**` |
| mf-store | `apps/microfrontends/mf_store/**` |
| mf-ui | `apps/microfrontends/mf_ui/**` |
| mf-contabilidad | `apps/microfrontends/mf_contabilidad/**` |
| api-gateway | `apps/microservices/api-gateway/**` |
| api-autorizacion | `apps/microservices/api-autorizacion/**` |
| api-identidad | `apps/microservices/api-identidad/**` |
| api-contabilidad | `apps/microservices/api-contabilidad/**` |

**Incluir también paquetes compartidos:**
```
apps/microfrontends/mf_shell/**
packages/shared/**
```

#### Ventajas
- Sin cambios en estructura del repositorio
- Fácil de configurar
- Mantiene el monorepo intacto

#### Desventajas
- No provee aislamiento de código para desarrolladores
- Todos tienen acceso a todo el código

---

### Opción 2: Multi-Repo (Repositorios Independientes)

Separar cada servicio en su propio repositorio.

```
Repositorios:
├── sistema-municipal-shared     (paquete npm privado)
├── sistema-municipal-shell
├── sistema-municipal-store
├── sistema-municipal-ui
├── sistema-municipal-contabilidad-mf
├── sistema-municipal-gateway
├── sistema-municipal-autorizacion
├── sistema-municipal-identidad
└── sistema-municipal-contabilidad-api
```

#### Estructura de cada repo

```
sistema-municipal-contabilidad-mf/
├── src/
├── package.json              # Depende de @municipal/shared
├── vite.config.ts
└── railway.json
```

#### package.json ejemplo
```json
{
  "name": "mf-contabilidad",
  "dependencies": {
    "@municipal/shared": "github:org/sistema-municipal-shared#main"
  }
}
```

#### Ventajas
- **Aislamiento total por desarrollador**
- Cada desarrollador solo accede a su repositorio
- Deployments 100% independientes
- Mejor para equipos grandes

#### Desventajas
- Complejidad en gestión de dependencias compartidas
- Más difícil mantener consistencia de versiones
- Requiere publicar `@municipal/shared` como paquete npm

---

### Opción 3: Monorepo con Branches por Feature (Híbrida)

Mantener monorepo pero usar branches específicas para deploy.

```
main                    → Solo para releases estables
├── develop             → Integración
├── deploy/gateway      → Railway apunta aquí para gateway
├── deploy/mf-shell     → Railway apunta aquí para shell
├── deploy/mf-contab    → Railway apunta aquí para contabilidad
└── feature/*           → Features de desarrollo
```

#### Flujo de trabajo

```bash
# Desarrollador trabajando en contabilidad
git checkout -b feature/contab-nueva-funcionalidad

# Al terminar, merge a deploy branch específico
git checkout deploy/mf-contab
git merge feature/contab-nueva-funcionalidad
git push origin deploy/mf-contab
# Solo se despliega mf-contabilidad
```

#### Configuración Railway
Cada servicio apunta a su branch específico:
- mf-shell → branch `deploy/mf-shell`
- api-gateway → branch `deploy/gateway`

---

### Opción 4: Git Submodules (Para Aislamiento de Desarrolladores)

Usar el monorepo como "orquestador" con submodules para cada servicio.

```
sistema-municipal/           # Repo principal (solo admins)
├── apps/
│   ├── microfrontends/
│   │   ├── mf_shell/        # Submodule → repo mf-shell
│   │   └── mf_contabilidad/ # Submodule → repo mf-contabilidad
│   └── microservices/
│       └── api-gateway/     # Submodule → repo api-gateway
└── packages/
    └── shared/              # En repo principal
```

#### Dar acceso a un desarrollador solo a contabilidad

```bash
# El desarrollador solo clona su submodule
git clone git@github.com:org/mf-contabilidad.git

# Para desarrollo local con todo el contexto (admin/lead)
git clone --recurse-submodules git@github.com:org/sistema-municipal.git
```

---

## Recomendación por Escenario

| Escenario | Solución Recomendada |
|-----------|---------------------|
| Equipo pequeño (1-5 devs), confianza total | **Opción 1: Watch Paths** |
| Equipo mediano, necesita aislamiento básico | **Opción 3: Branches** |
| Equipo grande, aislamiento crítico | **Opción 2: Multi-Repo** |
| Consultores externos por módulo | **Opción 4: Submodules** |

---

## Implementación Recomendada: Watch Paths + Control de Acceso

Para tu caso actual, la mejor estrategia es:

### Paso 1: Configurar Watch Paths en Railway

```bash
# Usando Railway CLI (si está disponible)
# O manualmente en el dashboard de cada servicio
```

**Para api-gateway:**
```
Watch Paths:
- apps/microservices/api-gateway/**
- packages/shared/**
```

**Para mf-contabilidad:**
```
Watch Paths:
- apps/microfrontends/mf_contabilidad/**
- packages/shared/**
```

### Paso 2: Control de Acceso con GitHub (CODEOWNERS)

Crear archivo `.github/CODEOWNERS`:

```
# Propietarios globales (admins)
* @carlos2280

# Propietarios por módulo
/apps/microfrontends/mf_contabilidad/ @dev-contabilidad
/apps/microfrontends/mf_shell/ @carlos2280
/apps/microservices/api-gateway/ @carlos2280
/apps/microservices/api-contabilidad/ @dev-contabilidad

# Paquete compartido requiere review de admin
/packages/shared/ @carlos2280
```

### Paso 3: Branch Protection Rules

En GitHub → Settings → Branches → Add rule:

```yaml
Branch: main
Rules:
  - Require pull request reviews: ON
  - Require review from Code Owners: ON
  - Require status checks to pass: ON
```

### Paso 4: Para Desarrollador Externo (Contabilidad)

Si quieres dar acceso solo a `mf_contabilidad` a un desarrollador:

#### Opción A: Fork + PR (Más seguro)
1. El desarrollador hace fork del repo
2. Solo trabaja en su fork
3. Crea PRs hacia el repo principal
4. Tú revisas y apruebas

#### Opción B: Git Sparse Checkout (Acceso limitado)
El desarrollador puede clonar solo lo que necesita:

```bash
# Clonar sin checkout inicial
git clone --filter=blob:none --sparse git@github.com:org/sistema-municipal.git
cd sistema-municipal

# Configurar sparse checkout para solo contabilidad
git sparse-checkout set apps/microfrontends/mf_contabilidad packages/shared

# Resultado: solo tiene estos directorios
tree .
├── apps/
│   └── microfrontends/
│       └── mf_contabilidad/
└── packages/
    └── shared/
```

---

## Configuración Inmediata para Railway

### Usando el MCP de Railway disponible

```typescript
// Configuración recomendada por servicio
const watchPathsConfig = {
  'api-gateway': [
    'apps/microservices/api-gateway/**',
    'packages/shared/**'
  ],
  'api-autorizacion': [
    'apps/microservices/api-autorizacion/**',
    'packages/shared/**'
  ],
  'api-identidad': [
    'apps/microservices/api-identidad/**',
    'packages/shared/**'
  ],
  'api-contabilidad': [
    'apps/microservices/api-contabilidad/**',
    'packages/shared/**'
  ],
  'mf-shell': [
    'apps/microfrontends/mf_shell/**',
    'packages/shared/**'
  ],
  'mf-store': [
    'apps/microfrontends/mf_store/**',
    'packages/shared/**'
  ],
  'mf-ui': [
    'apps/microfrontends/mf_ui/**',
    'packages/shared/**'
  ],
  'mf-contabilidad': [
    'apps/microfrontends/mf_contabilidad/**',
    'packages/shared/**'
  ]
};
```

---

## Diagrama de Flujo con Watch Paths

```
┌─────────────────────────────────────────────────────────────┐
│                    Git Push to Main                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Railway Webhook Triggered                     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  api-gateway  │    │mf-contabilidad│    │   mf-shell    │
│  Watch Path:  │    │  Watch Path:  │    │  Watch Path:  │
│ api-gateway/**│    │mf_contab/**   │    │ mf_shell/**   │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ ¿Cambios en   │    │ ¿Cambios en   │    │ ¿Cambios en   │
│ watch path?   │    │ watch path?   │    │ watch path?   │
└───────────────┘    └───────────────┘    └───────────────┘
     │    │               │    │               │    │
    YES   NO             YES   NO             YES   NO
     │    │               │    │               │    │
     ▼    ▼               ▼    ▼               ▼    ▼
  BUILD  SKIP          BUILD  SKIP          BUILD  SKIP
```

---

## Conclusión

**Para implementación inmediata:**
1. Configurar **Watch Paths** en Railway Dashboard para cada servicio
2. Crear archivo **CODEOWNERS** para control de revisiones
3. Activar **Branch Protection** en GitHub

**Para aislamiento de desarrolladores externos:**
1. Usar **Git Sparse Checkout** para limitar acceso a carpetas
2. O migrar a **Multi-Repo** si el aislamiento es crítico

---

## Referencias

- [Railway Watch Paths Documentation](https://docs.railway.app/guides/watch-paths)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Git Sparse Checkout](https://git-scm.com/docs/git-sparse-checkout)
- [Monorepo vs Multi-repo](https://monorepo.tools/)
