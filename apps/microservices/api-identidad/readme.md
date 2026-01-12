# api-identidad

API de autenticación e identidad construida con Node.js, Express, TypeScript y Drizzle ORM.

## Tabla de Contenido

- [Características](#características)
- [Instalación](#instalación)
- [Scripts disponibles](#scripts-disponibles)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## Características

- ✅ API REST con Express
- 🔐 Autenticación con JWT y bcrypt
- 🧾 Validación de esquemas con Zod
- 🗄️ ORM moderno con Drizzle y PostgreSQL
- 📘 Documentación con Swagger
- 🧹 Linter, formateador y tipado fuerte con Biome y TypeScript
- 🧪 Commitlint y husky para buenas prácticas de commits
- ⚡ Bundling con `tsup` y ejecución con `tsx`

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/api-identidad.git
   cd api-identidad
   ```

2. Instala las dependencias con PNPM:

   ```bash
   pnpm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto con tus variables necesarias:

   ```env
   PORT=3000
   DATABASE_URL=postgres://user:password@localhost:5432/tu_base_de_datos
   JWT_SECRET=tu_clave_secreta
   ```

## Scripts disponibles

| Script       | Descripción                                                  |
|--------------|--------------------------------------------------------------|
| `pnpm dev`   | Ejecuta el servidor en modo desarrollo con recarga en vivo   |
| `pnpm build` | Transpila y empaqueta el código con `tsup`                   |
| `pnpm start` | Ejecuta el proyecto desde la carpeta `dist/`                 |
| `pnpm lint`  | Linter con Biome                                             |
| `pnpm format`| Formatea el código con Biome                                 |
| `pnpm check` | Verifica el código con Biome (lint + typecheck)             |
| `pnpm commit`| Interfaz interactiva para hacer commits con Commitizen       |

## Uso

```bash
pnpm dev
```

La API estará disponible en `http://localhost:3000`. La documentación Swagger se puede acceder en `http://localhost:3000/api-docs`.

## Estructura del Proyecto

```bash
.
├── src/
│   ├── index.ts         # Punto de entrada principal
│   ├── routes/          # Rutas de la API
│   ├── controllers/     # Controladores
│   ├── services/        # Lógica de negocio
│   ├── middlewares/     # Middlewares personalizados
│   └── config/          # Configuración general
├── dist/                # Código compilado
├── .cz-config.cjs       # Configuración para commitizen
├── tsconfig.json        # Configuración de TypeScript
└── README.md
```

## Contribuir

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Haz tus cambios y comités usando `pnpm commit`.
4. Envía un pull request 🚀

## Licencia

Este proyecto está bajo la licencia [ISC](LICENSE).
