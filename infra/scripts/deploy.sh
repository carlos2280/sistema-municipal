#!/bin/bash
# ============================================
# Sistema Municipal - Script de Deploy
# ============================================
# Deploy a Railway/Render
# Uso: ./infra/scripts/deploy.sh <environment>
# Environments: staging, production
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar argumento
if [ -z "$1" ]; then
    echo -e "${RED}Error: Especifica el ambiente (staging o production)${NC}"
    echo "Uso: ./infra/scripts/deploy.sh <environment>"
    exit 1
fi

ENVIRONMENT=$1

# Validar ambiente
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}Error: Ambiente inválido. Usa 'staging' o 'production'${NC}"
    exit 1
fi

# Directorio base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Sistema Municipal - Deploy a $ENVIRONMENT${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI no está instalado${NC}"
    echo "Instalar con: npm install -g @railway/cli"
    echo ""
    echo -e "${CYAN}Alternativa: Deploy manual desde el dashboard de Railway${NC}"
    echo "1. Conecta tu repositorio de GitHub a Railway"
    echo "2. Configura cada servicio apuntando a su carpeta"
    echo "3. Railway detectará automáticamente el Dockerfile"
    exit 1
fi

# Verificar login de Railway
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}No estás logueado en Railway${NC}"
    echo "Ejecuta: railway login"
    exit 1
fi

# Confirmación para producción
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${RED}⚠️  Estás a punto de deployar a PRODUCCIÓN${NC}"
    read -p "¿Estás seguro? (escribe 'yes' para continuar): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Deploy cancelado"
        exit 0
    fi
fi

# Deploy con Railway
echo -e "${CYAN}Iniciando deploy...${NC}"
echo ""

# Opción 1: Si usas Railway con múltiples servicios en un proyecto
# railway up --environment $ENVIRONMENT

# Opción 2: Deploy por servicio (más control)
# Esta es la forma recomendada para monorepos

echo -e "${YELLOW}Para deploy en Railway con monorepo:${NC}"
echo ""
echo "1. Ve al dashboard de Railway: https://railway.app/dashboard"
echo ""
echo "2. Crea un proyecto nuevo o usa uno existente"
echo ""
echo "3. Agrega cada servicio como un 'New Service' → 'GitHub Repo'"
echo "   Configura cada uno con:"
echo ""
echo "   ${CYAN}API Gateway:${NC}"
echo "   - Root Directory: apps/microservices/api-gateway"
echo "   - Start Command: (Railway detecta Dockerfile)"
echo ""
echo "   ${CYAN}API Identidad:${NC}"
echo "   - Root Directory: apps/microservices/api-identidad"
echo ""
echo "   ${CYAN}API Contabilidad:${NC}"
echo "   - Root Directory: apps/microservices/api-contabilidad"
echo ""
echo "   ${CYAN}API Autorizacion:${NC}"
echo "   - Root Directory: apps/microservices/api-autorizacion"
echo ""
echo "   ${CYAN}MF Shell:${NC}"
echo "   - Root Directory: apps/microfrontends/mf_shell"
echo ""
echo "   ${CYAN}MF Store:${NC}"
echo "   - Root Directory: apps/microfrontends/mf_store"
echo ""
echo "   ${CYAN}MF UI:${NC}"
echo "   - Root Directory: apps/microfrontends/mf_ui"
echo ""
echo "   ${CYAN}MF Contabilidad:${NC}"
echo "   - Root Directory: apps/microfrontends/mf_contabilidad"
echo ""
echo "4. Agrega PostgreSQL y Redis como servicios de Railway"
echo ""
echo "5. Configura las variables de entorno en cada servicio"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${CYAN}Para automatizar con GitHub Actions:${NC}"
echo "Los workflows en .github/workflows/ se encargarán del deploy automático"
echo -e "${GREEN}============================================${NC}"
