import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Environment setup
    environment: 'node',
    
    // Test files
    include: ['test/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        'bin/',
        '**/*.d.ts',
        'vitest.config.ts'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    
    // Test timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Reporter configuration
    reporter: ['verbose'],
    
    // Globals
    globals: false,
    
    // Setup files
    setupFiles: [],
    
    // Watch options
    watch: false
  }
});