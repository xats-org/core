# @xats/validator

[![npm version](https://img.shields.io/npm/v/@xats/validator)](https://npmjs.com/package/@xats/validator)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@xats/validator)](https://bundlephobia.com/package/@xats/validator)
[![license](https://img.shields.io/npm/l/@xats/validator)](https://github.com/xats-org/core/blob/main/LICENSE.md)

The `@xats/validator` package provides comprehensive validation capabilities for xats documents. It offers fast, accurate validation with detailed error reporting and supports all schema versions with automatic compatibility handling.

## Features

- ⚡ **High Performance** - Optimized validation engine with caching
- 📝 **Detailed Error Reports** - Human-readable error messages with context
- 🔄 **Multi-Version Support** - Validates documents across all schema versions
- 🎯 **Precise Location** - Exact error locations with JSON path information
- 🛡️ **Type Safety** - Full TypeScript integration with type guards
- 🔧 **Configurable** - Customizable validation options and error formatting

## Installation

::: code-group

```bash [npm]
npm install @xats/validator
```

```bash [yarn]
yarn add @xats/validator
```

```bash [pnpm]
pnpm add @xats/validator
```

:::

## Quick Start

### Basic Validation

```typescript
import { validateXatsDocument } from '@xats/validator'
import type { XatsDocument } from '@xats/types'

const document: XatsDocument = {
  schemaVersion: '0.4.0',
  bibliographicEntry: {
    type: 'book',
    title: 'Sample Textbook',
    author: [{ literal: 'Jane Doe' }]
  },
  subject: 'Computer Science',
  bodyMatter: {
    contents: [
      // ... document content
    ]
  }
}

const result = validateXatsDocument(document)

if (result.valid) {
  console.log('✅ Document is valid!')
} else {
  console.error('❌ Validation failed:')
  result.errors.forEach(error => {
    console.error(`  ${error.path}: ${error.message}`)
  })
}
```

### Validation with Options

```typescript
import { validateXatsDocument, type ValidationOptions } from '@xats/validator'

const options: ValidationOptions = {
  schemaVersion: '0.4.0',     // Force specific version
  strict: true,               // Strict validation mode
  allowUnknownFormats: false, // Reject unknown formats
  includeWarnings: true       // Include warnings in results
}

const result = validateXatsDocument(document, options)
```

## API Reference

### Core Functions

#### `validateXatsDocument(document, options?)`

Validates a complete xats document against the appropriate schema.

```typescript
function validateXatsDocument(
  document: unknown,
  options?: ValidationOptions
): ValidationResult
```

**Parameters:**
- `document`: The document to validate (any type)
- `options`: Optional validation configuration

**Returns:** `ValidationResult` object

#### `validateContentBlock(block, options?)`

Validates a single content block.

```typescript
function validateContentBlock(
  block: unknown,
  options?: ValidationOptions
): ValidationResult
```

#### `validateSemanticText(text, options?)`

Validates semantic text objects.

```typescript
function validateSemanticText(
  text: unknown,
  options?: ValidationOptions
): ValidationResult
```

### Types and Interfaces

#### `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings?: ValidationWarning[]
  schemaVersion: string
  performance?: {
    validationTime: number
    documentSize: number
  }
}
```

#### `ValidationError`

```typescript
interface ValidationError {
  path: string              // JSON path to error location
  message: string           // Human-readable error message
  code: string             // Error code for programmatic handling
  schemaPath: string       // Path in schema where rule is defined
  data?: any               // Invalid data that caused error
  suggestedFix?: string    // Suggested fix if available
}
```

#### `ValidationOptions`

```typescript
interface ValidationOptions {
  schemaVersion?: string          // Force specific schema version
  strict?: boolean               // Enable strict validation mode
  allowUnknownFormats?: boolean  // Allow unknown format values
  includeWarnings?: boolean      // Include warnings in results
  maxErrors?: number            // Stop after N errors
  customValidators?: Record<string, Function>  // Custom validation functions
}
```

## Advanced Usage

### Custom Validation

```typescript
import { createValidator, addCustomValidator } from '@xats/validator'

// Create custom validator instance
const validator = createValidator({
  strict: true,
  customValidators: {
    'custom-block-type': (data: any) => {
      if (!data.customField) {
        return { valid: false, message: 'Custom field is required' }
      }
      return { valid: true }
    }
  }
})

// Use custom validator
const result = validator.validate(document)
```

### Batch Validation

```typescript
import { validateMultiple } from '@xats/validator'

const documents = [doc1, doc2, doc3]
const results = await validateMultiple(documents, {
  parallel: true,        // Validate in parallel
  stopOnFirstError: false // Continue even if one fails
})

results.forEach((result, index) => {
  console.log(`Document ${index}: ${result.valid ? 'Valid' : 'Invalid'}`)
})
```

### Schema Version Detection

```typescript
import { detectSchemaVersion, isValidVersion } from '@xats/validator'

// Detect version from document
const version = detectSchemaVersion(document)
console.log(`Detected version: ${version}`)

// Check if version is supported
const supported = isValidVersion('0.4.0')
console.log(`Version 0.4.0 supported: ${supported}`)
```

### Error Analysis

```typescript
import { analyzeErrors, groupErrorsByType } from '@xats/validator'

const result = validateXatsDocument(document)

if (!result.valid) {
  // Analyze error patterns
  const analysis = analyzeErrors(result.errors)
  console.log(`Most common error: ${analysis.mostCommon.code}`)
  
  // Group errors by type
  const grouped = groupErrorsByType(result.errors)
  console.log('Errors by type:', grouped)
}
```

## Error Handling

### Common Error Types

#### Missing Required Properties

```typescript
// Error example
{
  path: '/bodyMatter',
  message: "Missing required property 'contents'",
  code: 'MISSING_REQUIRED_PROPERTY',
  schemaPath: '#/properties/bodyMatter/required',
  suggestedFix: "Add 'contents' property to bodyMatter"
}
```

#### Invalid Block Types

```typescript
// Error example
{
  path: '/bodyMatter/contents/0/contentBlocks/0/blockType',
  message: "Invalid block type 'invalid-type'",
  code: 'INVALID_BLOCK_TYPE',
  schemaPath: '#/$defs/ContentBlock/properties/blockType',
  suggestedFix: "Use a valid block type URI from the vocabulary"
}
```

#### Schema Version Mismatch

```typescript
// Error example
{
  path: '/schemaVersion',
  message: "Schema version '0.5.0' is not supported",
  code: 'UNSUPPORTED_SCHEMA_VERSION',
  schemaPath: '#/properties/schemaVersion',
  suggestedFix: "Use a supported version: 0.1.0, 0.2.0, 0.3.0, or 0.4.0"
}
```

### Error Recovery

```typescript
import { validateXatsDocument, fixCommonErrors } from '@xats/validator'

let result = validateXatsDocument(document)

if (!result.valid) {
  // Attempt automatic fixes for common errors
  const fixedDocument = fixCommonErrors(document, result.errors)
  
  // Re-validate fixed document
  result = validateXatsDocument(fixedDocument)
  
  if (result.valid) {
    console.log('✅ Document fixed and is now valid!')
  }
}
```

## Performance

### Validation Performance

The validator is optimized for performance with several techniques:

- **Schema Caching** - Compiled schemas are cached for reuse
- **Early Exit** - Validation stops on first error (configurable)
- **Parallel Validation** - Multiple documents can be validated concurrently
- **Incremental Validation** - Only validate changed parts of documents

### Benchmarks

| Document Size | Validation Time | Memory Usage |
|---------------|----------------|--------------|
| Small (< 1KB) | < 1ms | < 1MB |
| Medium (< 100KB) | < 10ms | < 5MB |
| Large (< 1MB) | < 100ms | < 20MB |
| Extra Large (< 10MB) | < 1s | < 100MB |

### Performance Tips

```typescript
// Cache validator instances
const validator = createValidator(options)
// Reuse for multiple validations

// Use batch validation for multiple documents
const results = await validateMultiple(documents, { parallel: true })

// Limit error collection for large documents
const result = validateXatsDocument(document, { maxErrors: 10 })
```

## Integration Examples

### Express.js Middleware

```typescript
import express from 'express'
import { validateXatsDocument } from '@xats/validator'

const validateMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const result = validateXatsDocument(req.body)
  
  if (!result.valid) {
    return res.status(400).json({
      error: 'Invalid xats document',
      validationErrors: result.errors
    })
  }
  
  next()
}

app.post('/documents', validateMiddleware, (req, res) => {
  // Document is guaranteed to be valid here
  res.json({ message: 'Document accepted' })
})
```

### CI/CD Pipeline

```typescript
import { validateMultiple } from '@xats/validator'
import { glob } from 'glob'

async function validateDocumentsInCI() {
  const files = await glob('**/*.xats.json')
  const documents = files.map(file => require(file))
  
  const results = await validateMultiple(documents, {
    parallel: true,
    includeWarnings: true
  })
  
  const failures = results.filter(r => !r.valid)
  
  if (failures.length > 0) {
    console.error(`❌ ${failures.length} documents failed validation`)
    process.exit(1)
  }
  
  console.log(`✅ All ${results.length} documents are valid`)
}
```

### React Hook

```typescript
import { useCallback, useState } from 'react'
import { validateXatsDocument } from '@xats/validator'

export function useXatsValidation() {
  const [result, setResult] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  
  const validate = useCallback(async (document) => {
    setIsValidating(true)
    try {
      const validationResult = validateXatsDocument(document)
      setResult(validationResult)
      return validationResult
    } finally {
      setIsValidating(false)
    }
  }, [])
  
  return { validate, result, isValidating }
}
```

## Testing

### Unit Testing with Jest

```typescript
import { validateXatsDocument } from '@xats/validator'

describe('Document Validation', () => {
  test('validates correct document', () => {
    const document = {
      schemaVersion: '0.4.0',
      // ... valid document
    }
    
    const result = validateXatsDocument(document)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
  
  test('rejects invalid document', () => {
    const document = {
      schemaVersion: '0.4.0'
      // Missing required fields
    }
    
    const result = validateXatsDocument(document)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
```

## Migration

### From v0.3.0 to v0.4.0

The validator API remains backward compatible:

```typescript
// v0.3.0 code (still works)
import { validateXatsDocument } from '@xats/validator'

// New v0.4.0 features
import { 
  validateXatsDocument,
  validateContentBlock,    // New
  validateSemanticText,    // New
  createValidator,         // New
  validateMultiple        // New
} from '@xats/validator'
```

### Schema Version Support

The validator supports all schema versions:

```typescript
// Validate different versions
const v010Result = validateXatsDocument(v010Document)  // Auto-detects v0.1.0
const v040Result = validateXatsDocument(v040Document)  // Auto-detects v0.4.0

// Force specific version
const result = validateXatsDocument(document, { schemaVersion: '0.3.0' })
```

## Troubleshooting

### Common Issues

**Q: Validation is slow for large documents**
A: Use `maxErrors` option to limit error collection, or validate in chunks.

**Q: Getting "Unknown format" errors**
A: Set `allowUnknownFormats: true` in options, or register custom formats.

**Q: Schema version not detected**
A: Ensure `schemaVersion` property is at document root with correct value.

### Debug Mode

```typescript
import { validateXatsDocument } from '@xats/validator'

const result = validateXatsDocument(document, {
  debug: true,  // Enable debug output
  verbose: true // Include additional context
})

// Check debug information
console.log('Validation details:', result.debug)
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../project/contributing.md).

### Development Setup

```bash
git clone https://github.com/xats-org/core.git
cd core
pnpm install
pnpm --filter @xats/validator test
```

## Related Packages

- [`@xats/schema`](../schema/) - Schema definitions used by validator
- [`@xats/types`](../types/) - TypeScript types for validation results
- [`@xats/cli`](../cli/) - Command-line validation tools

## License

MIT License. See [LICENSE.md](https://github.com/xats-org/core/blob/main/LICENSE.md) for details.