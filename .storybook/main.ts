import type { StorybookConfig } from '@storybook/react-vite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Customize the Vite config for Storybook
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@xats-org/renderer': join(__dirname, '../packages/renderer/src'),
          '@xats-org/types': join(__dirname, '../packages/types/src'),
          '@xats-org/utils': join(__dirname, '../packages/utils/src'),
          '@xats-org/schema': join(__dirname, '../packages/schema/src'),
          '@xats-org/validator': join(__dirname, '../packages/validator/src'),
        },
      },
    };
  },
};

export default config;