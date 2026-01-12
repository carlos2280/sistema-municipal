/** @type {import('cz-customizable').Config} */
module.exports = {
  types: [
    { value: "feat", name: "feat:     Nueva funcionalidad" },
    { value: "fix", name: "fix:      Corrección de un error" },
    {
      value: "chore",
      name: "chore:    Cambios de configuración (ej: dependencias)",
    },
    { value: "docs", name: "docs:     Actualización de documentación" },
    { value: "style", name: "style:    Cambios de formato (ej: prettier)" },
    { value: "refactor", name: "refactor: Refactorización de código" },
    { value: "test", name: "test:     Agregar o corregir pruebas" },
  ],
  messages: {
    type: "Selecciona el tipo de cambio que estás realizando:",
    scope: "\nIndica el alcance de los cambios (opcional):",
    subject: "Escribe un resumen breve en imperativo (máx. 72 caracteres):\n",
    body: 'Descripción detallada (opcional). Usa "|" para saltos de línea:\n',
    breaking: "¿Incluye cambios disruptivos (breaking changes)? (opcional):\n",
    footer: "¿Relacionado con algún issue? (ej: #123) (opcional):\n",
    confirmCommit: "¿Confirmas este commit?",
  },
  allowBreakingChanges: ["feat", "fix"],
};
