#!/bin/bash
# Hook PostToolUse: auto-format + lint con Biome al editar archivos TS/TSX
# Se ejecuta despues de cada Edit o Write en archivos TypeScript
# Exit code 2 = bloquear la operacion con mensaje de error

FILE="$TOOL_INPUT_FILE_PATH"

# Solo procesar archivos TypeScript
if [[ "$FILE" != *.ts && "$FILE" != *.tsx ]]; then
  exit 0
fi

# Paso 1: auto-fix lo que Biome pueda corregir automaticamente
npx @biomejs/biome check --write "$FILE" 2>/dev/null

# Paso 2: verificar que no queden errores de lint residuales
OUTPUT=$(npx @biomejs/biome check "$FILE" 2>&1)
EXIT_CODE=$?

if [ "$EXIT_CODE" -ne 0 ]; then
  # Contar errores (excluyendo warnings)
  ERROR_COUNT=$(echo "$OUTPUT" | grep -c "━" || true)
  if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "LINT ERRORS en $FILE:"
    echo "$OUTPUT" | grep -E "error|━|×" | head -15
    echo ""
    echo "Corregir estos errores antes de continuar."
    exit 2
  fi
fi

exit 0
