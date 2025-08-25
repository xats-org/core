import type { StorybookConfig } from '@storybook/react-vite';
import { join, dirname } from 'path';

const config: StorybookConfig = {
  stories: [
    '../packages/*/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../packages/*/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-coverage',
  ],
  framework: {
    name: '@storybook/react-vite' as any,
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    const { resolve } = await import('path');
    const projectRoot = resolve(dirname(import.meta.url.replace('file://', '')), '..');
    
    // Set base path for GitHub Pages deployment
    const isProduction = process.env.NODE_ENV === 'production';
    const base = isProduction ? '/core/' : '/';
    
    return {
      ...config,
      base,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@xats-org/renderer': resolve(projectRoot, 'packages/renderer/src'),
          '@xats-org/types': resolve(projectRoot, 'packages/types/src'),
          '@xats-org/utils': resolve(projectRoot, 'packages/utils/src'),
          '@xats-org/schema': resolve(projectRoot, 'packages/schema/src'),
          '@xats-org/validator': resolve(projectRoot, 'packages/validator/src'),
        },
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        force: true,
      },
      server: {
        ...config.server,
        fs: {
          ...config.server?.fs,
          strict: false,
        },
      },
    };
  },
};

export default config;