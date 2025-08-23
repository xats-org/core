# @xats-org/converter-word

Advanced bidirectional Word converter for xats with production workflow support.

## Overview

This package provides high-fidelity conversion between xats documents and Microsoft Word format, with comprehensive support for:

- **Educational Content**: Proper handling of learning objectives, assessments, and pedagogical structures
- **Track Changes**: Preserve and convert Word's track changes to xats annotations
- **Comments**: Handle document comments and collaborative features
- **Complex Formatting**: Maintain sophisticated typography and layout
- **Round-trip Fidelity**: High-quality bidirectional conversion with fidelity testing
- **Production Workflows**: Features designed for publisher and institutional use

## Installation

```bash
npm install @xats-org/converter-word
```

## Quick Start

### Convert xats to Word

```typescript
import { WordConverter } from '@xats-org/converter-word';

const converter = new WordConverter();
const result = await converter.render(xatsDocument, {
  author: 'John Doe',
  documentTitle: 'My Educational Content',
  typography: {
    defaultFont: 'Calibri',
    fontSize: 24, // 12pt
  },
  productionMode: true,
});

// result.content contains base64-encoded DOCX file
const buffer = Buffer.from(result.content, 'base64');
await fs.writeFile('output.docx', buffer);
```

### Convert Word to xats

```typescript
const docxBuffer = await fs.readFile('input.docx');
const base64Content = docxBuffer.toString('base64');

const result = await converter.parse(base64Content, {
  trackChanges: {
    preserve: true,
    convertToAnnotations: true,
  },
  comments: {
    preserve: true,
    convertToAnnotations: true,
  },
  styleMappings: {
    paragraphs: {
      'Heading 1': 'https://xats.org/vocabularies/blocks/heading',
      'Quote': 'https://xats.org/vocabularies/blocks/blockquote',
    },
  },
});

// result.document contains the xats document
console.log(result.document);
```

### Test Round-trip Fidelity

```typescript
const roundTripResult = await converter.testRoundTrip(xatsDocument, {
  fidelityThreshold: 0.85,
  semanticComparison: true,
});

console.log(`Fidelity Score: ${roundTripResult.fidelityScore}`);
console.log(`Success: ${roundTripResult.success}`);

if (roundTripResult.issues.length > 0) {
  console.log('Fidelity Issues:');
  roundTripResult.issues.forEach(issue => {
    console.log(`- ${issue.type}: ${issue.description}`);
  });
}
```

## Advanced Features

### Production Mode

Enable production mode for enhanced features:

```typescript
const result = await converter.render(document, {
  productionMode: true,
  trackChanges: {
    preserve: true,
    includeRevisionHistory: true,
  },
  comments: {
    preserve: true,
    includeThreading: true,
  },
  pageSetup: {
    size: { width: 12240, height: 15840 }, // US Letter
    orientation: 'portrait',
    margins: {
      top: 1440,    // 1 inch
      right: 1440,
      bottom: 1440,
      left: 1440,
    },
    headers: {
      different_first_page: true,
      different_odd_even: false,
    },
  },
});
```

### Style Mapping

Customize how Word styles map to xats content:

```typescript
const result = await converter.parse(docxContent, {
  styleMappings: {
    paragraphs: {
      'Normal': 'https://xats.org/vocabularies/blocks/paragraph',
      'Heading 1': 'https://xats.org/vocabularies/blocks/heading',
      'Heading 2': 'https://xats.org/vocabularies/blocks/heading',
      'Quote': 'https://xats.org/vocabularies/blocks/blockquote',
      'Code': 'https://xats.org/vocabularies/blocks/codeBlock',
    },
    characters: {
      'Emphasis': 'emphasis',
      'Strong': 'strong',
    },
    customStyles: {
      'Learning Objective': {
        blockType: 'https://xats.org/vocabularies/blocks/learningObjective',
        semantic: 'educational',
      },
    },
  },
});
```

### Image Handling

Configure how images are processed:

```typescript
const result = await converter.render(document, {
  imageHandling: {
    extractionMode: 'external', // 'embed' | 'external' | 'reference'
    outputDirectory: './assets/images',
    formats: ['png', 'jpeg'],
    maxDimensions: { width: 1200, height: 800 },
    compression: { quality: 85, format: 'jpeg' },
    altTextHandling: 'preserve',
  },
});
```

### Math Handling

Control mathematical content conversion:

```typescript
const result = await converter.parse(docxContent, {
  mathHandling: {
    format: 'mathml', // 'mathml' | 'latex' | 'unicode' | 'image'
    preserveEquationData: true,
    fallbackFormat: 'text',
  },
});
```

## API Reference

### WordConverter

Main converter class implementing `BidirectionalRenderer` interface.

#### Methods

- `render(document, options?)` - Convert xats to Word format
- `parse(content, options?)` - Convert Word to xats format
- `testRoundTrip(document, options?)` - Test conversion fidelity
- `validate(content)` - Validate Word document format
- `getMetadata(content)` - Extract document metadata

### Types

Key TypeScript interfaces:

- `WordConverterOptions` - Rendering configuration
- `WordParseOptions` - Parsing configuration
- `WordMetadata` - Document metadata
- `WordRoundTripResult` - Fidelity test results
- `DocumentProperties` - Word document properties
- `TrackChangesOptions` - Track changes handling
- `CommentOptions` - Comment handling

## Fidelity and Quality

### Round-trip Testing

The converter includes comprehensive fidelity testing:

```typescript
const fidelityResult = await converter.testRoundTrip(document);

// Detailed fidelity metrics
console.log({
  overall: fidelityResult.fidelityScore,
  content: fidelityResult.contentFidelity,
  formatting: fidelityResult.formattingFidelity,
  structure: fidelityResult.structureFidelity,
});
```

### Fidelity Scores

- **Content Fidelity**: Text accuracy, semantic preservation
- **Formatting Fidelity**: Typography, styling, layout
- **Structure Fidelity**: Document hierarchy, organization

## Supported Features

### ✅ Fully Supported

- Paragraphs and headings
- Text formatting (bold, italic, underline, etc.)
- Lists (ordered and unordered)
- Blockquotes with attribution
- Code blocks with syntax highlighting hints
- Mathematical expressions (basic)
- Tables (basic structure)
- Images and figures with captions
- Document metadata

### 🚧 Partial Support

- Complex table formatting
- Advanced mathematical expressions
- Embedded objects
- Custom Word styles
- Form fields

### 📋 Planned Features

- Full track changes integration
- Comment threading
- Advanced table features
- Custom template support
- Accessibility enhancements

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Install dependencies
pnpm install

# Build the package
pnpm run build

# Run tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage

# Type check
pnpm run type-check
```

## License

MIT © xats contributors