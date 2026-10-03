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
  // Architecture boundaries per AGENTS.md section 4
  {
    files: ['core/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-native',
                'react-native/**',
                'expo',
                'expo/**',
                'expo-*',
                'drizzle-orm',
                'zustand',
                '@/db/**',
                '@/platform/**',
                '@/services/**',
                '@/stores/**',
                '@/hooks/**',
                '@/app/**',
                '@/components/**',
                '@/theme/**',
              ],
              message:
                'core/ must be pure TypeScript and depend only on date-fns and @umalqura/core.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['app/**', 'components/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/db/**', '@/platform/**', 'expo-sqlite'],
              message: 'UI cannot directly import db/, platform/, or expo-sqlite.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['stores/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services/**', '@/db/**', '@/platform/**'],
              message: 'stores/ cannot import services, db, or platform.',
            },
          ],
        },
      ],
    },
  },
];
