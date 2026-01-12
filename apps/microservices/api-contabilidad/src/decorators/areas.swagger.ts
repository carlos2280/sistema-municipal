/**
 * @swagger
 * tags:
 *   name: Areas
 *   description: Gestión de áreas
 */

export const AreasSwagger = {
  getAll: {
    summary: "Obtiene todas las áreas",
    responses: {
      200: {
        description: "Lista de áreas",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: { $ref: "#/components/schemas/Area" },
            },
          },
        },
      },
    },
  },

  getById: {
    summary: "Obtiene un área por ID",
    parameters: [
      {
        in: "path",
        name: "areaId",
        schema: { type: "string" },
        required: true,
        description: "ID del área",
      },
    ],
    responses: {
      200: {
        description: "Área encontrada",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Area" },
          },
        },
      },
      404: { description: "Área no encontrada" },
    },
  },

  create: {
    summary: "Crea un nuevo área",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              nombre: {
                type: "string",
                example: "Área de prueba",
                minLength: 3,
                maxLength: 100,
              },
            },
            required: ["nombre"],
          },
        },
      },
    },
    responses: {
      201: {
        description: "Área creada",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Area" },
          },
        },
      },
      400: {
        description: "Datos inválidos",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },

  update: {
    summary: "Actualiza un área existente",
    parameters: [
      {
        in: "path",
        name: "areaId",
        schema: { type: "string" },
        required: true,
        description: "ID del área",
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Area" },
        },
      },
    },
    responses: {
      200: {
        description: "Área actualizada",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Area" },
          },
        },
      },
      404: { description: "Área no encontrada" },
      400: { description: "Datos inválidos" },
    },
  },

  delete: {
    summary: "Elimina un área",
    parameters: [
      {
        in: "path",
        name: "areaId",
        schema: { type: "string" },
        required: true,
        description: "ID del área",
      },
    ],
    responses: {
      204: { description: "Área eliminada" },
      404: { description: "Área no encontrada" },
    },
  },
};
