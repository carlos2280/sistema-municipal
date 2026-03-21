#!/bin/bash
# Hook PreToolUse: bloquea escritura de secrets hardcoded
# Se ejecuta ANTES de cada Edit o Write
# Exit code 2 = bloquear la operacion con mensaje

# Solo verificar en herramientas de escritura
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Verificar si el contenido contiene posibles secrets hardcoded
# Patron: API_KEY = "valor", SECRET = 'valor', password: "valor"
if echo "$TOOL_INPUT" | grep -qiE '(api_key|api_secret|secret_key|private_key|password|token|credential)\s*[:=]\s*["\x27][A-Za-z0-9]'; then
  # Excluir si es process.env o variable de entorno
  if ! echo "$TOOL_INPUT" | grep -qE 'process\.env\.|import\.meta\.env\.|\$\{.*\}'; then
    echo "BLOQUEADO: Posible secret hardcoded detectado."
    echo "Usar process.env.NOMBRE_VARIABLE en vez de valores literales."
    echo "Si es un valor de ejemplo/test, usar placeholder como 'your-api-key-here'."
    exit 2
  fi
fi

exit 0
