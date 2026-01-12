# MCP Servers - Guia Completa

## Que son los MCP Servers?

Los **Model Context Protocol (MCP) Servers** permiten a Claude Code interactuar con servicios externos como GitHub, Railway, bases de datos PostgreSQL, y mas. Funcionan como "plugins" que extienden las capacidades de Claude.

---

## Conceptos Clave

### Tipos de Configuracion

| Tipo | Archivo | Ubicacion | Uso |
|------|---------|-----------|-----|
| **Project** | `.mcp.json` | Raiz del proyecto | Compartido con el equipo via git |
| **User** | `~/.claude.json` | Home del usuario | Global para todos tus proyectos |
| **Local** | `~/.claude.json [project:...]` | Home del usuario | Privado para ti en un proyecto especifico |

### Importante

- **Claude Code CLI** debe ejecutarse **desde la carpeta del proyecto** para cargar los MCPs de `.mcp.json`
- **Claude Code VS Code Extension** se sincroniza con el CLI automaticamente
- El archivo `.claude/settings.json` **NO es leido** por Claude Code (usar `.mcp.json` en su lugar)

---

## Configuracion del Proyecto

### Archivo: `.mcp.json`

Este archivo en la raiz del proyecto define los MCPs disponibles:

```json
{
  "mcpServers": {
    "pg-municipal": {
      "type": "stdio",
      "command": "C:/Users/carca/.bun/bin/bun.exe",
      "args": [
        "run",
        "C:/Users/carca/Desktop/PROYECTOS/MUNICPALIDAD/mcp-servers/postgres/src/index.ts"
      ],
      "env": {
        "DATABASE_URL": "postgresql://postgres:123456@localhost:5432/muni_prueba",
        "DATABASE_SSL": "false"
      }
    },
    "github-municipal": {
      "command": "C:/Users/carca/.bun/bin/bun.exe",
      "args": [
        "run",
        "C:/Users/carca/Desktop/PROYECTOS/MUNICPALIDAD/mcp-servers/github/src/index.ts"
      ],
      "env": {
        "GITHUB_TOKEN": "TU_TOKEN_AQUI"
      }
    },
    "railway-municipal": {
      "command": "C:/Users/carca/.bun/bin/bun.exe",
      "args": [
        "run",
        "C:/Users/carca/Desktop/PROYECTOS/MUNICPALIDAD/mcp-servers/railway/src/index.ts"
      ],
      "env": {
        "RAILWAY_TOKEN": "TU_TOKEN_AQUI"
      }
    }
  }
}
```

---

## Servidores MCP del Proyecto

### 1. pg-municipal (PostgreSQL)

Servidor MCP personalizado para PostgreSQL con herramientas avanzadas.

**Ubicacion:** `mcp-servers/postgres/src/index.ts`

**Herramientas disponibles:**

| Herramienta | Descripcion |
|-------------|-------------|
| `pg_query` | Ejecuta cualquier query SQL |
| `pg_list_schemas` | Lista todos los schemas |
| `pg_list_tables` | Lista tablas de un schema |
| `pg_describe_table` | Describe estructura de una tabla |
| `pg_list_indexes` | Lista indices de una tabla |
| `pg_list_constraints` | Lista constraints (PK, FK, UNIQUE) |
| `pg_list_functions` | Lista funciones/procedures |
| `pg_list_views` | Lista vistas |
| `pg_get_view_definition` | Obtiene definicion de una vista |
| `pg_table_stats` | Estadisticas de una tabla |
| `pg_database_stats` | Estadisticas de la base de datos |
| `pg_active_connections` | Lista conexiones activas |
| `pg_running_queries` | Lista queries en ejecucion |
| `pg_explain` | Plan de ejecucion de una query |
| `pg_list_extensions` | Lista extensiones instaladas |
| `pg_list_roles` | Lista roles/usuarios |
| `pg_table_privileges` | Lista permisos de una tabla |
| `pg_foreign_keys` | Lista foreign keys |
| `pg_search_columns` | Busca columnas por nombre |
| `pg_sample_data` | Muestra datos de ejemplo |

**Variables de entorno:**
- `DATABASE_URL`: URL de conexion PostgreSQL
- `DATABASE_SSL`: "true" o "false"

### 2. github-municipal (GitHub)

Servidor MCP para interactuar con la API de GitHub.

**Ubicacion:** `mcp-servers/github/src/index.ts`

**Variables de entorno:**
- `GITHUB_TOKEN`: Personal Access Token
  - Crear en: https://github.com/settings/tokens/new
  - Permisos requeridos: `repo`, `workflow`, `read:user`

### 3. railway-municipal (Railway)

Servidor MCP para gestionar deployments en Railway.

**Ubicacion:** `mcp-servers/railway/src/index.ts`

**Variables de entorno:**
- `RAILWAY_TOKEN`: API Token
  - Crear en: https://railway.app/account/tokens

---

## Comandos CLI

### Listar MCPs

```bash
# Desde la carpeta del proyecto
cd C:\Users\carca\Desktop\PROYECTOS\MUNICPALIDAD
claude mcp list
```

### Agregar MCP

```bash
# Sintaxis
claude mcp add <nombre> <comando> [args...] -s <scope> -e KEY=value

# Ejemplo: agregar pg-municipal al proyecto
claude mcp add pg-municipal "C:/Users/carca/.bun/bin/bun.exe" run "C:/Users/carca/Desktop/PROYECTOS/MUNICPALIDAD/mcp-servers/postgres/src/index.ts" -s project -e DATABASE_URL=postgresql://postgres:123456@localhost:5432/muni_prueba -e DATABASE_SSL=false
```

