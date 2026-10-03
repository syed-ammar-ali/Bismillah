const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: [
      'dist/**',
      '.expo/**',
      'node_modules/**',
      'android/**',
      'ios/**',
      '**/*.d.ts',
    ],
  },
  {
    files: ['platform/**', 'index.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
