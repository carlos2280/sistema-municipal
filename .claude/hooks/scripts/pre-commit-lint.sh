#!/usr/bin/env bash
# Pre-commit hook: corre biome check en los paquetes con archivos staged.
# Si falla, bloquea el commit e informa qué paquete tiene errores.

set -euo pipefail

# Obtener archivos staged .ts/.tsx
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# Extraer nombres de paquetes únicos desde las rutas staged
PACKAGES=$(echo "$STAGED_FILES" | sed -n 's|apps/microservices/\([^/]*\)/.*|\1|p' | sort -u)

FAILED=0
for pkg in $PACKAGES; do
  if pnpm --filter "$pkg" check >/dev/null 2>&1; then
    echo "  biome check $pkg OK"
  else
    echo "  biome check $pkg FAILED"
    pnpm --filter "$pkg" check 2>&1 | grep -E "error|━" | head -5
    FAILED=1
  fi
done

if [ "$FAILED" -eq 1 ]; then
  echo ""
  echo "Lint failed. Run 'pnpm --filter <pkg> exec biome check --fix --unsafe .' to auto-fix."
  exit 1
fi
