#!/usr/bin/env bash
# Pre-commit hook: corre biome check en los paquetes con archivos staged.
# Si falla, bloquea el commit e informa qué paquete tiene errores.
# Cubre: apps/microservices/, apps/microfrontends/, packages/

set -euo pipefail

# Obtener archivos staged .ts/.tsx
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# Extraer nombres de paquetes únicos desde TODAS las rutas del monorepo
PACKAGES=$(echo "$STAGED_FILES" | sed -n \
  -e 's|apps/microservices/\([^/]*\)/.*|\1|p' \
  -e 's|apps/microfrontends/\([^/]*\)/.*|\1|p' \
  -e 's|packages/\([^/]*\)/.*|\1|p' \
  | sort -u)

if [ -z "$PACKAGES" ]; then
  exit 0
fi

FAILED=0

# Paso 1: Biome check (lint + format)
for pkg in $PACKAGES; do
  if pnpm --filter "$pkg" check >/dev/null 2>&1; then
    echo "  biome check $pkg OK"
  else
    echo "  biome check $pkg FAILED"
    pnpm --filter "$pkg" check 2>&1 | grep -E "error|━" | head -10
    FAILED=1
  fi
done

# Paso 2: TypeScript (tsc --noEmit)
for pkg in $PACKAGES; do
  if pnpm --filter "$pkg" typecheck >/dev/null 2>&1; then
    echo "  tsc $pkg OK"
  else
    echo "  tsc $pkg FAILED"
    pnpm --filter "$pkg" typecheck 2>&1 | grep "error TS" | head -10
    FAILED=1
  fi
done

if [ "$FAILED" -eq 1 ]; then
  echo ""
  echo "Pre-commit failed. Fix errors before committing."
  echo "Biome auto-fix: pnpm --filter <pkg> exec biome check --fix --unsafe ."
  echo "TypeScript: pnpm --filter <pkg> typecheck"
  exit 1
fi
