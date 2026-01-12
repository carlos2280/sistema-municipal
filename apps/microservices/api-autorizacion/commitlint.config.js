export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-empty": [2, "never"],
    "subject-case": [2, "never"],
  },
  prompt: {
    messages: {
      skip: "(opcional)",
      max: "Máximo %d caracteres",
      min: "Mínimo %d caracteres",
      emptyWarning: "¡No puede estar vacío!",
    },
  },
};
