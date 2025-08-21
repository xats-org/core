# xats Package Ecosystem

The xats ecosystem is organized as a TypeScript monorepo with focused, single-purpose packages. Each package serves a specific role in the xats workflow, from schema definition to validation to rendering.

## Package Overview

| Package | Version | Description | Bundle Size |
|---------|---------|-------------|-------------|
| [@xats/schema](#xatsschema) | ![npm](https://img.shields.io/npm/v/@xats/schema) | Core JSON Schema definitions | ![bundle](https://img.shields.io/bundlephobia/minzip/@xats/schema) |
| [@xats/validator](#xatsvalidator) | ![npm](https://img.shields.io/npm/v/@xats/validator) | Document validation and error reporting | ![bundle](https://img.shields.io/bundlephobia/minzip/@xats/validator) |
| [@xats/types](#xatstypes) | ![npm](https://img.shields.io/npm/v/@xats/types) | TypeScript type definitions | ![bundle](https://img.shields.io/bundlephobia/minzip/@xats/types) |
| [@xats/cli](#xatscli) | ![npm](https://img.shields.io/npm/v/@xats/cli) | Command-line interface | ![bundle](https://img.shields.io/bundlephobia/minzip/@xats/cli) |
| [@xats/renderer](#xatsrenderer) | ![npm](https://img.shields.io/npm/v/@xats/renderer) | Document rendering framework | ![bundle](https://img.shields.io/bundlephobia/minzip/@xats/renderer) |
| [@xats/mcp-server](#xatsmcp-server) | ![npm](https://img.shields.io/npm/v/@xats/mcp-server) | Model Context Protocol server | ![bundle](https://img.shields.io/bundlephobia/minzip/@xats/mcp-server) |
| [@xats/utils](#xatsutils) | ![npm](https://img.shields.io/npm/v/@xats/utils) | Shared utilities and helpers | ![bundle](https://img.shields.io/bundlephobia/minzip/@xats/utils) |
| [@xats/examples](#xatsexamples) | ![npm](https://img.shields.io/npm/v/@xats/examples) | Example documents and templates | ![bundle](https://img.shields.io/bundlephobia/minzip/@xats/examples) |

## Core Packages

### @xats/schema
The foundation of the xats ecosystem, containing the JSON Schema definitions that define the structure and validation rules for xats documents.

- **Purpose**: Schema definitions and validation rules
- **Key Features**: JSON Schema files, TypeScript schema loaders, validation helpers
- **Dependencies**: Minimal (only @xats/types)
- **Use Cases**: Schema validation, document structure definition, IDE support

[📖 View Documentation](./schema/) | [📦 NPM Package](https://npmjs.com/package/@xats/schema)

### @xats/validator
Comprehensive validation engine for xats documents with detailed error reporting and performance optimization.

- **Purpose**: Document validation and error reporting
- **Key Features**: Fast validation, detailed error messages, schema version compatibility
- **Dependencies**: @xats/schema, @xats/types, ajv
- **Use Cases**: Document validation, CI/CD pipelines, development tools

[📖 View Documentation](./validator/) | [📦 NPM Package](https://npmjs.com/package/@xats/validator)

### @xats/types
Complete TypeScript type definitions for all xats schema objects, enabling type-safe development.

- **Purpose**: TypeScript type definitions
- **Key Features**: Complete type coverage, utility types, type guards
- **Dependencies**: None
- **Use Cases**: TypeScript development, IDE support, type safety

[📖 View Documentation](./types/) | [📦 NPM Package](https://npmjs.com/package/@xats/types)

## Tool Packages

### @xats/cli
Command-line interface for working with xats documents, including validation, conversion, and development tools.

- **Purpose**: Command-line tools and utilities
- **Key Features**: Document validation, format conversion, development server
- **Dependencies**: All core packages
- **Use Cases**: Development workflow, CI/CD automation, batch processing

[📖 View Documentation](./cli/) | [📦 NPM Package](https://npmjs.com/package/@xats/cli)

### @xats/renderer
Flexible rendering framework for converting xats documents into various output formats (HTML, PDF, etc.).

- **Purpose**: Document rendering and output generation
- **Key Features**: Multiple output formats, customizable themes, accessibility support
- **Dependencies**: Core packages, rendering libraries
- **Use Cases**: Website generation, PDF creation, custom renderers

[📖 View Documentation](./renderer/) | [📦 NPM Package](https://npmjs.com/package/@xats/renderer)

### @xats/mcp-server
Model Context Protocol server implementation for seamless integration with AI tools and educational platforms.

- **Purpose**: AI tool integration via MCP
- **Key Features**: Schema validation, document analysis, AI assistant support
- **Dependencies**: Core packages, MCP libraries
- **Use Cases**: AI tool integration, educational technology platforms

[📖 View Documentation](./mcp-server/) | [📦 NPM Package](https://npmjs.com/package/@xats/mcp-server)

## Utility Packages

### @xats/utils
Shared utilities and helper functions used across the xats ecosystem.

- **Purpose**: Shared utilities and helpers
- **Key Features**: Common functions, type guards, utility classes
- **Dependencies**: @xats/types
- **Use Cases**: Package development, custom tool creation

[📖 View Documentation](./utils/) | [📦 NPM Package](https://npmjs.com/package/@xats/utils)

### @xats/examples
Collection of example xats documents, templates, and sample content for learning and testing.

- **Purpose**: Example documents and templates
- **Key Features**: Complete examples, templates, test documents
- **Dependencies**: None (data only)
- **Use Cases**: Learning, testing, template creation

[📖 View Documentation](./examples/) | [📦 NPM Package](https://npmjs.com/package/@xats/examples)

## Installation Guide

### Quick Start
Install the essential packages for most use cases:

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

### Full Development Setup
For development or advanced usage, install all packages:

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

### Package-Specific Installation
Install only what you need:

```bash
# For validation only
npm install @xats/validator

# For CLI tools
npm install -g @xats/cli

# For rendering
npm install @xats/renderer

# For AI integration
npm install @xats/mcp-server
```

## Usage Examples

### Basic Validation
```typescript
import { validateXatsDocument } from '@xats/validator'
import type { XatsDocument } from '@xats/types'

const document: XatsDocument = {
  schemaVersion: "0.4.0",
  // ... document content
}

const result = validateXatsDocument(document)
console.log(result.valid ? 'Valid!' : 'Errors:', result.errors)
```

### CLI Usage
```bash
# Validate a document
xats validate document.json

# Convert formats
xats convert document.json --output html

# Start development server
xats dev --watch src/
```

### Rendering
```typescript
import { createRenderer } from '@xats/renderer'

const renderer = createRenderer({
  format: 'html',
  theme: 'default'
})

const html = await renderer.render(document)
```

## Package Dependencies

```mermaid
graph TD
    A[@xats/types] --> B[@xats/schema]
    A --> C[@xats/validator]
    A --> D[@xats/utils]
    B --> C
    B --> E[@xats/cli]
    C --> E
    C --> F[@xats/renderer]
    D --> E
    D --> F
    A --> G[@xats/mcp-server]
    B --> G
    C --> G
    H[@xats/examples] -.-> A
```

## Version Compatibility

All packages follow semantic versioning and are released together. Version compatibility:

| Package Version | Schema Version | Node.js | TypeScript |
|----------------|----------------|---------|------------|
| 0.4.x | 0.4.0 | ≥18.0.0 | ≥5.0.0 |
| 0.3.x | 0.3.0 | ≥18.0.0 | ≥5.0.0 |
| 0.2.x | 0.2.0 | ≥16.0.0 | ≥4.5.0 |
| 0.1.x | 0.1.0 | ≥16.0.0 | ≥4.5.0 |

## Development

### Monorepo Structure
```
packages/
├── schema/          # JSON Schema definitions
├── validator/       # Validation engine
├── types/           # TypeScript types
├── cli/             # Command-line tools
├── renderer/        # Rendering framework
├── mcp-server/      # MCP server
├── utils/           # Shared utilities
└── examples/        # Example documents
```

### Building Packages
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @xats/validator build

# Development mode
pnpm dev
```

### Testing
```bash
# Test all packages
pnpm test

# Test specific package
pnpm --filter @xats/validator test

# Watch mode
pnpm test:watch
```

## Contributing

Each package welcomes contributions! Please see:
- [Contributing Guide](../project/contributing.md)
- [Development Setup](../project/contributing.md#development-setup)
- [Package-specific guidelines](./schema/#contributing)

---

*Need help choosing packages? Check out our [Getting Started Guide](../getting-started/quickstart.md) or [Integration Examples](../guides/integration/).*