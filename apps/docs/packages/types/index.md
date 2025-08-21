# @xats/types

[![npm version](https://img.shields.io/npm/v/@xats/types)](https://npmjs.com/package/@xats/types)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@xats/types)](https://bundlephobia.com/package/@xats/types)
[![license](https://img.shields.io/npm/l/@xats/types)](https://github.com/xats-org/core/blob/main/LICENSE.md)

The `@xats/types` package provides comprehensive TypeScript type definitions for all xats schema objects. It enables type-safe development when working with xats documents and provides excellent IDE support with autocompletion and error checking.

## Features

- 🎯 **Complete Type Coverage** - Types for every xats schema object and property
- 🛡️ **Type Safety** - Catch errors at compile time, not runtime
- 🔍 **IntelliSense Support** - Rich autocompletion and documentation in your IDE
- 🚀 **Zero Runtime** - Pure TypeScript types with no JavaScript output
- 🔧 **Utility Types** - Helper types for common operations and transformations
- 📖 **Comprehensive Documentation** - JSDoc comments on all types

## Installation

::: code-group

```bash [npm]
npm install @xats/types
```

```bash [yarn]
yarn add @xats/types
```

```bash [pnpm]
pnpm add @xats/types
```

:::

::: tip
The types package has no dependencies and adds zero runtime overhead to your application.
:::

## Quick Start

### Basic Usage

```typescript
import type { 
  XatsDocument, 
  ContentBlock, 
  SemanticText,
  ValidationResult 
} from '@xats/types'

// Type-safe document creation
const document: XatsDocument = {
  schemaVersion: '0.4.0',
  bibliographicEntry: {
    type: 'book',
    title: 'My Textbook',
    author: [{ literal: 'Jane Doe' }]
  },
  subject: 'Computer Science',
  bodyMatter: {
    contents: [
      // TypeScript will validate this structure
    ]
  }
}

// Type-safe content block
const paragraph: ContentBlock = {
  id: 'para-1',
  blockType: 'https://xats.org/core/blocks/paragraph',
  content: {
    text: {
      runs: [
        { type: 'text', text: 'Hello, World!' }
      ]
    }
  }
}
```

### With Validation

```typescript
import { validateXatsDocument } from '@xats/validator'
import type { XatsDocument, ValidationResult } from '@xats/types'

function processDocument(doc: unknown): XatsDocument | null {
  const result: ValidationResult = validateXatsDocument(doc)
  
  if (result.valid) {
    // TypeScript knows doc is now a valid XatsDocument
    return doc as XatsDocument
  }
  
  console.error('Invalid document:', result.errors)
  return null
}
```

## Core Types

### Document Structure

#### `XatsDocument`
The root document type containing all required properties.

```typescript
interface XatsDocument {
  schemaVersion: SchemaVersion
  bibliographicEntry: BibliographicEntry
  subject: string
  frontMatter?: FrontMatter
  bodyMatter: BodyMatter
  backMatter?: BackMatter
  id?: string
  tags?: string[]
  extensions?: Record<string, unknown>
}
```

#### `BodyMatter`
The main content container.

```typescript
interface BodyMatter {
  contents: Array<Unit | Chapter>
  id?: string
  tags?: string[]
  extensions?: Record<string, unknown>
}
```

### Structural Containers

#### `Unit`
Top-level organizational container.

```typescript
interface Unit extends StructuralContainer {
  type: 'Unit'
  chapters: Chapter[]
  learningObjectives?: LearningObjective[]
  assessments?: Assessment[]
  pathways?: Pathway[]
}
```

#### `Chapter`
Chapter-level container within units.

```typescript
interface Chapter extends StructuralContainer {
  type: 'Chapter'
  sections?: Section[]
  contentBlocks?: ContentBlock[]
  learningObjectives?: LearningObjective[]
  assessments?: Assessment[]
  pathways?: Pathway[]
}
```

#### `Section`
Section-level container within chapters.

```typescript
interface Section extends StructuralContainer {
  type: 'Section'
  subsections?: Section[]
  contentBlocks?: ContentBlock[]
  learningObjectives?: LearningObjective[]
  assessments?: Assessment[]
  pathways?: Pathway[]
}
```

### Content Types

#### `ContentBlock`
Base type for all content elements.

```typescript
interface ContentBlock extends XatsObject {
  blockType: string  // URI identifying the block type
  content: Record<string, unknown>
  renderingHints?: RenderingHints
}
```

#### `SemanticText`
Rich text with typed runs for semantic markup.

```typescript
interface SemanticText {
  runs: TextRun[]
}

type TextRun = 
  | TextRun_Text
  | TextRun_Emphasis
  | TextRun_Strong
  | TextRun_Reference
  | TextRun_Citation
```

### Assessment Types

#### `Assessment`
Container for educational assessments.

```typescript
interface Assessment extends XatsObject {
  assessmentType: string  // URI identifying assessment type
  title?: SemanticText
  description?: SemanticText
  questions: Question[]
  timeLimit?: number
  attempts?: number
  passingScore?: number
}
```

#### `Question`
Individual assessment question.

```typescript
interface Question extends XatsObject {
  questionType: string  // URI identifying question type
  prompt: SemanticText
  points?: number
  feedback?: SemanticText
  // Additional properties depend on question type
}
```

## Utility Types

### Type Guards

The package includes utility functions to check types at runtime:

```typescript
import { 
  isXatsDocument,
  isContentBlock,
  isSemanticText,
  isUnit,
  isChapter,
  isSection 
} from '@xats/types'

function processContent(content: unknown) {
  if (isXatsDocument(content)) {
    // TypeScript knows content is XatsDocument
    console.log(`Processing: ${content.bibliographicEntry.title}`)
  }
  
  if (isContentBlock(content)) {
    // TypeScript knows content is ContentBlock
    console.log(`Block type: ${content.blockType}`)
  }
}
```

### Utility Type Helpers

#### `Partial` Types
For building documents incrementally:

```typescript
import type { PartialXatsDocument, PartialContentBlock } from '@xats/types'

const draft: PartialXatsDocument = {
  schemaVersion: '0.4.0',
  bibliographicEntry: {
    type: 'book',
    title: 'Draft Document'
    // Other required fields can be added later
  }
}
```

#### `Pick` and `Omit` Helpers
For working with subsets of types:

```typescript
import type { XatsDocument } from '@xats/types'

// Just the metadata
type DocumentMetadata = Pick<XatsDocument, 'bibliographicEntry' | 'subject'>

// Document without content
type DocumentShell = Omit<XatsDocument, 'bodyMatter'>
```

#### `Array` Element Types
Extract types from arrays:

```typescript
import type { XatsDocument } from '@xats/types'

// Type of a single content item
type ContentItem = XatsDocument['bodyMatter']['contents'][number]

// Type of a single text run
type SingleTextRun = SemanticText['runs'][number]
```

## Advanced Usage

### Generic Content Blocks

Create type-safe content blocks for specific block types:

```typescript
interface ParagraphContent {
  text: SemanticText
  align?: 'left' | 'center' | 'right' | 'justify'
}

interface ParagraphBlock extends ContentBlock {
  blockType: 'https://xats.org/core/blocks/paragraph'
  content: ParagraphContent
}

function createParagraph(text: string): ParagraphBlock {
  return {
    id: `para-${Date.now()}`,
    blockType: 'https://xats.org/core/blocks/paragraph',
    content: {
      text: {
        runs: [{ type: 'text', text }]
      }
    }
  }
}
```

### Document Builders

Create fluent APIs for building documents:

```typescript
import type { XatsDocument, Unit, Chapter, ContentBlock } from '@xats/types'

class DocumentBuilder {
  private document: Partial<XatsDocument> = {
    schemaVersion: '0.4.0'
  }
  
  title(title: string): this {
    this.document.bibliographicEntry = {
      ...this.document.bibliographicEntry,
      type: 'book',
      title
    }
    return this
  }
  
  subject(subject: string): this {
    this.document.subject = subject
    return this
  }
  
  addUnit(unit: Unit): this {
    if (!this.document.bodyMatter) {
      this.document.bodyMatter = { contents: [] }
    }
    this.document.bodyMatter.contents.push(unit)
    return this
  }
  
  build(): XatsDocument {
    // TypeScript will ensure all required fields are present
    return this.document as XatsDocument
  }
}

const doc = new DocumentBuilder()
  .title('My Textbook')
  .subject('Computer Science')
  .addUnit(myUnit)
  .build()
```

### Custom Extensions

Extend types for custom properties:

```typescript
import type { XatsObject } from '@xats/types'

// Custom extension interface
interface CustomExtensions {
  'x-my-extension': {
    customField: string
    customData: number[]
  }
}

// Extended document type
interface ExtendedXatsDocument extends XatsDocument {
  extensions?: Record<string, unknown> & CustomExtensions
}

// Usage
const extendedDoc: ExtendedXatsDocument = {
  // ... standard xats document properties
  extensions: {
    'x-my-extension': {
      customField: 'custom value',
      customData: [1, 2, 3]
    }
  }
}
```

## Schema Version Types

### Version Constants

```typescript
import type { SchemaVersion } from '@xats/types'

const CURRENT_VERSION: SchemaVersion = '0.4.0'
const SUPPORTED_VERSIONS: SchemaVersion[] = ['0.1.0', '0.2.0', '0.3.0', '0.4.0']
```

### Version-Specific Types

```typescript
// Import version-specific types
import type { 
  XatsDocument_v040,
  XatsDocument_v030,
  ContentBlock_v040 
} from '@xats/types'

function migrateDocument(
  oldDoc: XatsDocument_v030
): XatsDocument_v040 {
  // Type-safe migration logic
  return {
    ...oldDoc,
    schemaVersion: '0.4.0',
    // Apply v0.4.0 specific changes
  }
}
```

## Development

### Type Generation

The types are automatically generated from the JSON Schema definitions:

```bash
# Generate types from schema
pnpm --filter @xats/types generate

# Watch for schema changes
pnpm --filter @xats/types generate:watch
```

### Custom Type Testing

Test your custom types:

```typescript
import type { XatsDocument } from '@xats/types'

// Type-only test (no runtime code)
type TestDocument = XatsDocument

// Ensure required properties are present
const _typeTest: TestDocument = {} as TestDocument
//    ^? Type error: missing required properties

// Test utility types
type DocumentTitle = XatsDocument['bibliographicEntry']['title']
//   ^? string

type ContentArray = XatsDocument['bodyMatter']['contents']
//   ^? Array<Unit | Chapter>
```

## Migration

### From v0.3.0 to v0.4.0

The types package maintains backward compatibility:

```typescript
// v0.3.0 imports (still work)
import type { XatsDocument } from '@xats/types'

// v0.4.0 new features
import type { 
  ValidationResult,    // New
  ValidationError,     // New
  SchemaInfo,         // New
  PartialXatsDocument // New
} from '@xats/types'
```

### Breaking Changes

No breaking changes in v0.4.0. All existing types remain compatible.

## Common Patterns

### Form Validation

```typescript
import type { XatsDocument } from '@xats/types'

interface DocumentForm {
  title: string
  author: string
  subject: string
  // Form fields...
}

function formToDocument(form: DocumentForm): Partial<XatsDocument> {
  return {
    schemaVersion: '0.4.0',
    bibliographicEntry: {
      type: 'book',
      title: form.title,
      author: [{ literal: form.author }]
    },
    subject: form.subject
  }
}
```

### API Responses

```typescript
import type { XatsDocument, ValidationResult } from '@xats/types'

interface DocumentResponse {
  document: XatsDocument
  validation: ValidationResult
  metadata: {
    size: number
    lastModified: string
  }
}

async function fetchDocument(id: string): Promise<DocumentResponse> {
  // API call implementation
}
```

### State Management

```typescript
import type { XatsDocument } from '@xats/types'

interface DocumentState {
  document: XatsDocument | null
  isLoading: boolean
  error: string | null
  isDirty: boolean
}

type DocumentAction = 
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: XatsDocument }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_DOCUMENT'; payload: Partial<XatsDocument> }
```

## IDE Support

### VS Code

For the best experience in VS Code:

1. **Install TypeScript Extension** (usually pre-installed)

2. **Configure workspace settings (`.vscode/settings.json`):**
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.suggest.includeCompletionsForModuleExports": true
}
```

3. **Use JSDoc hovers** - Hover over any type to see documentation

### Other IDEs

The types work with any TypeScript-aware editor:
- **WebStorm/IntelliJ** - Full IntelliSense support
- **Vim/Neovim** - With TypeScript language server
- **Emacs** - With tide or lsp-mode
- **Sublime Text** - With TypeScript plugin

## Troubleshooting

### Common Issues

#### Import Errors

**Problem:** `Cannot find module '@xats/types'`

**Solution:**
```bash
# Ensure package is installed
npm install @xats/types

# Check TypeScript configuration
{
  "compilerOptions": {
    "moduleResolution": "bundler"  // or "node"
  }
}
```

#### Type Compatibility

**Problem:** Type mismatch between packages

**Solution:** Ensure all @xats packages are the same version:
```bash
npm list @xats/schema @xats/validator @xats/types
```

#### Missing Type Definitions

**Problem:** Types not recognized in IDE

**Solution:**
```typescript
// Explicit import
import type { XatsDocument } from '@xats/types'

// Or reference types
/// <reference types="@xats/types" />
```

## Contributing

We welcome contributions to improve the types! Please see our [Contributing Guide](../../project/contributing.md).

### Type Development

```bash
# Clone repository
git clone https://github.com/xats-org/core.git
cd core

# Install dependencies
pnpm install

# Generate types from schema
pnpm --filter @xats/types generate

# Test types
pnpm --filter @xats/types test
```

## Related Packages

- [`@xats/schema`](../schema/) - Source JSON schemas for these types
- [`@xats/validator`](../validator/) - Uses these types for validation
- [`@xats/cli`](../cli/) - Command-line tools with type support

## License

MIT License. See [LICENSE.md](https://github.com/xats-org/core/blob/main/LICENSE.md) for details.