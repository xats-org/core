# @xats/schema

[![npm version](https://img.shields.io/npm/v/@xats/schema)](https://npmjs.com/package/@xats/schema)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@xats/schema)](https://bundlephobia.com/package/@xats/schema)
[![license](https://img.shields.io/npm/l/@xats/schema)](https://github.com/xats-org/core/blob/main/LICENSE.md)

The `@xats/schema` package contains the core JSON Schema definitions for the Extensible Academic Textbook Schema. It provides the foundational schema files, TypeScript schema loaders, and validation helpers that define the structure and rules for xats documents.

## Features

- 📋 **Complete JSON Schema Definitions** - All xats schema objects with full validation rules
- 🔍 **Schema Version Management** - Support for multiple schema versions with compatibility
- 📦 **TypeScript Integration** - Type-safe schema loading and validation
- 🚀 **Performance Optimized** - Compiled schemas for fast validation
- 🔧 **Developer Tools** - Utilities for schema introspection and debugging

## Installation

::: code-group

```bash [npm]
npm install @xats/schema
```

```bash [yarn]
yarn add @xats/schema
```

```bash [pnpm]
pnpm add @xats/schema
```

:::

## Quick Start

### Loading Schemas

```typescript
import { getSchema, getAllSchemas } from '@xats/schema'

// Get the current schema
const currentSchema = getSchema()

// Get a specific version
const v040Schema = getSchema('0.4.0')

// Get all available schemas
const allSchemas = getAllSchemas()
console.log(Object.keys(allSchemas)) // ['0.1.0', '0.2.0', '0.3.0', '0.4.0']
```

### Schema Information

```typescript
import { getSchemaInfo, getSupportedVersions } from '@xats/schema'

// Get schema metadata
const info = getSchemaInfo('0.4.0')
console.log(info.version)    // '0.4.0'
console.log(info.id)         // 'https://xats.org/schemas/0.4.0/xats.json'
console.log(info.title)      // 'xats Document Schema'

// List all supported versions
const versions = getSupportedVersions()
console.log(versions) // ['0.1.0', '0.2.0', '0.3.0', '0.4.0']
```

### Direct Schema Access

```typescript
import { schemas } from '@xats/schema'

// Access schemas directly
const v040 = schemas['0.4.0']
const latest = schemas[schemas.latest]

// Schema properties
console.log(v040.$id)     // Schema ID
console.log(v040.title)   // Schema title
console.log(v040.type)    // 'object'
```

## API Reference

### Core Functions

#### `getSchema(version?: string)`

Returns the JSON Schema for the specified version.

```typescript
function getSchema(version?: string): JSONSchema7
```

**Parameters:**
- `version` (optional): Schema version string (e.g., '0.4.0'). Defaults to latest.

**Returns:** JSON Schema object

**Example:**
```typescript
import { getSchema } from '@xats/schema'

const schema = getSchema('0.4.0')
// Use with a validator like ajv
```

#### `getAllSchemas()`

Returns all available schemas indexed by version.

```typescript
function getAllSchemas(): Record<string, JSONSchema7>
```

**Returns:** Object mapping version strings to schema objects

#### `getSchemaInfo(version?: string)`

Returns metadata about a schema version.

```typescript
function getSchemaInfo(version?: string): SchemaInfo
```

**Returns:**
```typescript
interface SchemaInfo {
  version: string
  id: string
  title: string
  description: string
  releaseDate: string
  deprecated?: boolean
  supportEnds?: string
}
```

#### `getSupportedVersions()`

Returns array of all supported schema versions.

```typescript
function getSupportedVersions(): string[]
```

### Type Definitions

```typescript
import type { SchemaVersion, JSONSchema7 } from '@xats/schema'

type SchemaVersion = '0.1.0' | '0.2.0' | '0.3.0' | '0.4.0'

interface SchemaInfo {
  version: string
  id: string
  title: string
  description: string
  releaseDate: string
  deprecated?: boolean
  supportEnds?: string
}
```

## Schema Versions

### Current Version: 0.4.0

The latest schema version includes:

- **Monorepo Support** - Enhanced package structure and imports
- **Improved Types** - Better TypeScript integration
- **Performance** - Optimized validation and loading
- **AI Integration** - Support for MCP and AI tools

### Version History

| Version | Release Date | Status | Key Features |
|---------|-------------|--------|--------------|
| 0.4.0 | 2024-12-20 | Current | Monorepo, AI integration, performance |
| 0.3.0 | 2024-08-19 | Supported | File modularity, i18n, indexing |
| 0.2.0 | 2024-05-15 | Supported | Assessments, accessibility, LTI |
| 0.1.0 | 2024-01-30 | Supported | Core schema, basic content |

## Schema Structure

### Root Schema Properties

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://xats.org/schemas/0.4.0/xats.json",
  "title": "xats Document Schema",
  "type": "object",
  "required": ["schemaVersion", "bibliographicEntry", "subject", "bodyMatter"],
  "properties": {
    "schemaVersion": {
      "const": "0.4.0"
    },
    "bibliographicEntry": {
      "$ref": "#/$defs/BibliographicEntry"
    },
    "subject": {
      "type": "string"
    },
    "bodyMatter": {
      "$ref": "#/$defs/BodyMatter"
    }
    // ... additional properties
  }
}
```

### Key Schema Objects

- **XatsDocument** - Root document object
- **StructuralContainer** - Base for Units, Chapters, Sections
- **ContentBlock** - Content elements with block types
- **SemanticText** - Rich text with typed runs
- **Assessment** - Assessment and quiz objects
- **Pathway** - Adaptive learning paths

## Advanced Usage

### Schema Validation with AJV

```typescript
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { getSchema } from '@xats/schema'

const ajv = new Ajv({ strict: false })
addFormats(ajv)

const schema = getSchema('0.4.0')
const validate = ajv.compile(schema)

const document = {
  schemaVersion: '0.4.0',
  // ... document content
}

const valid = validate(document)
if (!valid) {
  console.error('Validation errors:', validate.errors)
}
```

### Custom Schema Extensions

```typescript
import { getSchema } from '@xats/schema'

const baseSchema = getSchema('0.4.0')

// Extend schema with custom properties
const extendedSchema = {
  ...baseSchema,
  properties: {
    ...baseSchema.properties,
    customProperty: {
      type: 'string',
      description: 'Custom extension property'
    }
  }
}
```

### Schema Introspection

```typescript
import { getSchema } from '@xats/schema'

const schema = getSchema('0.4.0')

// List all defined objects
const definitions = Object.keys(schema.$defs || {})
console.log('Available objects:', definitions)

// Get specific object definition
const contentBlock = schema.$defs?.ContentBlock
console.log('ContentBlock properties:', Object.keys(contentBlock.properties))
```

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/xats-org/core.git
cd core

# Install dependencies
pnpm install

# Build the schema package
pnpm --filter @xats/schema build
```

### Testing

```bash
# Run tests
pnpm --filter @xats/schema test

# Run tests in watch mode
pnpm --filter @xats/schema test:watch

# Check test coverage
pnpm --filter @xats/schema test:coverage
```

### Schema Development

The schema files are located in `packages/schema/schemas/`:

```
schemas/
├── 0.4.0/
│   ├── xats.json           # Main schema file
│   ├── definitions/        # Object definitions
│   └── vocabularies/       # Vocabulary schemas
├── 0.3.0/                  # Previous versions
└── common/                 # Shared definitions
```

## Migration

### From v0.3.0 to v0.4.0

The main changes in v0.4.0 are organizational and performance-related:

```typescript
// Old import (still works)
import { getSchema } from '@xats/schema'

// New features
import { getSchemaInfo, getSupportedVersions } from '@xats/schema'

// Schema loading is more efficient
const schema = getSchema('0.4.0') // Cached and optimized
```

### Compatibility

All schema versions are backward compatible within the same major version:
- v0.4.0 documents validate against v0.4.0 schema
- v0.3.0 documents validate against v0.3.0 schema
- Migration tools available for upgrading between versions

## Contributing

We welcome contributions to the schema package! Please see our [Contributing Guide](../../project/contributing.md) for details.

### Schema Development Guidelines

1. **Backward Compatibility** - New versions must not break existing documents
2. **Semantic Versioning** - Follow semver for schema changes
3. **Documentation** - All schema changes must be documented
4. **Testing** - Include tests for new schema features
5. **Examples** - Provide examples for new schema objects

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/xats-org/core/issues) on GitHub.

## Related Packages

- [`@xats/validator`](../validator/) - Use schemas for document validation
- [`@xats/types`](../types/) - TypeScript types generated from schemas
- [`@xats/cli`](../cli/) - Command-line tools using schemas

## License

MIT License. See [LICENSE.md](https://github.com/xats-org/core/blob/main/LICENSE.md) for details.