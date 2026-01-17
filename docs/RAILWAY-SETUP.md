# Railway Deployment Configuration

## Project Structure

```
sistema-municipal (Railway Project)
├── postgres          # PostgreSQL Database
├── api-gateway       # API Gateway (puerto 3000)
├── api-identidad     # Microservice: Identidad
├── api-autorizacion  # Microservice: Autorización
├── api-contabilidad  # Microservice: Contabilidad
├── mf-shell          # Microfrontend: Shell (Host)
├── mf-store          # Microfrontend: Store
├── mf-ui             # Microfrontend: UI Components
└── mf-contabilidad   # Microfrontend: Contabilidad
```

## Environments

| Environment | Branch | Trigger |
|-------------|--------|---------|
| staging | develop | Push automático |
| production | main | Release tag o manual |

## GitHub Secrets Required

Configura estos secrets en GitHub → Settings → Secrets → Actions:

```
RAILWAY_TOKEN=<tu-railway-token>
```

## GitHub Variables Required

Configura estas variables por environment:

### Staging Environment
```
STAGING_URL=https://mf-shell-staging.up.railway.app
STAGING_API_URL=https://api-gateway-staging.up.railway.app
STAGING_MF_STORE_URL=https://mf-store-staging.up.railway.app
STAGING_MF_UI_URL=https://mf-ui-staging.up.railway.app
STAGING_MF_CONTABILIDAD_URL=https://mf-contabilidad-staging.up.railway.app
```

### Production Environment
```
PRODUCTION_URL=https://mf-shell.up.railway.app
PRODUCTION_API_URL=https://api-gateway.up.railway.app
PRODUCTION_MF_STORE_URL=https://mf-store.up.railway.app
PRODUCTION_MF_UI_URL=https://mf-ui.up.railway.app
PRODUCTION_MF_CONTABILIDAD_URL=https://mf-contabilidad.up.railway.app
```

## Railway Service Configuration

### PostgreSQL (postgres)
- Template: Railway PostgreSQL
- Variables auto-generadas: `DATABASE_URL`, `PGHOST`, `PGPORT`, etc.

### Microservices (api-*)
Variables de entorno requeridas:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{postgres.DATABASE_URL}}
JWT_SECRET=<generar-secret-seguro>
JWT_EXPIRES_IN=24h

# Redis (si usas caché)
REDIS_URL=${{redis.REDIS_URL}}

# Comunicación inter-servicios
API_IDENTIDAD_URL=http://api-identidad.railway.internal:3000
API_AUTORIZACION_URL=http://api-autorizacion.railway.internal:3000
API_CONTABILIDAD_URL=http://api-contabilidad.railway.internal:3000
```

### Microfrontends (mf-*)
Variables de entorno para build:
```env
VITE_API_URL=https://api-gateway.up.railway.app
VITE_MF_STORE_URL=https://mf-store.up.railway.app
VITE_MF_UI_URL=https://mf-ui.up.railway.app
VITE_MF_CONTABILIDAD_URL=https://mf-contabilidad.up.railway.app
```

## Railway Dashboard Setup (Manual)

### 1. Conectar Repositorio
Para cada servicio en Railway Dashboard:
1. Click en el servicio
2. Settings → Source → Connect Repo
3. Seleccionar `carlos2280/sistema-municipal`
4. Configurar Root Directory según la tabla:

| Servicio | Root Directory |
|----------|---------------|
| api-gateway | `apps/microservices/api-gateway` |
| api-identidad | `apps/microservices/api-identidad` |
| api-autorizacion | `apps/microservices/api-autorizacion` |
| api-contabilidad | `apps/microservices/api-contabilidad` |
| mf-shell | `apps/microfrontends/mf_shell` |
| mf-store | `apps/microfrontends/mf_store` |
| mf-ui | `apps/microfrontends/mf_ui` |
| mf-contabilidad | `apps/microfrontends/mf_contabilidad` |

### 2. Configurar Watch Paths
En cada servicio → Settings → Triggers → Watch Paths:
- `apps/microservices/<servicio>/**`
- `packages/**`

### 3. Crear Environment Staging
1. Project Settings → Environments
2. Create Environment → Name: `staging`
3. Duplicar variables de production con valores de staging

### 4. Configurar Dominios
Para cada servicio público:
1. Settings → Domains → Generate Domain
2. (Opcional) Agregar dominio custom

## Internal Networking

Railway proporciona DNS interno automático:
- Formato: `<service-name>.railway.internal`
- Puerto: El que expone el servicio

Ejemplo de comunicación entre servicios:
```typescript
// En api-gateway
const identidadUrl = process.env.API_IDENTIDAD_URL 
  || 'http://api-identidad.railway.internal:3000';
```

## Scaling (Futuro)

Para escalar servicios individuales:
1. Service → Settings → Scaling
2. Configurar replicas (requiere plan Pro)
3. Railway balancea automáticamente

## Monitoring

- **Logs**: Railway Dashboard → Service → Logs
- **Metrics**: Railway Dashboard → Service → Metrics
- **Health**: Configurado via `railway.toml` → healthcheckPath

## Troubleshooting

### Build fails
```bash
# Ver logs de build en Railway Dashboard
# Verificar que Dockerfile está en el root directory correcto
```

### Service no responde
```bash
# Verificar health check
curl https://<service>.up.railway.app/health

# Verificar logs en tiempo real
railway logs --service <service-name>
```

### Variables no disponibles
```bash
# Las variables con ${{service.VAR}} se resuelven en deploy
# Verificar que el servicio referenciado existe
```
