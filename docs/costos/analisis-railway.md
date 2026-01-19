# Análisis de Costos - Sistema Municipal en Railway

**Fecha de análisis:** 2026-01-19
**Proyecto:** sistema-municipal
**ID Proyecto:** `8d4f52bd-6e36-4d06-8d5a-c15bc649b9ed`
**Plan actual:** Hobby

---

## 1. Arquitectura del Proyecto

### Servicios Desplegados (9 servicios)

| Tipo | Servicio | Descripción | Réplicas |
|------|----------|-------------|----------|
| **API** | api-gateway | Gateway principal (Hono/Node.js) | 1 |
| **API** | api-identidad | Autenticación y usuarios | 1 |
| **API** | api-autorizacion | Permisos y roles | 1 |
| **API** | api-contabilidad | Módulo contable | 1 |
| **Frontend** | mf-shell | Shell de microfrontends | 1 |
| **Frontend** | mf-ui | Componentes UI compartidos | 1 |
| **Frontend** | mf-store | Estado global (Zustand) | 1 |
| **Frontend** | mf-contabilidad | Módulo contabilidad UI | 1 |
| **Database** | Postgres | PostgreSQL 17 | 1 |

### Ambientes
- **Production:** `cea1a97c-0016-487e-966c-5a4e7f8045e0`
- **Staging:** `ae77bb5f-18ef-49a3-96db-0f0cf0b2a551`

---

## 2. Precios de Railway (Enero 2026)

### Planes Disponibles

| Plan | Costo Base | Créditos Incluidos | Límites por Servicio |
|------|------------|-------------------|---------------------|
| **Hobby** | $5/mes | $5 uso incluido | 8 GB RAM, 8 vCPU |
| **Pro** | $20/mes por usuario | $20 uso incluido | 32 GB RAM, 32 vCPU |
| **Enterprise** | Desde $1,000/mes | Personalizado | Hasta 2 TB RAM, 112 vCPU |

### Tarifas de Recursos

| Recurso | Costo por minuto | Costo mensual aprox. |
|---------|------------------|---------------------|
| **Memoria** | $0.000231/GB/min | ~$10/GB/mes |
| **vCPU** | $0.000463/vCPU/min | ~$20/vCPU/mes |
| **Egress** | $0.000047683716/KB | ~$0.05/GB |
| **Storage** | $0.000003472222/GB/min | ~$0.15/GB/mes |

---

## 3. Estimación de Costos por Escenarios de Usuarios

### Consumo Base Estimado por Servicio

Basado en aplicaciones Node.js/React típicas:

| Servicio | RAM (idle) | RAM (activo) | vCPU (idle) | vCPU (activo) |
|----------|------------|--------------|-------------|---------------|
| api-gateway | 128 MB | 256 MB | 0.1 | 0.5 |
| api-identidad | 128 MB | 256 MB | 0.1 | 0.5 |
| api-autorizacion | 128 MB | 256 MB | 0.1 | 0.3 |
| api-contabilidad | 128 MB | 384 MB | 0.1 | 0.6 |
| mf-shell | 64 MB | 128 MB | 0.05 | 0.2 |
| mf-ui | 64 MB | 128 MB | 0.05 | 0.2 |
| mf-store | 64 MB | 128 MB | 0.05 | 0.2 |
| mf-contabilidad | 64 MB | 128 MB | 0.05 | 0.2 |
| Postgres | 256 MB | 512 MB | 0.2 | 0.8 |

### Escenario 1: Desarrollo/Testing (1-5 usuarios)

```
RAM Total:     ~1 GB constante
vCPU Total:    ~0.8 vCPU promedio
Storage DB:    ~1 GB

Cálculo mensual:
- RAM:     1 GB × $10/mes     = $10
- vCPU:    0.8 × $20/mes      = $16
- Storage: 1 GB × $0.15/mes   = $0.15
- Egress:  ~5 GB × $0.05      = $0.25
                              --------
Subtotal recursos:              $26.40
- Crédito Hobby incluido:      -$5.00
                              --------
TOTAL HOBBY:                    $26.40/mes (base $5 + $21.40 extra)
```

