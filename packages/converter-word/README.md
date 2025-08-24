# @xats-org/converter-word

High-fidelity bidirectional conversion between xats documents and Microsoft Word (.docx) format.

## Features

- **Bidirectional Conversion**: Convert between xats and Word formats while preserving semantic meaning
- **Educational Content Support**: Specialized handling for educational elements like learning objectives, exercises, and assessments
- **Collaboration Features**: Preserve and convert track changes, comments, and annotations
- **Style Mapping**: Intelligent mapping between Word styles and xats block types
- **Production Ready**: Built for publishing workflows with quality assurance and fidelity testing
- **Round-trip Testing**: Comprehensive fidelity testing to ensure conversion accuracy

## Installation

```bash
npm install @xats-org/converter-word
```

## Quick Start

### Convert xats to Word

```typescript
import { WordConverter } from '@xats-org/converter-word';

const converter = new WordConverter();

// Convert xats document to Word
const result = await converter.render(xatsDocument, {
  author: 'Dr. Smith',
  documentTitle: 'Introduction to Biology',
  includeTableOfContents: true,
  theme: 'educational'
});

// Save the Word document
fs.writeFileSync('output.docx', result.content);
```

### Convert Word to xats

```typescript
// Read Word document
const docxBuffer = fs.readFileSync('input.docx');

// Convert to xats
const result = await converter.parse(docxBuffer, {
  preserveMetadata: true,
  trackChanges: {
    preserve: true,
    convertToAnnotations: true
  },
  comments: {
    preserve: true,
    convertToAnnotations: true
  }
});

const xatsDocument = result.document;
```

## Advanced Usage

### Style Mapping

Customize how Word styles map to xats block types:

```typescript
const converter = new WordConverter({
  defaultStyleMappings: {
    paragraphs: {
      'Learning Goal': 'https://xats.org/vocabularies/blocks/learningObjective',
      'Key Concept': 'https://xats.org/vocabularies/blocks/keyTerm',
      'Case Study': 'https://xats.org/vocabularies/blocks/caseStudy'
    },
    characters: {
      'Important Term': 'keyTerm',
      'Code Snippet': 'code'
    }
  }
});
```

### Track Changes and Comments

Preserve collaborative features when converting:

```typescript
// Convert Word with track changes to xats
const result = await converter.parse(docxContent, {
  trackChanges: {
    preserve: true,
    convertToAnnotations: true,
    includeRevisionHistory: true,
    authorMappings: {
      'John Smith': 'editor-john',
      'Mary Johnson': 'reviewer-mary'
    }
  },
  comments: {
    preserve: true,
    convertToAnnotations: true,
    includeThreading: true
  }
});

// Access converted annotations
const annotations = result.annotations;
console.log(`Found ${annotations?.length || 0} annotations`);
```

### Round-trip Testing

Test conversion fidelity:

```typescript
// Test how well content survives round-trip conversion
const fidelityResult = await converter.testRoundTrip(xatsDocument, {
  fidelityThreshold: 0.85,
  semanticComparison: true
});

console.log({
  success: fidelityResult.success,
  overall: fidelityResult.fidelityScore,
  content: fidelityResult.contentFidelity,
  structure: fidelityResult.structureFidelity
});

// Review any issues
fidelityResult.issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.description}`);
  if (issue.recommendation) {
    console.log(`Recommendation: ${issue.recommendation}`);
  }
});
```

## Educational Content

The converter has specialized support for educational content:

```typescript
// These Word styles are automatically mapped to educational block types:
const educationalMappings = {
  'Learning Objective': 'learningObjective',
  'Key Term': 'keyTerm', 
  'Definition': 'definition',
  'Example': 'example',
  'Exercise': 'exercise',
  'Case Study': 'caseStudy',
  'Note': 'note',
  'Warning': 'warning',
  'Tip': 'tip',
  'Summary': 'summary'
};
```

When converting from xats to Word, these block types are rendered with appropriate styling and prefixes.

## Production Workflows

### Publisher Integration

```typescript
// Convert manuscript for multi-format publishing
async function processManuscript(docxPath: string) {
  const docxContent = fs.readFileSync(docxPath);
  
  // Convert to xats for processing
  const xatsResult = await converter.parse(docxContent, {
    preserveMetadata: true,
    productionMode: true
  });
  
  // Validate content
  const validation = await validateDocument(xatsResult.document);
  if (!validation.valid) {
    throw new Error('Manuscript validation failed');
  }
  
  // Generate publication formats
  const wordOutput = await converter.render(xatsResult.document, {
    productionMode: true,
    includeTableOfContents: true,
    includeBibliography: true,
    theme: 'professional'
  });
  
  return {
    xatsDocument: xatsResult.document,
    wordDocument: wordOutput.content,
    metadata: wordOutput.metadata
  };
}
```

### Quality Assurance

```typescript
// Automated quality checks
const result = await converter.render(document, options);

