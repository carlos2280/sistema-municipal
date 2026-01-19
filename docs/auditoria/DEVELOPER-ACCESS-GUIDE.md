# Guía de Acceso para Desarrolladores

## Roles y Permisos

### Roles Definidos

| Rol | Acceso | Responsabilidades |
|-----|--------|-------------------|
| **Admin/Lead** | Todo el monorepo | Arquitectura, shared packages, gateway, releases |
| **Dev Frontend** | MF asignados + shared | Desarrollo de microfrontends específicos |
| **Dev Backend** | APIs asignadas + shared | Desarrollo de microservicios específicos |
| **Dev Externo** | Solo módulo asignado | Funcionalidades específicas, sin acceso a otros módulos |

---

## Configuración para Desarrollador de Contabilidad

### Escenario: Dar acceso solo a `mf_contabilidad` y `api-contabilidad`

### Método 1: Sparse Checkout (Recomendado para devs externos)

El desarrollador ejecuta estos comandos:

```bash
# 1. Clonar sin descargar archivos
git clone --filter=blob:none --sparse \
  git@github.com:carlos2280/sistema-municipal.git

cd sistema-municipal

# 2. Configurar sparse checkout para módulos de contabilidad
git sparse-checkout init --cone
git sparse-checkout set \
  apps/microfrontends/mf_contabilidad \
  apps/microservices/api-contabilidad \
  packages/shared \
  package.json \
  pnpm-workspace.yaml \
  turbo.json

# 3. Instalar dependencias (solo las necesarias se descargarán)
pnpm install --filter mf-contabilidad --filter api-contabilidad

# 4. Desarrollar normalmente
pnpm dev --filter mf-contabilidad
```

**Resultado:**
```
sistema-municipal/
├── apps/
│   ├── microfrontends/
│   │   └── mf_contabilidad/     ✓ Accesible
│   └── microservices/
│       └── api-contabilidad/    ✓ Accesible
├── packages/
│   └── shared/                  ✓ Accesible
├── package.json                 ✓ Accesible
├── pnpm-workspace.yaml          ✓ Accesible
└── turbo.json                   ✓ Accesible

# El resto de carpetas NO existen en su máquina local
```

### Método 2: Fork con Branch Específico

```bash
# 1. El desarrollador hace fork en GitHub

# 2. Clona su fork
git clone git@github.com:dev-contabilidad/sistema-municipal.git

# 3. Crea branch para su trabajo
git checkout -b feature/contab-xyz

# 4. Trabaja solo en sus carpetas
# (puede ver todo pero solo debe modificar contabilidad)

# 5. Crea PR hacia el repo original
# El CODEOWNERS asegura que se requiera review
```

---

## Archivo CODEOWNERS

Crear en `.github/CODEOWNERS`:

```bash
# ============================================
# CODEOWNERS - Sistema Municipal
# ============================================
# Formato: path @usuario-o-equipo
# Los propietarios serán requeridos para aprobar PRs

# ============================================
# PROPIETARIOS GLOBALES (Admins)
# ============================================
* @carlos2280

# ============================================
# INFRAESTRUCTURA Y CONFIGURACIÓN
# ============================================
/.github/                    @carlos2280
/docker-compose.yml          @carlos2280
/turbo.json                  @carlos2280
/pnpm-workspace.yaml         @carlos2280
/package.json                @carlos2280

# ============================================
# PAQUETES COMPARTIDOS (Solo Admins)
# ============================================
/packages/shared/            @carlos2280

# ============================================
# API GATEWAY (Solo Admins)
# ============================================
/apps/microservices/api-gateway/    @carlos2280

# ============================================
# MICROFRONTEND SHELL (Solo Admins)
# ============================================
/apps/microfrontends/mf_shell/      @carlos2280

# ============================================
# MICROFRONTEND STORE (Solo Admins)
# ============================================
/apps/microfrontends/mf_store/      @carlos2280

# ============================================
# MICROFRONTEND UI (Frontend Team)
# ============================================
/apps/microfrontends/mf_ui/         @carlos2280 @frontend-team

# ============================================
# MÓDULO CONTABILIDAD
# ============================================
/apps/microfrontends/mf_contabilidad/  @carlos2280 @dev-contabilidad
/apps/microservices/api-contabilidad/  @carlos2280 @dev-contabilidad

# ============================================
# AUTENTICACIÓN (Solo Admins)
# ============================================
/apps/microservices/api-autorizacion/  @carlos2280
/apps/microservices/api-identidad/     @carlos2280

# ============================================
# DOCUMENTACIÓN
# ============================================
/docs/                       @carlos2280
```

---

## Branch Protection Rules

### Configurar en GitHub → Settings → Branches

#### Regla para `main`

```yaml
Branch name pattern: main

Protect matching branches:
  ✓ Require a pull request before merging
    ✓ Require approvals: 1
    ✓ Dismiss stale pull request approvals when new commits are pushed
    ✓ Require review from Code Owners

  ✓ Require status checks to pass before merging
    ✓ Require branches to be up to date before merging
    Status checks that are required:
      - build
      - lint
      - typecheck

  ✓ Require conversation resolution before merging

  ✓ Do not allow bypassing the above settings
```

#### Regla para `develop`

```yaml
Branch name pattern: develop

Protect matching branches:
  ✓ Require a pull request before merging
    ✓ Require approvals: 1

  ✓ Require status checks to pass before merging
```

---

## Scripts de Onboarding por Rol

### Script para Desarrollador de Contabilidad

Crear archivo `scripts/onboarding/setup-contabilidad.sh`:

