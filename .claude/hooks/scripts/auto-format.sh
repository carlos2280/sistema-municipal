#!/bin/bash
# Hook PostToolUse: auto-format con Biome al editar archivos TS/TSX
# Se ejecuta despues de cada Edit o Write en archivos TypeScript

FILE="$TOOL_INPUT_FILE_PATH"

# Solo procesar archivos TypeScript
if [[ "$FILE" == *.ts || "$FILE" == *.tsx ]]; then
  # Formatear con Biome (silencioso, no bloquea si falla)
  npx @biomejs/biome check --write "$FILE" 2>/dev/null
fi

exit 0
