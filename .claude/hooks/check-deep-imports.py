#!/usr/bin/env python3
"""
Hook PostToolUse: detecta imports con 2+ niveles de ../ en archivos .ts/.tsx.
Inyecta un warning al modelo para que convierta a @/ alias segun typescript.md.
"""
import sys
import json
import re

data = json.load(sys.stdin)
f = data.get("tool_input", {}).get("file_path", "")

if not f.endswith((".ts", ".tsx")):
    sys.exit(0)

try:
    with open(f) as fh:
        lines = fh.readlines()
except OSError:
    sys.exit(0)

matches = [
    (i + 1, l.rstrip())
    for i, l in enumerate(lines)
    if re.search(r"from\s+[\"'](\.\./){2,}", l)
]

if not matches:
    sys.exit(0)

detail = "\n".join(f"  linea {n}: {l}" for n, l in matches)
context = (
    f"⚠️  ALIAS REQUERIDO: '{f}' tiene imports con 2+ niveles de ../\n"
    f"Estos imports deben convertirse a @/ segun .claude/rules/typescript.md:\n"
    f"{detail}\n"
    f"Ejemplo: '../../hooks' → '@/hooks', '../../../types/foo' → '@/types/foo'"
)

print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": context
    }
}))
