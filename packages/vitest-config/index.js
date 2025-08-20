import { defineConfig } from 'vitest/config';
import path from 'node:path';

export function createVitestConfig(options = {}) {
  const { root = process.cwd(), ...rest } = options;

  return defineConfig({
    test: {
      globals: true,
      environment: 'node',
      clearMocks: true,
      restoreMocks: true,
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
          '**/index.ts', // Often just re-exports
        ],
      },
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.turbo/**',
      ],
      watchExclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.turbo/**',
      ],
      ...rest,
    },
    resolve: {
      alias: {
        '@': path.resolve(root, 'src'),
      },
    },
  });
}

export default createVitestConfig;