### Escenario 2: Producción Baja (10-25 usuarios concurrentes)

```
RAM Total:     ~2.5 GB promedio
vCPU Total:    ~1.5 vCPU promedio
Storage DB:    ~5 GB
Egress:        ~20 GB/mes

Cálculo mensual:
- RAM:     2.5 GB × $10/mes   = $25
- vCPU:    1.5 × $20/mes      = $30
- Storage: 5 GB × $0.15/mes   = $0.75
- Egress:  20 GB × $0.05      = $1.00
                              --------
Subtotal recursos:              $56.75
- Crédito Hobby incluido:      -$5.00
                              --------
TOTAL HOBBY:                    $56.75/mes
TOTAL PRO (1 seat):             $56.75/mes (base $20 + $36.75 extra)
```

### Escenario 3: Producción Media (50-100 usuarios concurrentes)

```
RAM Total:     ~5 GB promedio (picos de 8 GB)
vCPU Total:    ~3 vCPU promedio
Storage DB:    ~20 GB
Egress:        ~100 GB/mes

Cálculo mensual:
- RAM:     5 GB × $10/mes     = $50
- vCPU:    3 × $20/mes        = $60
- Storage: 20 GB × $0.15/mes  = $3.00
- Egress:  100 GB × $0.05     = $5.00
                              --------
Subtotal recursos:              $118.00
```

**Recomendación: Plan Pro**
- Base Pro: $20/mes
- Uso recursos: $98/mes
- **TOTAL: ~$118/mes**

### Escenario 4: Producción Alta (200-500 usuarios concurrentes)

```
RAM Total:     ~12 GB promedio (requiere escalar réplicas)
vCPU Total:    ~8 vCPU promedio
Storage DB:    ~100 GB
Egress:        ~500 GB/mes

Cálculo mensual:
- RAM:     12 GB × $10/mes    = $120
- vCPU:    8 × $20/mes        = $160
- Storage: 100 GB × $0.15/mes = $15.00
- Egress:  500 GB × $0.05     = $25.00
                              --------
Subtotal recursos:              $320.00
```

**Recomendación: Plan Pro con múltiples réplicas**
- Base Pro: $20/mes
- Uso recursos: $300/mes
- **TOTAL: ~$320/mes**

---

## 4. Tabla Resumen de Costos

| Usuarios Concurrentes | Plan Recomendado | Costo Mensual Est. | Costo Anual Est. |
|----------------------|------------------|-------------------|------------------|
| 1-5 (dev/test) | Hobby | $25-35 | $300-420 |
| 10-25 | Hobby/Pro | $50-70 | $600-840 |
| 50-100 | Pro | $100-150 | $1,200-1,800 |
| 200-500 | Pro (scaled) | $300-400 | $3,600-4,800 |
| 500+ | Enterprise | $500+ | Negociable |

---

## 5. Análisis de Velocidad y Performance

### Ventajas de Railway

| Aspecto | Evaluación | Comentario |
|---------|------------|------------|
| **Cold Start** | Bueno | ~2-5 segundos para Node.js |
| **Latencia** | Muy Buena | Datacenter us-east4 (baja latencia Americas) |
| **Autoescalado** | Manual | Requiere configurar réplicas manualmente |
| **CDN** | No incluido | Debe usar Cloudflare/Vercel para assets |
| **Database** | Bueno | PostgreSQL optimizado, conexiones persistentes |

### Factores de Velocidad

1. **Para usuarios en Latinoamérica:**
   - Región `us-east4` ofrece latencia de ~50-100ms
   - Considerar CDN para assets estáticos

2. **Para la arquitectura de microfrontends:**
   - Module Federation funciona bien
   - Los chunks se sirven desde mismo origen

3. **Para las APIs:**
   - Node.js con Hono es muy eficiente
   - JWT validation es rápida
   - Pool de conexiones PostgreSQL optimiza queries

