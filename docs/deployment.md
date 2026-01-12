# Deployment - Sistema Municipal (Monorepo)

## Arquitectura del Monorepo

```
sistema-municipal/
├── apps/
│   ├── microfrontends/
│   │   ├── mf_shell/          # Host container
│   │   ├── mf_store/          # Estado global (Zustand)
│   │   ├── mf_ui/             # Componentes compartidos
│   │   └── mf_contabilidad/   # Modulo de contabilidad
│   └── microservices/
│       ├── api-gateway/       # Gateway + proxy
│       ├── api-identidad/     # Auth y usuarios
│       ├── api-autorizacion/  # Permisos y roles
│       └── api-contabilidad/  # Contabilidad
└── packages/
    └── shared/                # Schemas Drizzle compartidos
```

## Railway - Configuracion Monorepo

### Repositorio Unico

**Repositorio GitHub**: `carlos2280/sistema-municipal`

### Crear Proyecto en Railway

1. Ir a [Railway Dashboard](https://railway.app/dashboard)
2. Click en "New Project"
3. Seleccionar "Deploy from GitHub repo"
4. Conectar el repositorio `carlos2280/sistema-municipal`

### Configurar Servicios Individuales

Para cada servicio del monorepo, crear un servicio en Railway con su **Root Directory** y **Watch Paths** especificos.

#### Microfrontends

| Servicio | Root Directory | Watch Paths |
|----------|---------------|-------------|
| mf-shell | `apps/microfrontends/mf_shell` | `apps/microfrontends/mf_shell/**`, `packages/shared/**` |
| mf-store | `apps/microfrontends/mf_store` | `apps/microfrontends/mf_store/**`, `packages/shared/**` |
| mf-ui | `apps/microfrontends/mf_ui` | `apps/microfrontends/mf_ui/**`, `packages/shared/**` |
| mf-contabilidad | `apps/microfrontends/mf_contabilidad` | `apps/microfrontends/mf_contabilidad/**`, `packages/shared/**` |

#### Microservicios

| Servicio | Root Directory | Watch Paths |
|----------|---------------|-------------|
| api-gateway | `apps/microservices/api-gateway` | `apps/microservices/api-gateway/**`, `packages/shared/**` |
| api-identidad | `apps/microservices/api-identidad` | `apps/microservices/api-identidad/**`, `packages/shared/**` |
| api-autorizacion | `apps/microservices/api-autorizacion` | `apps/microservices/api-autorizacion/**`, `packages/shared/**` |
| api-contabilidad | `apps/microservices/api-contabilidad` | `apps/microservices/api-contabilidad/**`, `packages/shared/**` |

### Paso a Paso - Crear un Servicio

1. En el proyecto de Railway, click en "New Service"
2. Seleccionar "GitHub Repo"
3. Elegir `carlos2280/sistema-municipal`
4. Ir a **Settings** del servicio:
   - **General > Root Directory**: Ej. `apps/microservices/api-identidad`
   - **Triggers > Watch Paths**: Agregar los paths que deben triggear deploy

### Watch Paths - Smart Redeploys

Railway solo redespliega un servicio cuando cambian archivos en sus **Watch Paths**.

**Ejemplo**: Si modificas `apps/microfrontends/mf_contabilidad/src/App.tsx`:
- ✅ Se redespliega: `mf-contabilidad`
- ❌ NO se redespliegan: `mf-shell`, `mf-ui`, `mf-store`, APIs

**Ejemplo**: Si modificas `packages/shared/src/database/schema.ts`:
- ✅ Se redespliegan: TODOS los servicios (porque todos incluyen `packages/shared/**` en watch paths)

---

## Variables de Entorno

### Por Servicio

Configurar en Railway Dashboard > Service > Variables

#### api-identidad
```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=tu-secreto-seguro
JWT_EXPIRES_IN=24h
PORT=3001
```

#### api-contabilidad
```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3002
```

#### api-autorizacion
```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3003
```

#### api-gateway
```env
NODE_ENV=production
PORT=3000
API_IDENTIDAD_URL=${{api-identidad.RAILWAY_PRIVATE_DOMAIN}}
API_CONTABILIDAD_URL=${{api-contabilidad.RAILWAY_PRIVATE_DOMAIN}}
API_AUTORIZACION_URL=${{api-autorizacion.RAILWAY_PRIVATE_DOMAIN}}
```

#### Microfrontends
```env
NODE_ENV=production
VITE_API_URL=${{api-gateway.RAILWAY_PUBLIC_DOMAIN}}
VITE_MF_STORE_URL=${{mf-store.RAILWAY_PUBLIC_DOMAIN}}
VITE_MF_UI_URL=${{mf-ui.RAILWAY_PUBLIC_DOMAIN}}
```

### Variables Compartidas (Reference)

Railway permite referenciar variables entre servicios:
- `${{NombreServicio.VARIABLE}}` - Referencia a variable de otro servicio
- `${{Postgres.DATABASE_URL}}` - URL del PostgreSQL managed

---

## Flujo de CI/CD

### Deploy Automatico

```
Push a main
    │
    ▼
Railway detecta cambio
    │
    ▼
Evalua Watch Paths de cada servicio
    │
    ├─── Cambio en apps/microfrontends/mf_contabilidad/**
    │    └─► Redeploy solo mf-contabilidad
    │
    ├─── Cambio en packages/shared/**
    │    └─► Redeploy TODOS los servicios
    │
    └─── Cambio en docs/**
         └─► No redeploy (no está en watch paths)
```

### Beneficios del Monorepo

1. **Deploys selectivos**: Solo se redespliega lo que cambió
2. **Codigo compartido**: `packages/shared` disponible para todos
3. **Single source of truth**: Un solo repo, una sola historia de git
4. **PRs atomicos**: Cambios en API + Frontend en un solo PR

---

## Comandos Railway CLI

### Instalacion
```bash
npm install -g @railway/cli
railway login
```

### Vincular Proyecto
```bash
cd C:\Users\carca\Desktop\PROYECTOS\MUNICPALIDAD
railway link
```

### Deploy Manual
```bash
# Deploy de un servicio especifico
railway up --service api-identidad

# Desde el root directory del servicio
cd apps/microservices/api-identidad
railway up
```

### Logs
```bash
# Logs en tiempo real
railway logs --service api-identidad

# Ultimos N logs
railway logs --service mf-contabilidad -n 200
```

### Variables
```bash
# Ver variables
railway variables --service api-identidad

# Agregar variable
railway variables set JWT_SECRET=nuevo-secreto --service api-identidad
```

---

## Build Commands por Servicio

### Microservicios (Hono + TypeScript)

**Build Command**: `pnpm install && pnpm build`
**Start Command**: `node dist/index.js`

### Microfrontends (Vite + React)

**Build Command**: `pnpm install && pnpm build`
**Start Command**: `pnpm preview` o `node server.js`

---

## Checklist Pre-Deploy

### Antes de hacer push

- [ ] Tests pasan: `pnpm test`
- [ ] Build exitoso: `pnpm build`
- [ ] Lint sin errores: `pnpm lint`
- [ ] Sin secrets en codigo (usar `.env`)
- [ ] `.gitignore` actualizado

### Despues del deploy

- [ ] Health check responde
- [ ] Logs sin errores
- [ ] Funcionalidad verificada

---

## Troubleshooting

### Build falla en Railway

1. **Verificar Root Directory**: Debe apuntar a la carpeta del servicio
2. **Verificar Build Command**: Asegurar que `pnpm install` se ejecuta primero
3. **Ver logs**: Railway Dashboard > Service > Deployments > Build Logs

### Servicio no conecta a otro

1. **Verificar variables de referencia**: `${{servicio.VARIABLE}}`
2. **Usar Private Domain** para comunicacion interna
3. **Verificar que el servicio destino este corriendo**

### Cambios no triggean deploy

1. **Verificar Watch Paths**: El archivo modificado debe estar incluido
2. **Verificar branch**: Railway escucha `main` por defecto
3. **Forzar deploy**: Railway Dashboard > Service > Trigger Deploy

### Error "module not found" para @municipal/shared

En monorepos, Railway necesita acceso al paquete compartido:

```json
// package.json del servicio
{
  "dependencies": {
    "@municipal/shared": "workspace:*"
  }
}
```

Y asegurar que el build incluye el workspace:
```bash
# Install desde el root
pnpm install --filter=api-identidad...
```

---

## Dominios

### Automaticos (Railway)
```
https://[servicio]-production.up.railway.app
```

### Custom Domains
1. Railway Dashboard > Service > Settings > Domains
2. Add Custom Domain
3. Configurar DNS con CNAME al dominio de Railway

---

## Backups y Rollback

### PostgreSQL
- Railway hace backups automaticos
- Point-in-time recovery disponible

### Rollback de Servicio
1. Railway Dashboard > Service > Deployments
2. Click en deployment anterior
3. "Rollback to this deployment"

---

## Recursos

- [Railway Monorepo Docs](https://docs.railway.app/guides/monorepo)
- [Railway Variables Reference](https://docs.railway.app/develop/variables)
- [Railway CLI](https://docs.railway.app/develop/cli)
