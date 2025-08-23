import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  minify: false,
  external: [
    '@xats-org/types',
    '@xats-org/schema',
    '@xats-org/validator',
    '@xats-org/testing',
  ],
});