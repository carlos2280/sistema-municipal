import { AreasApiDocs } from "@routes/v1/areas.route";
import type swaggerJSDoc from "swagger-jsdoc";
import { loadEnv } from "./env";
const env = loadEnv();

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Documentación completa de la API",
      contact: {
        name: "Support API",
        email: "support@api.com",
      },
    },
    servers: [
      {
        url: "http://localhost:{port}/api",
        description: "Servidor local",
        variables: {
          port: {
            enum: [env.PORT || "3000"],
            default: env.PORT || "3000",
          },
        },
      },
    ],
    components: {
      schemas: {
        Area: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            nombre: {
              type: "string",
              example: "Área de Desarrollo",
              minLength: 3,
              maxLength: 100,
            },
            description: {
              type: "string",
              nullable: true,
              example: "Departamento responsable del desarrollo de software",
            },
          },
          required: ["id", "nombre"],
        },
        ErrorResponse: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              example: 400,
            },
            message: {
              type: "string",
              example: "Error de validación",
            },
          },
        },
      },
    },
    paths: {
      ...AreasApiDocs, // Incorpora las rutas documentadas
    },
  },
  apis: [], // Ya no necesitamos esto porque usamos paths manualmente
};

export default swaggerOptions;
