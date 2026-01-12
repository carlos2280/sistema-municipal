# Deployment

## Railway

El proyecto está desplegado en Railway con la siguiente configuración:

### Proyecto: Sistema Municipal - MVP
- **ID**: `ae3672a7-d017-44fe-993d-0fc1a13b2fad`
- **Environment**: production

### Servicios Desplegados

| Servicio | Tipo | Repositorio GitHub |
|----------|------|-------------------|
| api-identidad | Microservicio | carlos2280/api-identidad |
| api-contabilidad | Microservicio | carlos2280/api-contabilidad |
| api-autorizacion | Microservicio | carlos2280/api-autorizacion |
| api-gateway | Microservicio | carlos2280/api-gateway |
| mf_shell | Microfrontend | carlos2280/mf_shell |
| mf_ui | Microfrontend | carlos2280/mf_ui |
| mf_contabilidad | Microfrontend | carlos2280/mf_contabilidad |
| mf_store | Microfrontend | carlos2280/mf_store |
| Postgres | Database | Railway managed |

## Flujo de Deploy

### Automático (CI/CD)
1. Push a `main` en cualquier repositorio
2. Railway detecta el cambio automáticamente
3. Build y deploy del servicio modificado
4. Los demás servicios **no se ven afectados**

### Manual
```bash
# Desde el directorio del servicio
cd apps/microservices/api-identidad
railway up

# O desde cualquier lugar
railway up --service api-identidad
```

## Variables de Entorno en Railway

Configurar en el dashboard de Railway o via CLI:

```bash
# Ver variables actuales
railway variables

# Agregar variable
railway variables set JWT_SECRET=mi-secreto-super-seguro

# Variables por servicio
railway variables --service api-identidad
```

### Variables Requeridas

#### Todos los Microservicios
```
NODE_ENV=production
```

#### api-identidad
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=24h
```

#### api-contabilidad
```
DATABASE_URL=postgresql://...
```

#### api-autorizacion
```
DATABASE_URL=postgresql://...
```

#### Microfrontends
```
VITE_API_URL=https://api-gateway.railway.app
```

## Dominios

### Generados por Railway
Cada servicio tiene un dominio automático:
- `https://[servicio]-production.up.railway.app`

### Dominios Personalizados
```bash
# Agregar dominio personalizado
railway domain --service mf-shell
```

## Monitoreo

### Logs
```bash
# Logs en tiempo real
railway logs --service api-identidad

# Últimos 100 logs
railway logs --service api-identidad -n 100
```

### Dashboard
```bash
# Abrir dashboard en navegador
railway open
```

## Rollback

Si un deploy falla:

1. Ir al dashboard de Railway
2. Seleccionar el servicio
3. En "Deployments", click en un deploy anterior
4. "Rollback to this deployment"

O via CLI:
```bash
railway down  # Remueve el último deploy
```

## Base de Datos

### Backups
Railway hace backups automáticos de PostgreSQL.

### Conexión Local a DB de Producción
```bash
# Obtener URL de conexión
railway variables --service Postgres

# Conectar con psql
psql $DATABASE_URL
```

## Checklist Pre-Deploy

- [ ] Tests pasan localmente
- [ ] Build exitoso (`pnpm build`)
- [ ] Variables de entorno configuradas
- [ ] Migraciones de DB aplicadas
- [ ] Sin secrets en el código

## Troubleshooting

### Build falla
1. Verificar logs: `railway logs`
2. Probar build local: `pnpm build`
3. Verificar Dockerfile

### Servicio no responde
1. Verificar health check
2. Revisar logs de startup
3. Verificar variables de entorno

### Error de conexión a DB
1. Verificar `DATABASE_URL`
2. Verificar que Postgres esté running
3. Verificar network policies
