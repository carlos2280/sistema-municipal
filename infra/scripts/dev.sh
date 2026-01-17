#!/bin/bash
# ============================================
# Sistema Municipal - Script de Desarrollo
# ============================================
# Inicia el entorno de desarrollo completo
# Uso: ./infra/scripts/dev.sh
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Directorio base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Sistema Municipal - Entorno de Desarrollo${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Error: Docker no está instalado${NC}"
    exit 1
fi

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}Error: pnpm no está instalado${NC}"
    echo "Instalar con: npm install -g pnpm"
    exit 1
fi

# Verificar que Docker está corriendo
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}Error: Docker no está corriendo${NC}"
    exit 1
fi

# Iniciar infraestructura
echo -e "${CYAN}Iniciando infraestructura (PostgreSQL, Redis, Mailhog)...${NC}"
docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.dev.yml --profile dev up -d

# Esperar a que PostgreSQL esté listo
echo -e "${CYAN}Esperando a que PostgreSQL esté listo...${NC}"
until docker exec municipal-postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}✓ PostgreSQL listo${NC}"

# Esperar a que Redis esté listo
echo -e "${CYAN}Esperando a que Redis esté listo...${NC}"
until docker exec municipal-redis redis-cli ping > /dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}✓ Redis listo${NC}"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Infraestructura lista${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${CYAN}Servicios:${NC}"
echo "  PostgreSQL:  localhost:5432"
echo "  Redis:       localhost:6379"
echo "  Mailhog UI:  http://localhost:8025"
echo ""
echo -e "${CYAN}Iniciando aplicaciones con Turbo...${NC}"
echo ""

# Iniciar aplicaciones
pnpm dev
