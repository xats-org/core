# @xats/eslint-config

Shared ESLint configuration for the xats monorepo.

## Usage

Install the package:

```bash
pnpm add -D @xats/eslint-config
```

Create an `.eslintrc.js` file in your package:

```js
module.exports = {
  extends: ['@xats/eslint-config'],
  parserOptions: {
    project: './tsconfig.json'
  }
};
```

## Features

- TypeScript support with strict type checking
- Import ordering and resolution
- Prettier integration
- Consistent code style across all packages

## License

MIT