```bash
#!/bin/bash
# ============================================
# Setup para Desarrollador de Contabilidad
# ============================================

set -e

echo "🚀 Configurando entorno para módulo Contabilidad..."

# 1. Verificar que está en sparse checkout
if [ ! -f ".git/info/sparse-checkout" ]; then
    echo "❌ Este script debe ejecutarse después del sparse checkout"
    exit 1
fi

# 2. Verificar acceso a carpetas correctas
if [ ! -d "apps/microfrontends/mf_contabilidad" ]; then
    echo "❌ No tienes acceso al módulo mf_contabilidad"
    exit 1
fi

# 3. Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install --filter mf-contabilidad --filter api-contabilidad --filter @municipal/shared

# 4. Copiar variables de entorno de ejemplo
echo "🔧 Configurando variables de entorno..."
if [ -f "apps/microfrontends/mf_contabilidad/.env.example" ]; then
    cp apps/microfrontends/mf_contabilidad/.env.example \
       apps/microfrontends/mf_contabilidad/.env.local
fi

if [ -f "apps/microservices/api-contabilidad/.env.example" ]; then
    cp apps/microservices/api-contabilidad/.env.example \
       apps/microservices/api-contabilidad/.env
fi

# 5. Verificar configuración
echo "✅ Verificando configuración..."
pnpm --filter mf-contabilidad exec tsc --noEmit
pnpm --filter api-contabilidad exec tsc --noEmit

echo ""
echo "✅ ¡Setup completado!"
echo ""
echo "📝 Comandos disponibles:"
echo "   pnpm dev --filter mf-contabilidad    # Iniciar frontend"
echo "   pnpm dev --filter api-contabilidad   # Iniciar backend"
echo "   pnpm build --filter mf-contabilidad  # Build frontend"
echo ""
echo "⚠️  Recuerda:"
echo "   - Solo modifica archivos en mf_contabilidad y api-contabilidad"
echo "   - Crea PRs para tus cambios"
echo "   - El paquete 'shared' es de solo lectura para ti"
```

---

## Flujo de Trabajo para Desarrollador Externo

### 1. Recibir Acceso

```
Admin invita a @dev-contabilidad como colaborador en GitHub
└── Permisos: Write (solo puede crear branches y PRs)
```

### 2. Configurar Entorno Local

```bash
# Clonar con sparse checkout
git clone --filter=blob:none --sparse \
  git@github.com:carlos2280/sistema-municipal.git
cd sistema-municipal

# Configurar acceso limitado
git sparse-checkout set \
  apps/microfrontends/mf_contabilidad \
  apps/microservices/api-contabilidad \
  packages/shared \
  package.json pnpm-workspace.yaml turbo.json

# Setup
chmod +x scripts/onboarding/setup-contabilidad.sh
./scripts/onboarding/setup-contabilidad.sh
```

### 3. Desarrollar

```bash
# Crear branch para feature
git checkout -b feature/contab-nuevo-reporte

# Desarrollar...
pnpm dev --filter mf-contabilidad

# Commit
git add .
git commit -m "feat(contabilidad): agregar nuevo reporte de gastos"

# Push
git push origin feature/contab-nuevo-reporte
```

### 4. Crear Pull Request

```bash
# Usando GitHub CLI
gh pr create \
  --title "feat(contabilidad): agregar nuevo reporte de gastos" \
  --body "## Cambios
  - Nuevo componente ReporteGastos
  - Endpoint GET /api/reportes/gastos

  ## Testing
  - [x] Tests unitarios
  - [x] Probado localmente"
```

### 5. Review y Merge

```
1. CODEOWNERS notifica a @carlos2280 y @dev-contabilidad
2. Admin revisa cambios
3. CI/CD ejecuta checks
4. Si aprobado, merge a main
5. Railway detecta cambios en watch path de contabilidad
6. Solo se redespliega mf-contabilidad y/o api-contabilidad
```

---

## Matriz de Permisos

| Recurso | Admin | Dev Frontend | Dev Backend | Dev Contabilidad |
|---------|-------|--------------|-------------|------------------|
| packages/shared | RW | R | R | R |
| mf_shell | RW | - | - | - |
| mf_store | RW | - | - | - |
| mf_ui | RW | RW | - | - |
| mf_contabilidad | RW | - | - | RW |
| api-gateway | RW | - | - | - |
| api-autorizacion | RW | - | R | - |
| api-identidad | RW | - | R | - |
| api-contabilidad | RW | - | - | RW |

**Leyenda:**
- RW: Lectura y Escritura
- R: Solo Lectura
- -: Sin Acceso

---

## Comandos Útiles por Rol

### Admin

```bash
# Desarrollo completo
pnpm dev:all

# Build de todo
pnpm build

# Ver estado de todos los servicios
turbo run build --dry-run

# Actualizar dependencias compartidas
pnpm update -r @municipal/shared
```

### Dev Contabilidad

```bash
# Solo lo que necesitas
pnpm dev --filter mf-contabilidad --filter api-contabilidad

# Build solo contabilidad
pnpm build --filter mf-contabilidad --filter api-contabilidad

# Tests
pnpm test --filter mf-contabilidad
```

---

## Troubleshooting

### "No puedo ver otros módulos"

**Esperado.** Si usas sparse checkout, solo tienes acceso a los módulos asignados.

### "Error al instalar dependencias"

```bash
# Asegúrate de instalar solo los filtros correctos
pnpm install --filter mf-contabilidad --filter api-contabilidad
```

### "No puedo hacer push a main"

**Esperado.** Debes crear un branch y hacer PR:
```bash
git checkout -b feature/mi-cambio
git push origin feature/mi-cambio
gh pr create
```

### "Mi PR no se aprueba automáticamente"

Los PRs requieren review de CODEOWNERS. Espera aprobación del admin.
