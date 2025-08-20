import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Include all packages with vitest configs
  'packages/*',
  {
    // Shared test configuration
    test: {
      globals: true,
      environment: 'node',
      coverage: {
        enabled: false,
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          '**/*.config.*',
          '**/*.d.ts',
          '**/dist/**',
          '**/build/**',
          '**/node_modules/**',
          '**/.turbo/**',
          '**/test/**',
          '**/*.test.ts',
          '**/*.spec.ts',
        ],
      },
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.turbo/**',
        'test/**', // Exclude old tests at root
        'src/**/*.test.ts', // Exclude old tests in src
      ],
    },
  },
]);