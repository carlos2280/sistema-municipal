# Templates de Documentacion

## Diseno Tecnico

```markdown
# Introduccion
Contexto del sistema, proposito del documento, audiencia objetivo.

# Alcance
Que cubre y que NO cubre este diseno. Sistemas involucrados.

# Arquitectura
Diagrama de componentes (Mermaid/PlantUML). Responsabilidad de cada componente.

# Modelo de Datos
Diagrama ER. Tablas con columnas, tipos y relaciones.

# Interfaces / API
Tabla de endpoints: metodo, ruta, descripcion, request/response.
Diagrama de secuencia para flujos principales.

# Seguridad
Autenticacion, autorizacion, cifrado, validacion de input.

# Despliegue
Diagrama de infraestructura. Entornos, variables, CI/CD.
```

## Manual de Usuario

```markdown
# Introduccion
# Requisitos Previos
# Instalacion / Acceso
# Uso Basico (flujo principal paso a paso)
# Funcionalidades (seccion por modulo/funcionalidad)
# Preguntas Frecuentes
# Soporte
```

## Acta de Reunion

```markdown
# Datos de la Reunion (fecha, hora, lugar, convocante)
# Asistentes (tabla: nombre, rol, asistencia)
# Temas Tratados
# Acuerdos (tabla: #, acuerdo, responsable, fecha limite)
# Proximos Pasos
```

## Especificacion de Requerimientos

```markdown
# Introduccion
# Descripcion General
# Requerimientos Funcionales
  ## RF-001: [Nombre] — Prioridad, Descripcion, Criterio de aceptacion
# Requerimientos No Funcionales
  ## RNF-001: [Nombre] — Categoria, Descripcion, Metrica
# Interfaces
# Restricciones
# Apendices
```

## Informe de Pruebas

```markdown
# Resumen Ejecutivo (X de Y casos exitosos, bloqueantes: N)
# Alcance de Pruebas
# Ambiente de Pruebas (tabla: componente, version, entorno)
# Casos de Prueba
  ## CP-001: Precondicion, Pasos, Esperado, Obtenido, Evidencia
# Resumen de Resultados (tabla: estado, cantidad, %)
# Defectos Encontrados (tabla: ID, severidad, descripcion, estado)
# Conclusiones (apto/no apto para produccion)
```

## Informe General

```markdown
# Resumen (3-5 lineas, hallazgos principales)
# Contexto (antecedentes, motivacion, periodo analizado)
# Desarrollo (cuerpo principal, datos, metricas, graficos)
# Conclusiones
# Recomendaciones (acciones sugeridas con prioridad)
```
