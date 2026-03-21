# api-contabilidad — Instrucciones locales

Microservicio de contabilidad municipal. Se carga automáticamente al trabajar en esta carpeta.

## Puerto: 3002

## Estructura interna
```
src/
├── routes/         → Rutas agrupadas por recurso (presupuesto, planCuentas, etc.)
├── controllers/    → Handlers HTTP, delegan a services
├── services/       → Lógica de negocio (presupuesto, planCuentas, centrosCosto)
├── db/             → Queries Drizzle específicas de este servicio
├── libs/           → Utilidades internas (árboles de cuentas, etc.)
├── types/          → Tipos locales del servicio
├── config/         → Variables de entorno con validación Zod
├── decorators/     → Decoradores de logging/validación
└── env/            → Parseo y validación de ENV al arranque
```

## Dominio contable
- **Plan de Cuentas**: árbol jerárquico de cuentas contables (códigos tipo "1.1.01.001")
- **Presupuesto Inicial**: montos asignados por cuenta al inicio del ejercicio fiscal
- **Presupuesto Detalle**: movimientos y modificaciones durante el año
- **Centro de Costo**: unidades organizativas que ejecutan el presupuesto

## Schema de DB: `packages/db-contabilidad`
Tablas principales: `planesCuentas`, `presupuestos`, `presupuestosDetalle`, `centrosCosto`

## Comandos útiles
```bash
# Typecheck
pnpm --filter api-contabilidad exec tsc --noEmit

# Generar migración de contabilidad
pnpm --filter db-contabilidad exec drizzle-kit generate

# Aplicar migración
pnpm --filter db-contabilidad exec drizzle-kit migrate
```

## Patrones específicos de este servicio
- Árbol de cuentas: usar las utilidades en `src/libs/` para traversal y validaciones
- Los códigos de cuenta son validados por formato (regex) y por unicidad en el mismo año fiscal
- Soft delete en plan de cuentas: nunca borrar cuentas que tengan movimientos asociados
