# Git Workflow — Reglas (siempre activas)

## Commits: Conventional Commits
```
tipo(scope): descripción en imperativo

feat(presupuesto): agregar cascade delete en PresupuestoDetalle
fix(auth): corregir expiración de refresh token
refactor(shell): extraer EyebrowBrand a átomo de mf_ui
test(api-contabilidad): agregar tests de plan de cuentas
docs(specs): agregar spec de módulo de informes
chore(deps): actualizar drizzle-orm a 0.44.0
```

- `feat` = funcionalidad nueva
- `fix` = corrección de bug
- `refactor` = mejora interna sin cambio de comportamiento
- `test` = tests
- `docs` = documentación o specs
- `chore` = dependencias, config, tareas de mantenimiento

## Ramas
- `main` → producción (Railway). Solo via PR desde `develop`, nunca push directo
- `develop` → staging (Railway). Rama de integración, solo via PR desde feature branches
- `feature/<nombre>` → nueva funcionalidad → PR hacia `develop`
- `fix/<nombre>` → corrección de bug → PR hacia `develop`
- `refactor/<nombre>` → mejora interna → PR hacia `develop`

## Flujo GitFlow
```
feature/<nombre>  →  PR  →  develop  →  PR  →  main
                     (staging)             (producción)
```

1. Crear rama desde `develop`: `git checkout -b feature/nombre develop`
2. Desarrollar y commitear con Conventional Commits
3. PR hacia `develop` → merge → deploy automático a staging en Railway
4. Validar en staging
5. PR de `develop` hacia `main` → merge → deploy automático a producción en Railway

## Pull Requests
- `feature/*` / `fix/*` / `refactor/*` → siempre PR hacia `develop`
- `develop` → `main` solo cuando staging está validado
- Squash merge para historial limpio

## Prohibido
- NUNCA `git push --force` en `main` ni en `develop`
- NUNCA commitear `.env`, secrets, API keys
- NUNCA hacer `git commit --amend` en commits ya pusheados
- NUNCA `git reset --hard` sin confirmar con el usuario primero

## Spec-Driven Development
- Antes de implementar una feature nueva, debe existir su spec en `specs/`
- Leer el spec antes de escribir código
- Validar contra los criterios de aceptación al finalizar
