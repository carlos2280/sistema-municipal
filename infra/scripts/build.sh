#!/bin/bash
# ============================================
# Sistema Municipal - Script de Build
# ============================================
# Construye las imágenes Docker de todos los servicios
# Uso: ./infra/scripts/build.sh [--push] [--tag <tag>]
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

# Variables por defecto
REGISTRY="${DOCKER_REGISTRY:-ghcr.io/tu-usuario}"
TAG="${VERSION:-$(git describe --tags --always --dirty 2>/dev/null || echo 'dev')}"
PUSH=false

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH=true
            shift
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Argumento desconocido: $1${NC}"
            exit 1
            ;;
    esac
done

# Directorio base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Sistema Municipal - Build de Imágenes${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${CYAN}Registry:${NC} $REGISTRY"
echo -e "${CYAN}Tag:${NC} $TAG"
echo -e "${CYAN}Push:${NC} $PUSH"
echo ""

# Función para build de un servicio
build_service() {
    local name=$1
    local path=$2
    local image="$REGISTRY/municipal-$name:$TAG"

    echo -e "${CYAN}Building $name...${NC}"
    docker build -t "$image" "$path"

    if [ "$PUSH" = true ]; then
        echo -e "${CYAN}Pushing $image...${NC}"
        docker push "$image"
    fi

    echo -e "${GREEN}✓ $name completado${NC}"
    echo ""
}

# Build APIs
echo -e "${GREEN}=== Building APIs ===${NC}"
echo ""
build_service "api-gateway" "./apps/microservices/api-gateway"
build_service "api-identidad" "./apps/microservices/api-identidad"
build_service "api-autorizacion" "./apps/microservices/api-autorizacion"
build_service "api-contabilidad" "./apps/microservices/api-contabilidad"

# Build Microfrontends
echo -e "${GREEN}=== Building Microfrontends ===${NC}"
echo ""
build_service "mf-shell" "./apps/microfrontends/mf_shell"
build_service "mf-store" "./apps/microfrontends/mf_store"
build_service "mf-ui" "./apps/microfrontends/mf_ui"
build_service "mf-contabilidad" "./apps/microfrontends/mf_contabilidad"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✓ Build completado${NC}"
echo -e "${GREEN}============================================${NC}"

# Listar imágenes creadas
echo ""
echo -e "${CYAN}Imágenes creadas:${NC}"
docker images | grep "municipal-" | grep "$TAG"
