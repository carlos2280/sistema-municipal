# Arquitectura del Sistema

## Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    mf_shell (Host)                       │    │
│  │                      Puerto 5000                         │    │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐   │    │
│  │  │  mf_ui   │  │mf_contabilidad│  │   mf_store      │   │    │
│  │  │  :5001   │  │    :5002      │  │    :5003        │   │    │
│  │  └──────────┘  └──────────────┘  └──────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│                         Puerto 3000                              │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  api-identidad  │ │ api-contabilidad│ │ api-autorizacion│
│     :3001       │ │      :3002      │ │      :3003      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │     :5432       │
                    └─────────────────┘
```

## Microfrontends

### mf_shell (Host)
- **Rol**: Aplicación contenedora principal
- **Responsabilidades**:
  - Enrutamiento principal
  - Autenticación/Sesión
  - Layout general
  - Carga dinámica de microfrontends remotos

### mf_ui
- **Rol**: Librería de componentes compartidos
- **Responsabilidades**:
  - Componentes UI reutilizables
  - Temas y estilos globales
  - Iconografía

### mf_contabilidad
- **Rol**: Módulo de contabilidad
- **Responsabilidades**:
  - Gestión financiera
  - Reportes contables
  - Facturación

### mf_store
- **Rol**: Estado compartido
- **Responsabilidades**:
  - Redux store global
  - Persistencia de estado
  - Sincronización entre microfrontends

## Microservicios

### api-gateway
- **Rol**: Punto de entrada único
- **Responsabilidades**:
  - Enrutamiento a microservicios
  - Rate limiting
  - CORS
  - Logging centralizado

### api-identidad
- **Rol**: Gestión de identidad
- **Responsabilidades**:
  - Autenticación (JWT)
  - Registro de usuarios
  - Recuperación de contraseña
  - Gestión de perfiles

### api-contabilidad
- **Rol**: Lógica de negocio contable
- **Responsabilidades**:
  - CRUD de transacciones
  - Cálculos financieros
  - Generación de reportes

### api-autorizacion
- **Rol**: Control de acceso
- **Responsabilidades**:
  - RBAC (Role-Based Access Control)
  - Permisos granulares
  - Políticas de acceso

## Comunicación

### Frontend → Backend
- REST API via api-gateway
- JWT en headers para autenticación

### Entre Microservicios
- Comunicación directa HTTP (interno)
- Base de datos compartida (PostgreSQL)

## Module Federation

Los microfrontends usan **Vite Plugin Federation** para compartir:
- React y React-DOM
- Redux y React-Redux
- Componentes de mf_ui
- Store de mf_store
