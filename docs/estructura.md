# Estructura del Monorepo

```
MUNICIPALIDAD/
│
├── apps/                          # Aplicaciones deployables
│   │
│   ├── microfrontends/            # Frontend (React + Vite)
│   │   ├── mf_shell/              # Host principal
│   │   │   ├── src/
│   │   │   ├── public/
│   │   │   ├── vite.config.ts     # Config Module Federation
│   │   │   ├── server.js          # Server para producción
│   │   │   └── package.json
│   │   │
│   │   ├── mf_ui/                 # Componentes UI compartidos
│   │   ├── mf_contabilidad/       # Módulo contabilidad
│   │   └── mf_store/              # Estado global compartido
│   │
│   └── microservices/             # Backend (Express + TypeScript)
│       ├── api-gateway/           # Gateway principal
│       │   ├── src/
│       │   │   ├── routes/
│       │   │   ├── middlewares/
│       │   │   └── index.ts
│       │   └── package.json
│       │
│       ├── api-identidad/         # Servicio de autenticación
│       │   ├── src/
│       │   │   ├── routes/
│       │   │   ├── services/
│       │   │   ├── db/            # Drizzle schemas
│       │   │   └── index.ts
│       │   └── package.json
│       │
│       ├── api-contabilidad/      # Servicio de contabilidad
│       └── api-autorizacion/      # Servicio de autorización
│
├── packages/                      # Código compartido
│   └── shared/                    # Utilidades, tipos, schemas
│       ├── src/
│       │   ├── types/             # TypeScript types compartidos
│       │   ├── utils/             # Funciones utilitarias
│       │   └── constants/         # Constantes globales
│       ├── drizzle/               # Schemas de DB compartidos
│       └── package.json
│
├── infrastructure/                # Configuración de infraestructura
│   ├── docker/                    # Dockerfiles adicionales
│   └── scripts/                   # Scripts de deploy
│
├── docs/                          # Documentación (local, no se commitea)
│
├── .vscode/                       # Configuración VSCode
│   ├── settings.json
│   └── extensions.json
│
├── docker-compose.yml             # Orquestación local
├── turbo.json                     # Configuración Turborepo
├── pnpm-workspace.yaml            # Workspaces de pnpm
├── package.json                   # Scripts globales
├── biome.json                     # Linting/Formatting
├── commitlint.config.js           # Convención de commits
├── .gitignore
└── .env.example                   # Variables de entorno ejemplo
```

## Convenciones de Nombres

### Microfrontends
- Prefijo: `mf_`
- Ejemplos: `mf_shell`, `mf_ui`, `mf_contabilidad`

### Microservicios
- Prefijo: `api-`
- Ejemplos: `api-gateway`, `api-identidad`

### Packages
- Sin prefijo, nombres descriptivos
- Ejemplos: `shared`, `ui-components`

## Cada App Contiene

### Microfrontend
```
mf_[nombre]/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── store/          (si aplica)
│   └── App.tsx
├── public/
├── vite.config.ts
├── tsconfig.json
├── package.json
└── server.js           (producción)
```

### Microservicio
```
api-[nombre]/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   ├── db/
│   │   ├── schema.ts
│   │   └── migrations/
│   ├── utils/
│   └── index.ts
├── tsconfig.json
├── package.json
└── Dockerfile
```
