# Installation Guide

This guide covers all the ways to install and set up xats packages for different use cases, from basic document validation to full development environments.

## System Requirements

### Minimum Requirements
- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher (comes with Node.js)
- **Operating System**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

### Recommended Setup
- **Node.js** 20.0.0 or higher (LTS recommended)
- **Package Manager**: pnpm 8.0.0+ for better performance
- **Editor**: VS Code with TypeScript support
- **Memory**: 4GB RAM minimum, 8GB+ recommended for large documents

## Installation Methods

### 1. Quick Start (Recommended)

For most users who want to work with xats documents:

::: code-group

```bash [npm]
npm install @xats/schema @xats/validator @xats/types
```

```bash [yarn]
yarn add @xats/schema @xats/validator @xats/types
```

```bash [pnpm]
pnpm add @xats/schema @xats/validator @xats/types
```

:::

### 2. CLI Tools Installation

For command-line tools and utilities:

::: code-group

```bash [npm]
npm install -g @xats/cli
```

```bash [yarn]
yarn global add @xats/cli
```

```bash [pnpm]
pnpm add -g @xats/cli
```

:::

Verify installation:
```bash
xats --version
xats --help
```

### 3. Full Development Setup

For developers who want to build tools or contribute:

::: code-group

```bash [npm]
npm install @xats/schema @xats/validator @xats/types @xats/cli @xats/renderer @xats/utils
```

```bash [yarn]
yarn add @xats/schema @xats/validator @xats/types @xats/cli @xats/renderer @xats/utils
```

```bash [pnpm]
pnpm add @xats/schema @xats/validator @xats/types @xats/cli @xats/renderer @xats/utils
```

:::

### 4. AI Integration Setup

For AI tools and educational platforms:

::: code-group

```bash [npm]
npm install @xats/mcp-server @xats/schema @xats/validator
```

```bash [yarn]
yarn add @xats/mcp-server @xats/schema @xats/validator
```

```bash [pnpm]
pnpm add @xats/mcp-server @xats/schema @xats/validator
```

:::

## Package Selection Guide

Choose the packages based on your use case:

| Use Case | Required Packages | Optional Packages |
|----------|------------------|-------------------|
| **Document Validation** | `@xats/validator` | `@xats/types` |
| **Content Creation** | `@xats/schema`, `@xats/validator`, `@xats/types` | `@xats/cli`, `@xats/examples` |
| **Web Development** | `@xats/schema`, `@xats/validator`, `@xats/renderer` | `@xats/utils` |
| **CLI Usage** | `@xats/cli` | All others (auto-installed) |
| **AI Integration** | `@xats/mcp-server`, `@xats/schema` | `@xats/validator` |
| **Full Development** | All packages | Development tools |

## Package Manager Comparison

### npm (Default)
- ✅ Comes with Node.js
- ✅ Universal compatibility
- ❌ Slower installation
- ❌ Larger disk usage

```bash
npm install @xats/schema @xats/validator @xats/types
```

### Yarn
- ✅ Faster than npm
- ✅ Better caching
- ❌ Additional installation required
- ✅ Good workspace support

```bash
# Install Yarn first
npm install -g yarn

# Then install xats packages
yarn add @xats/schema @xats/validator @xats/types
```

### pnpm (Recommended)
- ✅ Fastest installation
- ✅ Minimal disk usage
- ✅ Excellent monorepo support
- ❌ Additional installation required

```bash
# Install pnpm first
npm install -g pnpm

# Then install xats packages
pnpm add @xats/schema @xats/validator @xats/types
```

## Environment Setup

### TypeScript Project Setup

If you're using TypeScript (recommended):

1. **Initialize TypeScript project:**
```bash
npm init -y
npm install -D typescript @types/node
npx tsc --init
```

2. **Configure `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

3. **Install xats packages:**
```bash
npm install @xats/schema @xats/validator @xats/types
```

### JavaScript Project Setup

For JavaScript projects:

1. **Initialize project:**
```bash
npm init -y
```

2. **Configure `package.json` for ESM:**
```json
{
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

3. **Install xats packages:**
```bash
npm install @xats/schema @xats/validator @xats/types
```

### VS Code Setup

For the best development experience with VS Code:

1. **Install recommended extensions:**
   - TypeScript and JavaScript Language Features (built-in)
   - JSON Language Features (built-in)
   - ESLint
   - Prettier

2. **Configure VS Code settings (`.vscode/settings.json`):**
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "json.schemas": [
    {
      "fileMatch": ["*.xats.json"],
      "url": "https://xats.org/schemas/0.4.0/xats.json"
    }
  ],
  "files.associations": {
    "*.xats.json": "json"
  }
}
```

## Verification

### Basic Installation Check

Create a simple test file (`test.js` or `test.ts`):

::: code-group

```javascript [JavaScript]
import { validateXatsDocument } from '@xats/validator'

