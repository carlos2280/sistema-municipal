---
name: professional-docs
description: Guia para generar documentacion tecnica profesional usando el MCP documents. Aplicar cuando el usuario pida crear documentos, reportes, specs, diagramas o cualquier entregable de documentacion con el MCP documents.
context: fork
allowed-tools: [Read, Grep, Glob, Bash]
---

# Skill: Documentacion Profesional con MCP Documents

Convenciones para generar documentacion tecnica profesional usando las herramientas del MCP `documents`.

## Regla critica: diagramas siempre embebidos

**NUNCA generar diagramas como archivos separados cuando se esta creando un documento.** Los diagramas deben ir como bloques ` ```mermaid ` o ` ```plantuml ` directamente dentro del contenido Markdown que se pasa a `documents_smart_generate` o `documents_generate`. El MCP renderiza estos bloques automaticamente y los incrusta inline en el DOCX resultante.

- **CORRECTO**: incluir el diagrama como bloque de codigo dentro del `content` del documento
- **INCORRECTO**: llamar a `documents_render_mermaid` para generar PNGs y luego referenciarlos

## Herramienta preferida

Usar siempre `documents_smart_generate` como herramienta principal. Solo usar `documents_generate` cuando se necesite control explicito sobre `output_path`, `code`, `author` o `version_history`.

## Tipos de documento

| Tipo | Cuando usar |
|------|-------------|
| `diseno-tecnico` | Arquitectura, APIs, diseno de sistema |
| `manual-usuario` | Guias de uso, tutoriales, onboarding |
| `requerimientos` | Especificaciones funcionales y no funcionales |
| `informe-pruebas` | Resultados de testing, QA, validacion |
| `acta-reunion` | Minutas, acuerdos, seguimiento |
| `informe` | Reportes de avance, analisis, auditoria |
| `simple` | Notas rapidas, documentos sin estructura formal |

## Template por defecto: `ntt-data`

Siempre usar template `ntt-data` (portada con logo, colores corporativos, clasificacion "Confidencial") salvo que el usuario pida explicitamente otro.

- Incluir "simple" o "basico" en description → template `default`
- Por defecto → template `ntt-data`

## Estructuras de contenido

Para las estructuras detalladas de cada tipo de documento (diseno tecnico, manual, acta, requerimientos, informe de pruebas, informe general), consultar:

!`cat .claude/skills/professional-docs/templates.md`

## Diagramas Mermaid — Convenciones

- Maximo 10-12 nodos por diagrama
- Usar IDs cortos y labels descriptivos
- Agrupar con `subgraph` para zonas logicas
- En secuencia: maximo 5-6 participantes y 15 interacciones
- No mezclar espanol e ingles en labels del mismo diagrama

## Diagramas PlantUML — Convenciones

Tema por defecto: `vibrant`. Incluir siempre `!theme vibrant`.

## Screenshots de Playwright

Ruta en documentos: `/workspace/documentacion/screenshots/<nombre_archivo>.png`
NUNCA usar la ruta del host. El contenedor Documents solo ve `/workspace/`.

## Documentos largos (content_file)

Cuando el contenido supera ~50KB o tiene 8+ secciones con diagramas:
1. Escribir el Markdown a `/workspace/documentacion/tmp/`
2. Llamar a `documents_smart_generate` con `content_file`

## Flujo de trabajo

1. Analizar codigo/contexto para extraer informacion real
2. Elegir tipo de documento
3. Capturar screenshots si necesita evidencia visual (ANTES de generar)
4. Estructurar contenido siguiendo la plantilla
5. Incluir diagramas Mermaid/PlantUML embebidos
6. Generar con `documents_smart_generate`
7. Convertir a PDF si necesario: `documents_convert_to_pdf`

## Tarea: $ARGUMENTS

Genera la documentacion solicitada siguiendo estas convenciones.
