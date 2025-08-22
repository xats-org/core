import { defineConfig } from 'vitest/config';
import baseConfig from '@xats-org/vitest-config';

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    name: 'ai-integration',
  },
});