console.log('✅ @xats/validator imported successfully')

const simpleDoc = {
  schemaVersion: '0.4.0',
  bibliographicEntry: {
    type: 'book',
    title: 'Test Document',
    author: [{ literal: 'Test Author' }]
  },
  subject: 'Test Subject',
  bodyMatter: {
    contents: []
  }
}

const result = validateXatsDocument(simpleDoc)
console.log('✅ Validation result:', result.valid ? 'Valid' : 'Invalid')
console.log('🎉 xats is working correctly!')
```

```typescript [TypeScript]
import { validateXatsDocument } from '@xats/validator'
import type { XatsDocument } from '@xats/types'

console.log('✅ @xats/validator imported successfully')

const simpleDoc: Partial<XatsDocument> = {
  schemaVersion: '0.4.0',
  bibliographicEntry: {
    type: 'book',
    title: 'Test Document',
    author: [{ literal: 'Test Author' }]
  },
  subject: 'Test Subject',
  bodyMatter: {
    contents: []
  }
}

const result = validateXatsDocument(simpleDoc)
console.log('✅ Validation result:', result.valid ? 'Valid' : 'Invalid')
console.log('🎉 xats is working correctly!')
```

:::

Run the test:
```bash
node test.js
# or for TypeScript: npx tsx test.ts
```

### CLI Installation Check

If you installed the CLI tools:

```bash
# Check version
xats --version

# Test validation
echo '{"schemaVersion":"0.4.0"}' | xats validate --stdin

# List available commands
xats --help
```

### Package Version Check

Verify all packages are correctly installed:

```bash
npm list @xats/schema @xats/validator @xats/types
```

Expected output:
```
├── @xats/schema@0.4.0
├── @xats/types@0.4.0
└── @xats/validator@0.4.0
```

## Troubleshooting

### Common Installation Issues

#### Node.js Version Issues

**Problem:** `error: Unsupported Node.js version`

**Solution:** Update Node.js to version 18 or higher:
```bash
# Check current version
node --version

# Install latest LTS version from https://nodejs.org/
# Or use version manager like nvm:
nvm install --lts
nvm use --lts
```

#### Package Manager Conflicts

**Problem:** Mixing package managers causes issues

**Solution:** Stick to one package manager per project:
```bash
# Remove conflicting lock files
rm package-lock.json yarn.lock pnpm-lock.yaml

# Reinstall with your preferred manager
npm install  # or yarn install / pnpm install
```

#### TypeScript Import Errors

**Problem:** `Cannot find module '@xats/types'`

**Solutions:**

1. **Check installation:**
```bash
npm list @xats/types
```

2. **Install missing types:**
```bash
npm install @xats/types
```

3. **Check TypeScript configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",  // or "node"
    "esModuleInterop": true
  }
}
```

#### Global CLI Installation Issues

**Problem:** `command not found: xats`

**Solutions:**

1. **Check global installation:**
```bash
npm list -g @xats/cli
```

2. **Reinstall globally:**
```bash
npm install -g @xats/cli
```

3. **Check PATH:**
```bash
echo $PATH
npm config get prefix
```

#### Memory Issues with Large Documents

**Problem:** `JavaScript heap out of memory`

**Solution:** Increase Node.js memory limit:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
node your-script.js
```

### Platform-Specific Issues

#### Windows

- Use PowerShell or Command Prompt as Administrator for global installs
- Consider using WSL2 for a Linux-like environment
- Path issues may require restarting your terminal

#### macOS

- May need to use `sudo` for global npm installations
- Consider using Homebrew to manage Node.js
- M1/M2 Macs: ensure you're using ARM64-compatible Node.js

#### Linux

- Install Node.js through your distribution's package manager or NodeSource
- Avoid using the system-installed npm for global packages
- Use a Node.js version manager like nvm for best results

## Next Steps

After successful installation:

1. **📚 Learn the Basics** - [Quick Start Guide](./quickstart.md)
2. **🧠 Understand Concepts** - [Core Concepts](./concepts.md)
3. **📝 Create Content** - [Authoring Guide](../guides/authoring.md)
4. **🔧 Configure Tools** - [CLI Documentation](../packages/cli/)

## Getting Help

If you encounter issues not covered here:

- **📖 Check Documentation** - Search this documentation site
- **💬 Community Support** - [GitHub Discussions](https://github.com/xats-org/core/discussions)
- **🐛 Report Bugs** - [GitHub Issues](https://github.com/xats-org/core/issues)
- **📧 Direct Support** - [support@xats.org](mailto:support@xats.org)

---

*Installation complete? Continue with the [Quick Start Guide](./quickstart.md) to create your first xats document.*