### Eliminar MCP

```bash
claude mcp remove pg-municipal -s project
```

### Ver estado interactivo

```bash
# Iniciar sesion interactiva
claude

# Dentro de la sesion, ejecutar
/mcp
```

---

## Uso desde VS Code

### Extension Claude Code for VS Code

1. La extension se sincroniza automaticamente con el CLI
2. Los MCPs configurados via CLI aparecen en la extension
3. Para gestionar MCPs: Click en `/mcp` > "Manage MCP servers" > "Continue in Terminal"

### Verificar MCPs activos

En el chat de Claude Code, escribir:
```
/mcp
```

Esto muestra:
- MCPs del proyecto (`.mcp.json`)
- MCPs globales (`~/.claude.json`)
- Estado de conexion de cada uno

---

## Estructura de Archivos

```
MUNICIPALIDAD/
├── .mcp.json                    # Configuracion de MCPs del proyecto
├── mcp-servers/
│   ├── postgres/
│   │   ├── src/
│   │   │   └── index.ts         # Servidor MCP PostgreSQL
│   │   ├── package.json
│   │   └── .env.example
│   ├── github/
│   │   ├── src/
│   │   │   └── index.ts         # Servidor MCP GitHub
│   │   ├── package.json
│   │   └── .env.example
│   └── railway/
│       ├── src/
│       │   └── index.ts         # Servidor MCP Railway
│       ├── package.json
│       └── .env.example
```

---

## Instalacion y Requisitos

### 1. Bun Runtime (requerido)

```bash
# Instalar Bun
curl -fsSL https://bun.sh/install | bash

# En Windows PowerShell
irm bun.sh/install.ps1 | iex

# Verificar instalacion
bun --version
```

### 2. Instalar dependencias de cada MCP

```bash
# PostgreSQL MCP
cd mcp-servers/postgres && bun install

# GitHub MCP
cd mcp-servers/github && bun install

# Railway MCP
cd mcp-servers/railway && bun install
```

### 3. PostgreSQL Local

Para el MCP de PostgreSQL:
- PostgreSQL instalado y corriendo
- Base de datos creada
- Credenciales configuradas en `DATABASE_URL`

```bash
# Verificar conexion
psql -h localhost -U postgres -d muni_prueba
```

---

## Troubleshooting

### MCPs del proyecto no aparecen

**Causa:** Claude CLI no esta ejecutandose desde la carpeta del proyecto.

**Solucion:**
```bash
cd C:\Users\carca\Desktop\PROYECTOS\MUNICPALIDAD
claude
/mcp
```

### Error: "bun: command not found"

**Causa:** Bun no esta en el PATH.

**Solucion:** Usar ruta absoluta en `.mcp.json`:
```json
"command": "C:/Users/carca/.bun/bin/bun.exe"
```

### Error: "ECONNREFUSED" en PostgreSQL

**Causa:** PostgreSQL no esta corriendo.

**Solucion:**
```bash
# Windows - Iniciar servicio
net start postgresql-x64-16

# Verificar en servicios
services.msc
```

### MCP agregado pero no conecta

**Causa:** Faltan variables de entorno.

**Solucion:** Agregar con `-e`:
```bash
claude mcp add nombre comando -s project -e KEY=value
```

### Warning: "Windows requires 'cmd /c' wrapper"

**Causa:** El MCP usa `npx` directamente.

**Solucion:** Envolver con `cmd /c`:
```json
{
  "command": "cmd",
  "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-postgres", "..."]
}
```

---

## Seguridad

### Tokens y Credenciales

- **NUNCA** commitear tokens reales en `.mcp.json`
- Agregar `.mcp.json` a `.gitignore` si contiene secretos
- Usar variables de entorno del sistema cuando sea posible
- Rotar tokens periodicamente

### Archivo .mcp.json.example

Crear un archivo de ejemplo sin secretos:

```json
{
  "mcpServers": {
    "pg-municipal": {
      "type": "stdio",
      "command": "C:/Users/TU_USUARIO/.bun/bin/bun.exe",
      "args": [
        "run",
        "C:/ruta/al/proyecto/mcp-servers/postgres/src/index.ts"
      ],
      "env": {
        "DATABASE_URL": "postgresql://usuario:password@localhost:5432/database",
        "DATABASE_SSL": "false"
      }
    }
  }
}
```

---

## Crear un MCP Personalizado

### Estructura basica

```typescript
// mcp-servers/mi-mcp/src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "mi-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Definir herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "mi_herramienta",
      description: "Descripcion de lo que hace",
      inputSchema: {
        type: "object",
        properties: {
          parametro: { type: "string", description: "Descripcion del parametro" }
        },
        required: ["parametro"]
      }
    }
  ]
}));

// Implementar herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "mi_herramienta": {
      // Logica de la herramienta
      return {
        content: [{ type: "text", text: JSON.stringify({ resultado: "ok" }) }]
      };
    }
    default:
      return {
        content: [{ type: "text", text: `Herramienta desconocida: ${name}` }],
        isError: true
      };
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server iniciado");
}

main().catch(console.error);
```

### package.json

```json
{
  "name": "mi-mcp",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

---

## Recursos

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp)
- [Bun Runtime](https://bun.sh/)