### Benchmark Esperado

| Métrica | Valor Esperado | Condición |
|---------|---------------|-----------|
| TTFB (Time to First Byte) | <200ms | Sin cold start |
| API Response Time | <100ms | Queries simples |
| Page Load (shell) | <2s | Con caché |
| Database Query | <50ms | Índices optimizados |

---

## 6. Estabilidad de la Arquitectura Railway

### Puntos Fuertes

| Característica | Estado | Descripción |
|---------------|--------|-------------|
| **Uptime SLA** | 99.9% (Pro) | Garantizado en plan Pro |
| **Health Checks** | Configurado | Todos los servicios tienen `/health` |
| **Restart Policy** | ON_FAILURE | Auto-restart con max 10 reintentos |
| **Multi-Region** | Disponible | Configurado `us-east4-eqdc4a` |
| **Deployments** | Git-based | Auto-deploy en push a main |
| **Rollbacks** | Sí | Fácil revertir a versión anterior |

### Riesgos Identificados

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Build failures (actual) | Alta | Resolver error pnpm/catalog |
| Sin redundancia DB | Media | Habilitar backups automáticos |
| Single replica | Media | Escalar en producción |
| Sin rate limiting | Media | Implementar en api-gateway |
| Sin WAF | Baja | Usar Cloudflare delante |

### Recomendaciones para Producción

1. **Habilitar backups de PostgreSQL** (incluido en Railway)
2. **Configurar alertas** en el dashboard de Railway
3. **Escalar a 2+ réplicas** para APIs críticas
4. **Usar Cloudflare** como proxy/CDN
5. **Monitoreo externo** (Uptime Robot, Better Stack)

---

## 7. Comparativa con Alternativas

| Plataforma | Costo 50 usuarios | Complejidad | Escalabilidad |
|------------|------------------|-------------|---------------|
| **Railway** | ~$100-150/mes | Baja | Media |
| **Render** | ~$100-150/mes | Baja | Media |
| **Fly.io** | ~$80-120/mes | Media | Alta |
| **AWS ECS** | ~$150-250/mes | Alta | Muy Alta |
| **GCP Cloud Run** | ~$100-200/mes | Media | Alta |
| **DigitalOcean Apps** | ~$80-120/mes | Baja | Media |

**Veredicto:** Railway es una opción equilibrada para este sistema. El costo es competitivo y la simplicidad de deployment es excelente para equipos pequeños.

---

## 8. Conclusiones

### Para tu Sistema Municipal:

| Fase | Usuarios Est. | Costo Mensual | Plan |
|------|--------------|---------------|------|
| MVP/Piloto | 5-10 | $30-50 | Hobby |
| Lanzamiento | 25-50 | $70-100 | Pro |
| Crecimiento | 100-200 | $150-250 | Pro (scaled) |
| Madurez | 500+ | $400+ | Enterprise |

### Respuesta a tus preguntas:

1. **¿Cuánto saldría mensualmente?**
   - Con 10-25 usuarios activos: **~$50-70/mes**
   - Con 50-100 usuarios activos: **~$100-150/mes**

2. **¿Es rápido?**
   - **Sí**, para cargas típicas de sistemas municipales
   - Latencia API <100ms, Page Load <2s
   - Cold starts ocasionales de ~3-5s

3. **¿Railway proporciona arquitectura estable?**
   - **Sí**, con las siguientes consideraciones:
     - 99.9% uptime en plan Pro
     - Auto-restart y health checks funcionan bien
     - Requiere configuración adicional para alta disponibilidad
     - Backups de DB recomendados para producción

---

## Fuentes

- [Railway Pricing Plans](https://docs.railway.com/reference/pricing/plans)
- [Railway Pricing Page](https://railway.com/pricing)
- [SaaS Price Pulse - Railway](https://www.saaspricepulse.com/tools/railway)

---

*Documento generado automáticamente - Última actualización: 2026-01-19*
