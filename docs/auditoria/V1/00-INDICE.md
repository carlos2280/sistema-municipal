# Documentación de Arquitectura - Sistema Municipal V1

## Índice de Documentos

### Arquitectura de Microfrontends

| Documento | Descripción | Prioridad |
|-----------|-------------|-----------|
| [01-MODULE-FEDERATION-REFERENCE.md](./01-MODULE-FEDERATION-REFERENCE.md) | Referencia completa de `@originjs/vite-plugin-federation` | Alta |
| [02-SHARED-CONFIG-GUIDE.md](./02-SHARED-CONFIG-GUIDE.md) | Configuración de dependencias compartidas | Alta |
| [03-ERROR-HANDLING-RESILIENCE.md](./03-ERROR-HANDLING-RESILIENCE.md) | Manejo de errores y resiliencia | Alta |
| [04-VITE-CONFIG-TEMPLATES.md](./04-VITE-CONFIG-TEMPLATES.md) | Templates de configuración para cada tipo de MF | Media |

### Arquitectura de Tipos Compartidos

| Documento | Descripción | Prioridad |
|-----------|-------------|-----------|
| [05-TIPOS-COMPARTIDOS-ARQUITECTURA.md](./05-TIPOS-COMPARTIDOS-ARQUITECTURA.md) | Estrategia para compartir TypeScript | Alta |
| [06-CONTRATOS-API-ZOD.md](./06-CONTRATOS-API-ZOD.md) | Validación E2E con Zod schemas | Media |

### Guías para Desarrolladores

| Documento | Descripción | Prioridad |
|-----------|-------------|-----------|
| [07-NUEVO-MICROFRONTEND-GUIDE.md](./07-NUEVO-MICROFRONTEND-GUIDE.md) | Cómo crear un nuevo microfrontend | Alta |
| [08-CHECKLIST-NUEVO-DESARROLLADOR.md](./08-CHECKLIST-NUEVO-DESARROLLADOR.md) | Checklist de onboarding | Media |

---

## Diagnóstico Actual del Proyecto

### Puntuación General

| Área | Puntuación | Estado |
|------|------------|--------|
| Module Federation Config | 5/10 | Requiere mejoras críticas |
| Shared Dependencies | 4/10 | Sin singleton, sin versiones |
| Error Handling | 2/10 | Sin implementar |
| Tipos Compartidos | 6/10 | Parcialmente centralizado |
| Aislamiento de Dominios | 3/10 | God Module anti-pattern |

### Problemas Críticos Identificados

1. **Sin `singleton: true`** en dependencias críticas (React, Redux)
2. **Sin `import: false`** en remotes (duplicación de bundles)
3. **Sin Error Boundaries** (un MF falla = todo falla)
4. **God Module** en mf_store (expone todo a todos)
5. **Tipos duplicados** en múltiples MFs

---

## Orden de Lectura Recomendado

### Para Arquitectos/Tech Leads
1. `01-MODULE-FEDERATION-REFERENCE.md`
2. `02-SHARED-CONFIG-GUIDE.md`
3. `05-TIPOS-COMPARTIDOS-ARQUITECTURA.md`

### Para Desarrolladores Nuevos
1. `08-CHECKLIST-NUEVO-DESARROLLADOR.md`
2. `07-NUEVO-MICROFRONTEND-GUIDE.md`
3. `04-VITE-CONFIG-TEMPLATES.md`

### Para DevOps/SRE
1. `03-ERROR-HANDLING-RESILIENCE.md`
2. `02-SHARED-CONFIG-GUIDE.md`

---

## Convenciones de Esta Documentación

- Los bloques de código marcados con `// ❌ ACTUAL` representan la configuración problemática actual
- Los bloques marcados con `// ✅ RECOMENDADO` representan la configuración óptima
- Las tablas comparativas usan emojis: ✅ correcto, ⚠️ advertencia, ❌ incorrecto

---

*Última actualización: Enero 2026*
*Versión: 1.0*