// Check for conversion errors
if (result.errors && result.errors.length > 0) {
  result.errors.forEach(error => {
    if (!error.recoverable) {
      throw new Error(`Fatal conversion error: ${error.message}`);
    }
    console.warn(`Warning: ${error.message}`);
  });
}

// Review style mapping report
if (result.styleReport) {
  console.log('Mapped styles:', result.styleReport.mappedStyles);
  console.log('Unmapped styles:', result.styleReport.unmappedStyles);
  console.log('New styles created:', result.styleReport.newStyles);
}
```

## API Reference

### WordConverter

#### Methods

- `render(document: XatsDocument, options?: WordRenderOptions): Promise<WordRenderResult>`
- `parse(content: string | Buffer, options?: WordParseOptions): Promise<WordParseResult>`
- `testRoundTrip(document: XatsDocument, options?: RoundTripOptions): Promise<RoundTripResult>`
- `validate(content: string | Buffer): Promise<FormatValidationResult>`
- `getMetadata(content: string | Buffer): Promise<WordMetadata>`

#### Properties

- `format: 'docx'` - The format identifier
- `wcagLevel: 'AA'` - WCAG compliance level

### Options

#### WordRenderOptions

```typescript
interface WordRenderOptions {
  author?: string;
  documentTitle?: string;
  productionMode?: boolean;
  template?: string;
  styleMappings?: WordStyleMappings;
  includeTableOfContents?: boolean;
  includeBibliography?: boolean;
  theme?: 'default' | 'educational' | 'academic' | 'professional';
  accessibilityMode?: boolean;
  trackChanges?: TrackChangesOptions;
  comments?: CommentsOptions;
}
```

#### WordParseOptions

```typescript
interface WordParseOptions {
  preserveMetadata?: boolean;
  productionMode?: boolean;
  styleMappings?: WordStyleMappings;
  trackChanges?: {
    preserve: boolean;
    convertToAnnotations: boolean;
    includeRevisionHistory?: boolean;
    authorMappings?: Record<string, string>;
  };
  comments?: {
    preserve: boolean;
    convertToAnnotations: boolean;
    includeThreading?: boolean;
  };
}
```

## Error Handling

The converter provides detailed error reporting:

```typescript
try {
  const result = await converter.render(document, options);
  
  // Check for non-fatal errors
  if (result.errors) {
    result.errors.forEach(error => {
      console.warn(`${error.code}: ${error.message}`);
      if (error.suggestion) {
        console.warn(`Suggestion: ${error.suggestion}`);
      }
    });
  }
  
} catch (error) {
  console.error('Conversion failed:', error.message);
}
```

## Best Practices

1. **Validate First**: Always validate documents before conversion
2. **Test Fidelity**: Use round-trip testing for important content
3. **Map Styles**: Define custom style mappings for your content
4. **Handle Errors**: Implement proper error handling and recovery
5. **Preserve Metadata**: Keep document metadata when possible

## Limitations

- Mathematical content may not convert perfectly (renders as text with notation)
- Complex graphics and diagrams have limited support
- Some advanced Word features may not have xats equivalents
- Track changes conversion is best-effort and may not preserve all details

## Contributing

See the main repository's [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT - see [LICENSE.md](../../LICENSE.md) for details.