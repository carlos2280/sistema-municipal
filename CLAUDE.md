# Sistema Municipal - Instrucciones

## MCP Servers disponibles
Este proyecto tiene MCPs configurados en `.mcp.json` que se cargan como **deferred tools**.
Los MCPs NO aparecen automáticamente - debes usar `ToolSearch` para cargarlos antes de usarlos.

### MCPs disponibles:
- **railway** - Deploy y gestión de proyectos Railway
- **postgres** - Base de datos PostgreSQL
- **filesystem** - Acceso a archivos del workspace
- **memory** - Memoria persistente (knowledge graph)
- **github** - Repositorios y PRs de GitHub
- **playwright** - Automatización de navegador
- **mysql** - Base de datos MySQL
- **documents** - Generación de documentos
- **pencil** - Diseño UI/UX con archivos .pen

### IMPORTANTE: Cómo usar los MCPs
Cuando el usuario pida algo relacionado con un MCP (Railway, Postgres, GitHub, etc.):
1. PRIMERO usa `ToolSearch` con query `+nombre_mcp` para cargar los tools
2. DESPUES usa el tool correspondiente

Ejemplo: si el usuario pide "lista proyectos de Railway":
1. ToolSearch query: "+railway list"
2. Usar mcp__railway__railway_list_projects

NUNCA digas "el MCP no está disponible" sin antes intentar cargarlo con ToolSearch.
