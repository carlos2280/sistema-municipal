# Guía de Onboarding - Sistema Municipal

Bienvenido al equipo. Esta guía te ayudará a configurar tu entorno y comenzar a contribuir.

---

## Paso 1: Verificar Acceso

### Si eres desarrollador de un módulo específico

Tu acceso está limitado a las carpetas de tu módulo. Confirma con el líder técnico:

- [ ] Acceso al repositorio de GitHub
- [ ] Permisos de lectura/escritura en tu módulo
- [ ] Acceso a los ambientes de desarrollo

### Si eres parte del Core team

Tienes acceso completo al repositorio.

---

## Paso 2: Configurar Entorno Local

### Requisitos

```bash
# Verificar versiones
node --version    # >= 20.0.0
pnpm --version    # >= 10.0.0
docker --version  # >= 24.0.0
git --version     # >= 2.25.0
```

### Instalar herramientas faltantes

```bash
# Node.js con nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22

# pnpm
npm install -g pnpm

# Docker Desktop
# https://www.docker.com/products/docker-desktop/
```

---

## Paso 3: Clonar el Proyecto

### Opción A: Clone completo (Core team)

```bash
git clone https://github.com/tu-org/sistema-municipal.git
cd sistema-municipal
```

### Opción B: Clone parcial (Desarrollador de módulo)

```bash
# Ejemplo para módulo contabilidad
git clone --filter=blob:none --sparse https://github.com/tu-org/sistema-municipal.git
cd sistema-municipal

git sparse-checkout set \
  apps/microfrontends/mf_contabilidad \
  apps/microservices/api-contabilidad \
  packages/shared \
  infra/compose \
  .env.example \
  package.json \
  pnpm-workspace.yaml \
  turbo.json \
  Makefile
```

---

## Paso 4: Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env

# Editar con tus valores locales
nano .env  # o tu editor preferido
```

### Variables importantes

```env
# Base de datos local
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=municipal

# JWT (para desarrollo, usar el valor por defecto)
JWT_SECRET=dev-secret-change-in-production
```

---

## Paso 5: Instalar Dependencias

```bash
pnpm install
```

Esto instalará las dependencias de todos los workspaces gracias a pnpm.

---

## Paso 6: Iniciar el Entorno

### Primera vez: Levantar infraestructura y migrar BD

```bash
# Iniciar PostgreSQL, Redis, Mailhog
make dev-infra

# Ejecutar migraciones
make db-migrate

# Cargar datos de prueba
make db-seed
```

### Desarrollo diario

```bash
# Todo el stack
make dev

# O solo tu módulo (más rápido)
make dev-contabilidad
```

---

## Paso 7: Verificar que Todo Funciona

### URLs de desarrollo

| Servicio | URL |
|----------|-----|
| Shell (Frontend) | http://localhost:5000 |
| API Gateway | http://localhost:3000 |
| Mailhog (emails) | http://localhost:8025 |
| Drizzle Studio | `make db-studio` |

### Test rápido

```bash
# Verificar servicios
make status

# Ejecutar tests
pnpm test
```

---

## Paso 8: Configurar IDE

### VS Code (Recomendado)

Instalar extensiones:

- **Biome** - Linting y formatting
- **Tailwind CSS IntelliSense** - Si usas Tailwind
- **Docker** - Gestión de contenedores
- **GitLens** - Git avanzado
- **Thunder Client** - Testing de APIs

El proyecto incluye `.vscode/` con configuraciones recomendadas.

### Configuración de Biome

El proyecto usa Biome en lugar de ESLint/Prettier. La configuración está en `biome.json`.

```bash
# Formatear código
pnpm format

# Verificar código
pnpm lint
```

---

## Paso 9: Entender la Arquitectura

### Microfrontends (Module Federation)

```
mf_shell (Host) ─────┬──── mf_store (Remote) - Redux store
     │               ├──── mf_ui (Remote) - Componentes
     │               └──── mf_contabilidad (Remote) - Módulo
     │
     └──── Carga remotes dinámicamente
```

### Microservicios

```
Cliente ──► api-gateway ──┬──► api-identidad
                          ├──► api-autorizacion
                          └──► api-contabilidad
```

### Base de Datos

- **PostgreSQL** como BD principal
- **Drizzle ORM** para schemas y queries
- **Schemas compartidos** en `packages/shared`

---

## Paso 10: Primera Tarea

### Sugerencia: Familiarízate con el código

1. Navega por la estructura del proyecto
2. Lee los README de cada servicio
3. Revisa los schemas en `packages/shared/src/database`
4. Ejecuta los tests existentes
5. Haz un pequeño cambio (agregar un comentario) y crea un PR

### Tu primer commit

```bash
# Crear rama
git checkout -b onboarding/tu-nombre

# Hacer un cambio pequeño
echo "// Onboarding: tu-nombre" >> apps/microservices/api-contabilidad/src/index.ts

# Commit con convención
git commit -m "chore(onboarding): add developer signature"

# Push
git push origin onboarding/tu-nombre

# Crear PR en GitHub
```

---

## Recursos Adicionales

### Documentación

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guía de contribución
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura detallada
- [API Docs](http://localhost:3001/api-docs) - Swagger (cuando corre)

### Tecnologías

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Module Federation](https://module-federation.io/)
- [Express 5](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Turbo](https://turbo.build/)

---

## Problemas Comunes

### Puerto en uso

```bash
# Ver qué usa el puerto
lsof -i :5000

# Matar proceso
kill -9 <PID>
```

### Docker no inicia

```bash
# Reiniciar Docker Desktop
# o
sudo systemctl restart docker
```

### Dependencias rotas

```bash
# Limpiar y reinstalar
make clean-all
pnpm install
```

### Base de datos corrupta

```bash
# Resetear completamente
make db-reset
```

---

## Contacto

- **Líder técnico**: @carca
- **Issues**: GitHub Issues
- **Dudas rápidas**: [Slack/Discord del equipo]

¡Bienvenido al equipo! 🎉
