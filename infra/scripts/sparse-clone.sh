#!/bin/bash
# ============================================
# Sistema Municipal - Sparse Clone para Desarrolladores
# ============================================
# Clona solo las carpetas necesarias para un módulo específico
# Uso: ./sparse-clone.sh <modulo> [<repo-url>]
#
# Ejemplo:
#   ./sparse-clone.sh contabilidad
#   ./sparse-clone.sh contabilidad https://github.com/tu-org/sistema-municipal.git
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar argumentos
if [ -z "$1" ]; then
    echo -e "${RED}Error: Especifica el módulo${NC}"
    echo ""
    echo "Uso: $0 <modulo> [<repo-url>]"
    echo ""
    echo "Módulos disponibles:"
    echo "  - contabilidad"
    echo "  - rrhh (futuro)"
    echo "  - inventario (futuro)"
    echo ""
    echo "Ejemplo:"
    echo "  $0 contabilidad"
    echo "  $0 contabilidad https://github.com/tu-org/sistema-municipal.git"
    exit 1
fi

MODULE=$1
REPO_URL=${2:-"https://github.com/tu-org/sistema-municipal.git"}
TARGET_DIR="sistema-municipal-$MODULE"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Sparse Clone - Módulo: $MODULE${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Verificar si el directorio ya existe
if [ -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}El directorio $TARGET_DIR ya existe${NC}"
    read -p "¿Deseas eliminarlo y clonar de nuevo? (y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        rm -rf "$TARGET_DIR"
    else
        echo "Operación cancelada"
        exit 0
    fi
fi

# Clonar con sparse checkout
echo -e "${CYAN}Clonando repositorio (sparse)...${NC}"
git clone --filter=blob:none --sparse "$REPO_URL" "$TARGET_DIR"

cd "$TARGET_DIR"

# Configurar sparse checkout según el módulo
echo -e "${CYAN}Configurando sparse checkout para módulo: $MODULE${NC}"

case $MODULE in
    contabilidad)
        git sparse-checkout set \
            apps/microfrontends/mf_contabilidad \
            apps/microservices/api-contabilidad \
            packages/shared \
            infra/compose \
            infra/scripts \
            docs/modules/contabilidad.md \
            .env.example \
            package.json \
            pnpm-workspace.yaml \
            turbo.json \
            Makefile
        ;;
    rrhh)
        git sparse-checkout set \
            apps/microfrontends/mf_rrhh \
            apps/microservices/api-rrhh \
            packages/shared \
            infra/compose \
            infra/scripts \
            docs/modules/rrhh.md \
            .env.example \
            package.json \
            pnpm-workspace.yaml \
            turbo.json \
            Makefile
        ;;
    *)
        echo -e "${YELLOW}Módulo '$MODULE' no reconocido, clonando estructura base...${NC}"
        git sparse-checkout set \
            packages/shared \
            infra/compose \
            infra/scripts \
            .env.example \
            package.json \
            pnpm-workspace.yaml \
            turbo.json \
            Makefile
        ;;
esac

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✓ Clone completado${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${CYAN}Estructura clonada:${NC}"
find . -type f -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "Makefile" -o -name "Dockerfile" 2>/dev/null | head -20
echo "..."
echo ""
echo -e "${CYAN}Próximos pasos:${NC}"
echo "  1. cd $TARGET_DIR"
echo "  2. cp .env.example .env"
echo "  3. Edita .env con tus credenciales"
echo "  4. pnpm install"
echo "  5. make dev-$MODULE"
echo ""
echo -e "${YELLOW}Nota: Solo tienes acceso al módulo $MODULE${NC}"
echo "Para ver otros módulos necesitas permisos adicionales."
