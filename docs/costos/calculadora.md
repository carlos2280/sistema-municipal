# Calculadora de Costos Railway - Sistema Municipal

## Fórmulas de Cálculo

### Variables Base
```
PRECIO_RAM_GB_MES     = $10.00
PRECIO_VCPU_MES       = $20.00
PRECIO_STORAGE_GB_MES = $0.15
PRECIO_EGRESS_GB      = $0.05
```

### Fórmula General
```
Costo Mensual = (RAM_GB × $10) + (vCPU × $20) + (Storage_GB × $0.15) + (Egress_GB × $0.05)
```

---

## Calculadora por Número de Usuarios

### Supuestos del Sistema Municipal

| Métrica | Valor por Usuario Concurrente |
|---------|------------------------------|
| RAM adicional | ~30 MB |
| vCPU adicional | ~0.02 |
| Egress/mes | ~0.5 GB |
| Storage growth/mes | ~0.1 GB |

### Tabla de Estimación Rápida

| Usuarios | RAM Total | vCPU Total | Egress | Costo Est. |
|----------|-----------|------------|--------|------------|
| 5 | 1.15 GB | 0.9 | 2.5 GB | ~$30 |
| 10 | 1.3 GB | 1.0 | 5 GB | ~$35 |
| 25 | 1.75 GB | 1.3 | 12.5 GB | ~$45 |
| 50 | 2.5 GB | 1.8 | 25 GB | ~$65 |
| 100 | 4.0 GB | 2.8 | 50 GB | ~$95 |
| 200 | 7.0 GB | 4.8 | 100 GB | ~$160 |
| 500 | 16.0 GB | 10.8 | 250 GB | ~$385 |

---

## Ejemplos de Cálculo Detallado

### Ejemplo: 50 Usuarios Concurrentes

```
Base del sistema (9 servicios idle):
- RAM base:    1.0 GB
- vCPU base:   0.8

Carga de 50 usuarios:
- RAM extra:   50 × 0.030 GB = 1.5 GB
- vCPU extra:  50 × 0.020    = 1.0

Totales:
- RAM:     1.0 + 1.5 = 2.5 GB    → 2.5 × $10 = $25
- vCPU:    0.8 + 1.0 = 1.8       → 1.8 × $20 = $36
- Storage: 5 GB                  → 5 × $0.15 = $0.75
- Egress:  50 × 0.5 = 25 GB      → 25 × $0.05 = $1.25
                                   ──────────────────
                                   Total: ~$63/mes
```

### Ejemplo: 100 Usuarios Concurrentes

```
Base del sistema:
- RAM base:    1.0 GB
- vCPU base:   0.8

Carga de 100 usuarios:
- RAM extra:   100 × 0.030 GB = 3.0 GB
- vCPU extra:  100 × 0.020    = 2.0

Totales:
- RAM:     1.0 + 3.0 = 4.0 GB   → 4.0 × $10 = $40
- vCPU:    0.8 + 2.0 = 2.8      → 2.8 × $20 = $56
- Storage: 10 GB                → 10 × $0.15 = $1.50
- Egress:  100 × 0.5 = 50 GB    → 50 × $0.05 = $2.50
                                  ──────────────────
                                  Total: ~$100/mes
```

---

## Costos Adicionales a Considerar

### Ambiente Staging (Opcional)

Si mantienes staging activo 24/7:
- Agrega ~30-40% del costo de producción
- Recomendación: usar sleep/wake para ahorrar

### Picos de Uso

Para horarios de oficina municipales (8am-6pm):
- Multiplicar uso promedio × 1.3 para estimar picos
- Railway cobra por uso real, no por picos

### Build Minutes

- Los builds consumen recursos
- ~$0.50-1.00 por build completo
- Con 20 deploys/mes: +$10-20

---

## Optimización de Costos

### Recomendaciones

| Optimización | Ahorro Estimado |
|--------------|-----------------|
| Sleep staging cuando no se usa | 30-40% en staging |
| Usar caché de builds | 20% en builds |
| Comprimir responses (gzip) | 10-15% en egress |
| Optimizar queries DB | 5-10% en vCPU |
| Lazy loading microfrontends | 10-20% en egress |

### Configuración Recomendada por Servicio

```toml
# railway.toml optimizado
[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

# Para microfrontends (bajo consumo)
[deploy.resources]
memory = "256Mi"  # Limitar memoria
cpu = "0.25"      # Limitar CPU
```

---

## Alertas de Costos Sugeridas

Configurar en Railway Dashboard:

| Alerta | Umbral | Acción |
|--------|--------|--------|
| Gasto diario | >$5 | Revisar uso |
| Gasto mensual | >80% presupuesto | Optimizar |
| RAM por servicio | >2GB constante | Investigar leak |
| Egress diario | >10GB | Verificar CDN |

---

*Última actualización: 2026-01-19*
