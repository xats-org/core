# @xats-org/mcp-server

Model Context Protocol (MCP) server for xats documents, providing AI assistants with comprehensive tools for working with educational content.

## Overview

The xats MCP server enables AI assistants like Claude to validate, create, analyze, extract, and transform xats educational documents through a standardized protocol. It implements five core tools that cover the complete lifecycle of xats document management.

## Installation

```bash
# Install as a dependency
npm install @xats-org/mcp-server

# Or install globally for CLI usage
npm install -g @xats-org/mcp-server
```

## Quick Start

### As a Library

```typescript
import { startServer } from '@xats-org/mcp-server';

// Start the MCP server with default configuration
await startServer();
```

### As a CLI

```bash
# Start the server
xats-mcp-server start

# Get server information
xats-mcp-server info

# List available tools
xats-mcp-server tools

# Validate a document
xats-mcp-server validate ./my-document.json
```

## MCP Tools

The server provides five comprehensive tools for working with xats documents:

### 1. xats_validate

Validates xats documents against JSON Schema definitions.

**Parameters:**
- `document` (required): The xats document to validate
- `schemaVersion` (optional): Specific schema version to validate against
- `strict` (optional): Enable strict validation mode

**Example:**
```json
{
  "name": "xats_validate",
  "arguments": {
    "document": {
      "schemaVersion": "0.3.0",
      "bibliographicEntry": { "title": "My Textbook" },
      "subject": "Mathematics",
      "bodyMatter": { "contents": [] }
    },
    "strict": true
  }
}
```

### 2. xats_create

Creates new xats documents from predefined templates.

**Parameters:**
- `title` (required): Document title
- `template` (optional): Template type (`minimal`, `textbook`, `course`, `assessment`)
- `author` (optional): Author name
- `subject` (optional): Subject area
- `language` (optional): Document language code
- `options` (optional): Template-specific options

**Templates:**
- **minimal**: Basic document with single chapter
- **textbook**: Multi-chapter structure with learning objectives
- **course**: Course structure with pathways
- **assessment**: Assessment-focused with quiz components

**Example:**
```json
{
  "name": "xats_create",
  "arguments": {
    "title": "Introduction to Physics",
    "template": "textbook",
    "author": "Dr. Smith",
    "subject": "Physics",
    "options": {
      "includeFrontMatter": true,
      "includeBackMatter": true
    }
  }
}
```

### 3. xats_analyze

Analyzes document structure, content, and quality.

**Parameters:**
- `document` (required): The xats document to analyze
- `depth` (optional): Analysis depth (`basic`, `detailed`, `comprehensive`)
- `includeIssues` (optional): Include potential issues and suggestions
- `includeStatistics` (optional): Include document statistics

**Analysis Results:**
- Document structure (chapters, sections, content blocks)
- Content statistics (word count, reading time, complexity)
- Quality issues and improvement suggestions
- Assessment and pathway analysis

**Example:**
```json
{
  "name": "xats_analyze",
  "arguments": {
    "document": { /* xats document */ },
    "depth": "comprehensive",
    "includeIssues": true,
    "includeStatistics": true
  }
}
```

### 4. xats_extract

Extracts specific content from xats documents.

**Parameters:**
- `document` (required): The xats document to extract from
- `type` (optional): Content type (`content`, `metadata`, `structure`, `assessments`)
- `path` (optional): JSON path for specific extraction
- `filter` (optional): Content filtering options

**Extraction Types:**
- **content**: All content blocks with text and formatting
- **metadata**: Document metadata and bibliographic information
- **structure**: Hierarchical organization and statistics
- **assessments**: Assessment-related content and pathways

**Example:**
```json
{
  "name": "xats_extract",
  "arguments": {
    "document": { /* xats document */ },
    "type": "assessments",
    "filter": {
      "blockTypes": ["multipleChoice", "shortAnswer"]
    }
  }
}
```

### 5. xats_transform

Transforms documents to different formats or schema versions.

**Parameters:**
- `document` (required): The xats document to transform
- `targetFormat` (optional): Target format (`json`, `markdown`, `html`, `text`)
- `targetVersion` (optional): Target schema version for migration
- `options` (optional): Transformation options

**Supported Formats:**
- **json**: Clean/restructured JSON with optional metadata removal
- **markdown**: Hierarchical markdown with preserved formatting
- **html**: Semantic HTML for web publishing
- **text**: Plain text for analysis or simple viewing

**Example:**
```json
{
  "name": "xats_transform",
  "arguments": {
    "document": { /* xats document */ },
    "targetFormat": "markdown",
    "options": {
      "preserveMetadata": true,
      "stripAssessments": false
    }
  }
}
```

## Configuration

### Server Configuration

```typescript
import { createServer } from '@xats-org/mcp-server';

const server = await createServer({
  name: 'my-xats-server',
  version: '1.0.0',
  description: 'Custom xats MCP server',
  capabilities: {
    tools: true,
    resources: false,
    prompts: false,
  },
  defaultSchemaVersion: '0.3.0',
  validation: {
    strict: true,
    allErrors: true,
  },
});
```

### CLI Configuration

```bash
# Start with custom settings
xats-mcp-server start \
  --name "custom-server" \
  --schema-version "0.3.0" \
  --strict \
  --all-errors
```

## Error Handling

The server provides comprehensive error handling with structured error responses:

```typescript
import { 
  ValidationError, 
  DocumentError, 
  TransformError,
  createErrorResponse 
} from '@xats-org/mcp-server';

// Structured error responses
{
  "success": false,
  "error": "Document validation failed",
  "metadata": {
    "toolName": "xats_validate",
    "errorCode": "VALIDATION_ERROR",
    "severity": "medium",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Development

### Building

```bash
# Build the package
npm run build

# Build in watch mode
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Linting and Formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Integration Examples

### Claude Desktop Integration

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "xats": {
      "command": "npx",
      "args": ["@xats-org/mcp-server"],
      "env": {}
    }
  }
}
```

### Programmatic Usage

```typescript
import { 
  validateTool,
  createTool,
  analyzeTool,
  extractTool,
  transformTool 
} from '@xats-org/mcp-server';

// Validate a document
const validationResult = await validateTool({
  document: myDocument,
  strict: true
}, serverConfig);

// Create a new textbook
const creationResult = await createTool({
  title: "Advanced Mathematics",
  template: "textbook",
  author: "Dr. Johnson"
}, serverConfig);

// Analyze document structure
const analysisResult = await analyzeTool({
  document: myDocument,
  depth: "comprehensive"
}, serverConfig);
```

## Schema Version Support

The server supports multiple xats schema versions:

- **0.1.0**: Initial xats specification
- **0.2.0**: Assessment framework additions
- **0.3.0**: Extended features and pathways (recommended)

Documents are automatically validated against the appropriate schema version, and migration between versions is supported through the transform tool.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run the test suite
5. Submit a pull request

### Development Setup

```bash
git clone https://github.com/xats-org/core.git
cd core/packages/mcp-server
pnpm install
pnpm build
pnpm test
```

## License

MIT - See [LICENSE.md](../../LICENSE.md) for details.

## Related Packages

- [@xats-org/schema](../schema) - JSON Schema definitions
- [@xats-org/validator](../validator) - Document validation
- [@xats-org/types](../types) - TypeScript type definitions
- [@xats-org/utils](../utils) - Shared utilities

## Support

- [Documentation](https://xats.org/docs)
- [GitHub Issues](https://github.com/xats-org/core/issues)
- [Community Discussions](https://github.com/xats-org/core/discussions)