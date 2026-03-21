---
paths:
  - "infra/**"
  - "**/Dockerfile"
  - ".github/workflows/cd-*.yml"
  - "docker-compose*.yml"
  - "railway.json"
  - "railway.toml"
---

# Railway Deploy — Reglas

## Topologia de entornos

| Rama | Entorno | Proyecto Railway |
|------|---------|-----------------|
| `main` | **Produccion** | `sistema-municipal` + `sistema-municipal-platform` |
| `develop` | **Staging** | (mismo proyecto, environments separados) |

## Proyectos Railway

### sistema-municipal
Servicios activos:

| Servicio | Tipo | Descripcion |
|----------|------|-------------|
| `api-gateway` | Microservicio | Punto de entrada HTTP, enrutamiento |
| `api-identidad` | Microservicio | Autenticacion, JWT, 2FA |
| `api-autorizacion` | Microservicio | RBAC, perfiles, permisos |
| `api-contabilidad` | Microservicio | Modulo contabilidad |
| `api-chat` | Microservicio | Mensajeria en tiempo real |
| `api-platform` | Microservicio | Gestion de tenants y modulos |
| `mf-shell` | Microfrontend | Shell principal (puerto 5030) |
| `mf-ui` | Microfrontend | Componentes compartidos (puerto 5011) |
| `mf-store` | Microfrontend | Redux store compartido (puerto 5010) |
| `mf-contabilidad` | Microfrontend | Modulo contabilidad (puerto 5020) |
| `mf-chat` | Microfrontend | Modulo chat (puerto 5021) |
| `mf-configuracion` | Microfrontend | Modulo configuracion (puerto 5040) |
| `Postgres` | Base de datos | PostgreSQL principal |
| `Redis` | Base de datos | Cache y sesiones |

### sistema-municipal-platform
| Servicio | Tipo | Descripcion |
|----------|------|-------------|
| `admin-panel` | Frontend | Panel de administracion SaaS (Vite) |

## Reglas antes de hacer cambios

- **NUNCA modificar variables de entorno en Railway directamente** sin documentar en `.env.example` del servicio afectado
- **NUNCA renombrar un servicio en Railway** sin actualizar las referencias en `VITE_MF_*_URL` de los otros servicios
- **NUNCA borrar un servicio en Railway** sin confirmar con el usuario — es irreversible
- Antes de tocar `railway.json` de cualquier servicio, leerlo y entender el `startCommand` y `healthcheckPath`

## Variables criticas de entorno

Cada microservicio requiere al menos:
- `DATABASE_URL` → apunta a Postgres de Railway (no hardcodear)
- `JWT_SECRET` → nunca en codigo, solo en Railway variables
- `GATEWAY_SECRET` → header de autenticacion interna entre servicios
- `REDIS_URL` → solo para api-gateway, api-chat, api-identidad

Los microfrontends requieren:
- `VITE_MF_*_URL` → URLs de otros microfrontends (Module Federation remotes)
- `VITE_API_GATEWAY_URL` → URL del api-gateway

## Flujo de deploy

```
git push origin feature/x   →  sin deploy
PR merge → develop          →  deploy automatico a staging
PR merge → main             →  deploy automatico a produccion
```

## Diagnostico rapido via MCP Railway

Antes de escalar un problema o hacer un rollback, usar MCP Railway para:
1. `railway_get_logs(serviceId)` → ver logs del servicio afectado
2. `railway_list_deployments(serviceId)` → identificar el deployment problematico
3. `railway_get_deployment(deploymentId)` → estado y error del deploy
4. `railway_redeploy(deploymentId)` → solo si el usuario lo confirma explicitamente
