const { join, dirname } = require('path');

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: [
    '../packages/*/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
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
  async viteFinal(config) {
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
          '@xats-org/renderer': join(__dirname, '../packages/renderer/src'),
          '@xats-org/types': join(__dirname, '../packages/types/src'),
          '@xats-org/utils': join(__dirname, '../packages/utils/src'),
          '@xats-org/schema': join(__dirname, '../packages/schema/src'),
          '@xats-org/validator': join(__dirname, '../packages/validator/src'),
        },
      },
      define: {
        ...config.define,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          'react',
          'react-dom',
          '@storybook/react',
          '@storybook/blocks',
        ],
        force: true,
      },
      build: {
        ...config.build,
        commonjsOptions: {
          ...config.build?.commonjsOptions,
          transformMixedEsModules: true,
        },
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

module.exports = config;