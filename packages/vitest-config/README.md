# @xats/vitest-config

Shared Vitest configuration for the xats monorepo.

## Usage

Install the package:

```bash
pnpm add -D @xats/vitest-config vitest
```

Create a `vitest.config.ts` file in your package:

```typescript
import { createVitestConfig } from '@xats/vitest-config';

export default createVitestConfig({
  // Custom options here
});
```

Or for simpler usage:

```typescript
import vitestConfig from '@xats/vitest-config';

export default vitestConfig();
```

## Features

- TypeScript support out of the box
- Coverage reporting with v8
- Global test utilities
- Mock restoration between tests
- Optimized for monorepo usage
- Consistent test patterns across packages

## Configuration Options

The `createVitestConfig` function accepts all standard Vitest options plus:

- `root`: Custom root directory (defaults to current working directory)

## Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## License

MIT