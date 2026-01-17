# Guía de Contribución - Sistema Municipal

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Configuración del Entorno](#configuración-del-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Convenciones de Código](#convenciones-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)

---

## Requisitos

- **Node.js** >= 20.0.0
- **pnpm** >= 10.0.0
- **Docker** y **Docker Compose**
- **Git** >= 2.25 (para sparse-checkout)

### Instalación de herramientas

```bash
# Node.js (usar nvm recomendado)
nvm install 22
nvm use 22

# pnpm
npm install -g pnpm

# Docker
# Seguir guía oficial: https://docs.docker.com/get-docker/
```

---

## Configuración del Entorno

### Clone completo (Core team)

```bash
git clone https://github.com/tu-org/sistema-municipal.git
cd sistema-municipal
cp .env.example .env
pnpm install
make dev
```

### Clone parcial (Desarrolladores de módulo)

Si solo tienes acceso a un módulo específico:

```bash
# Descargar script
curl -O https://raw.githubusercontent.com/tu-org/sistema-municipal/main/infra/scripts/sparse-clone.sh
chmod +x sparse-clone.sh

# Clonar solo tu módulo
./sparse-clone.sh contabilidad https://github.com/tu-org/sistema-municipal.git

# Configurar
cd sistema-municipal-contabilidad
cp .env.example .env
pnpm install
make dev-contabilidad
```

---

## Estructura del Proyecto

```
sistema-municipal/
├── apps/
│   ├── microfrontends/       # Aplicaciones frontend
│   │   ├── mf_shell/         # Host application
│   │   ├── mf_store/         # State management (Redux)
│   │   ├── mf_ui/            # Componentes compartidos
│   │   └── mf_contabilidad/  # Módulo de negocio
│   └── microservices/        # APIs backend
│       ├── api-gateway/      # Proxy y orquestación
│       ├── api-identidad/    # Autenticación
│       ├── api-autorizacion/ # Permisos
│       └── api-contabilidad/ # Lógica de contabilidad
├── packages/
│   └── shared/               # Código compartido (schemas, tipos)
├── infra/
│   ├── compose/              # Docker Compose files
│   ├── nginx/                # Configuraciones Nginx
│   └── scripts/              # Scripts de automatización
├── docs/                     # Documentación
└── .github/                  # GitHub Actions y CODEOWNERS
```

---

## Flujo de Trabajo

### 1. Crear rama

```bash
# Desde main actualizado
git checkout main
git pull origin main

# Crear rama descriptiva
git checkout -b feature/contabilidad-reportes
# o
git checkout -b fix/login-validation
# o
git checkout -b refactor/api-gateway-middleware
```

### 2. Desarrollar

```bash
# Iniciar entorno
make dev

# O solo tu módulo
make dev-contabilidad
```

### 3. Verificar calidad

```bash
# Linting y formato
pnpm lint
pnpm format

# Tests
pnpm test
```

### 4. Commit

```bash
# Usar commitizen para mensaje estandarizado
pnpm commit
# o
git commit -m "feat(contabilidad): add monthly report generation"
```

### 5. Push y PR

```bash
git push origin feature/contabilidad-reportes
# Crear PR en GitHub
```

---

## Convenciones de Código

### TypeScript

- Usar tipos explícitos en funciones públicas
- Evitar `any`, preferir `unknown` si es necesario
- Usar interfaces para objetos, types para uniones

```typescript
// ✅ Bien
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Mal
function getUser(id): any {
  // ...
}
```

### React

- Componentes funcionales con hooks
- Nombres en PascalCase
- Props tipadas

```tsx
// ✅ Bien
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Archivos y carpetas

- Nombres en kebab-case para archivos: `user-service.ts`
- Nombres en PascalCase para componentes: `UserProfile.tsx`
- Index files para exports públicos

---

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Formato (no afecta código) |
| `refactor` | Refactorización |
| `test` | Agregar o corregir tests |
| `chore` | Tareas de mantenimiento |

### Scopes

| Scope | Área |
|-------|------|
| `contabilidad` | Módulo contabilidad |
| `identidad` | Autenticación/usuarios |
| `autorizacion` | Permisos |
| `shell` | Aplicación host |
| `shared` | Código compartido |
| `infra` | Infraestructura |

### Ejemplos

```bash
feat(contabilidad): add balance sheet generation
fix(identidad): resolve token refresh loop
docs(readme): update installation steps
refactor(api-gateway): simplify middleware chain
test(contabilidad): add unit tests for ledger service
chore(deps): update drizzle-orm to 0.44.0
```

---

## Pull Requests

### Template

```markdown
## Descripción
[Descripción clara de los cambios]

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He ejecutado `pnpm lint` y `pnpm format`
- [ ] He agregado tests que cubren mis cambios
- [ ] Los tests existentes pasan (`pnpm test`)
- [ ] He actualizado la documentación si es necesario

## Screenshots (si aplica)
[Capturas de pantalla de cambios visuales]
```

### Proceso de revisión

1. **Crear PR** contra `main` (o `develop` si existe)
2. **GitHub Actions** ejecuta CI automáticamente
3. **CODEOWNERS** asigna revisores automáticamente
4. **Al menos 1 aprobación** requerida
5. **Squash and merge** al completar

---

## Comandos Útiles

```bash
# Desarrollo
make dev              # Todo el stack
make dev-contabilidad # Solo módulo contabilidad
make dev-infra        # Solo PostgreSQL, Redis, Mailhog

# Calidad
pnpm lint             # Verificar código
pnpm format           # Formatear código
pnpm test             # Ejecutar tests

# Base de datos
make db-migrate       # Ejecutar migraciones
make db-seed          # Cargar datos de prueba
make db-studio        # Abrir Drizzle Studio

# Docker
make status           # Ver estado de servicios
make logs             # Ver logs
make clean            # Limpiar contenedores

# Build
make build            # Build de imágenes Docker
make build-api        # Solo APIs
make build-mf         # Solo microfrontends
```

---

## Ayuda

- **Issues**: Reportar bugs o solicitar features en GitHub Issues
- **Discusiones**: Preguntas generales en GitHub Discussions
- **Slack/Discord**: [Canal del equipo] para comunicación en tiempo real
