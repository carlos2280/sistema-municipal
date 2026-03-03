export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bugs
        'docs',     // Documentación
        'style',    // Formateo, sin cambios de código
        'refactor', // Refactorización
        'perf',     // Mejoras de performance
        'test',     // Tests
        'build',    // Build system
        'ci',       // CI/CD
        'chore',    // Tareas de mantenimiento
        'revert',   // Revertir commits
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'shell',
        'ui',
        'contabilidad',
        'store',
        'gateway',
        'identidad',
        'autorizacion',
        'shared',
        'infra',
        'deps',
        'config',
        'admin-panel',
        'chat',
        'platform',
      ],
    ],
  },
}
