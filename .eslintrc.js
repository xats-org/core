module.exports = {
  root: true,
  extends: ['@xats-org/eslint-config'],
  parserOptions: {
    project: ['./tsconfig.json', './packages/*/tsconfig.json', './packages/*/tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.json', './packages/*/tsconfig.json', './packages/*/tsconfig.eslint.json'],
      },
    },
  },
  rules: {
    // Root-level overrides if needed
  },
};