# @xats-org/prettier-config

Shared Prettier configuration for the xats monorepo.

## Usage

Install the package:

```bash
pnpm add -D @xats-org/prettier-config
```

Reference it in your `package.json`:

```json
{
  "prettier": "@xats-org/prettier-config"
}
```

Or create a `.prettierrc.js` file:

```js
module.exports = {
  ...require('@xats-org/prettier-config'),
  // Your overrides
};
```

## Configuration

- Print width: 100 characters
- Tab width: 2 spaces
- Single quotes for JavaScript/TypeScript
- Trailing commas in ES5-compatible places
- Unix line endings
- Format embedded code in markdown

## License

MIT