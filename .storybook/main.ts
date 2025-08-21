import type { StorybookConfig } from '@storybook/react-vite';
import { join, dirname } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: [
    '../packages/*/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../packages/*/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-coverage'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    const __dirname = dirname(new URL(import.meta.url).pathname);
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