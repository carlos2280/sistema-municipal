---
name: common
description: Convenciones de codigo universales — funciones cortas, nombres descriptivos, early return, clean code. Aplicar siempre en cualquier archivo que se toque.
context: fork
allowed-tools: [Read, Grep, Glob]
---

# Convenciones Comunes

Estas convenciones aplican a todos los archivos independientemente del stack.

## Codigo

- Funciones cortas y con un solo proposito
- Nombres descriptivos: el codigo se lee mas de lo que se escribe
- No comentar lo obvio. Comentar el "por que", no el "que"
- Eliminar codigo muerto, no comentarlo
- Constantes con nombre en vez de numeros/strings magicos
- Early return para reducir anidacion

```
// Mal
function process(user) {
  if (user) {
    if (user.active) {
      if (user.role === 'admin') {
        // hacer algo
      }
    }
  }
}

// Bien
function process(user) {
  if (!user) return;
  if (!user.active) return;
  if (user.role !== 'admin') return;
  // hacer algo
}
```

## Git

- Commits atomicos: un commit = un cambio logico
- Mensajes en imperativo: "Add user validation", no "Added user validation"
- Branches: `feature/`, `fix/`, `refactor/` + descripcion corta
- No commitear archivos generados, secrets, ni dependencias
- `.env` nunca en el repo, usar `.env.example` como template

## Estructura de archivos

- Agrupar por feature/dominio, no por tipo de archivo
- Archivos de menos de 300 lineas (si crece, dividir)
- Un export principal por archivo
- Index files solo para re-exportar, no para logica

## Manejo de errores

- Manejar errores cerca de donde ocurren
- Mensajes de error descriptivos para el desarrollador
- Nunca silenciar errores con catch vacio
- Logging estructurado (nivel + contexto + mensaje)

## Seguridad

- Validar input del usuario en el boundary del sistema
- No confiar en datos del cliente
- Secrets en variables de entorno, nunca en codigo
- Principio de minimo privilegio en permisos y accesos
