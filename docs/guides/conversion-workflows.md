# Production & Scholarly Workflow Integration

This guide covers the conversion tools and workflows for integrating xats with established academic and publishing ecosystems, enabling seamless adoption by publishers and educational institutions.

## Overview

The xats conversion ecosystem provides bidirectional, high-fidelity conversion between xats and various formats used in academic and educational publishing. These tools are designed for production workflows where maintaining content integrity and semantic meaning is critical.

## Supported Formats

### Phase 1: Core Converters (v0.5.0)

#### Microsoft Word (`@xats-org/converter-word`)

High-fidelity bidirectional conversion with support for:

- **Educational Content**: Learning objectives, assessments, pedagogical structures
- **Track Changes**: Preserve and convert Word's collaborative features to xats annotations
- **Comments**: Handle document comments and threading
- **Complex Formatting**: Maintain sophisticated typography and layout
- **Production Features**: Template support, metadata preservation, quality assurance

**Installation:**
```bash
npm install @xats-org/converter-word
```

**Basic Usage:**
```typescript
import { WordConverter } from '@xats-org/converter-word';

const converter = new WordConverter();

// Convert xats to Word
const wordResult = await converter.render(xatsDocument, {
  author: 'Dr. Smith',
  documentTitle: 'Introduction to Biology',
  productionMode: true,
  trackChanges: { preserve: true },
  comments: { preserve: true },
});

// Convert Word to xats
const xatsResult = await converter.parse(base64DocxContent, {
  trackChanges: { convertToAnnotations: true },
  styleMappings: {
    paragraphs: {
      'Heading 1': 'https://xats.org/vocabularies/blocks/heading',
      'Learning Objective': 'https://xats.org/vocabularies/blocks/learningObjective',
    },
  },
});
```

#### LaTeX (`@xats-org/converter-latex`)

Academic publishing-grade conversion with support for:

- **Mathematical Content**: Advanced equations, symbols, environments
- **Academic Publishing**: Journal templates, document classes, bibliography
- **Cross-References**: Automatic handling of figures, tables, equations
- **Production Quality**: Professional typesetting and formatting

**Installation:**
```bash
npm install @xats-org/converter-latex
```

**Basic Usage:**
```typescript
import { LaTeXConverter } from '@xats-org/converter-latex';

const converter = new LaTeXConverter();

// Convert xats to LaTeX
const latexResult = await converter.render(xatsDocument, {
  documentClass: 'amsart',
  packages: [
    { name: 'amsmath' },
    { name: 'amsfonts' },
    { name: 'graphicx' },
  ],
  bibliographyStyle: 'plain',
  mathDelimiters: {
    inline: { open: '$', close: '$' },
    display: { open: '\\[', close: '\\]' },
  },
});

// Convert LaTeX to xats
const xatsResult = await converter.parse(latexContent, {
  mathParsing: {
    preserveLaTeX: true,
    renderer: 'mathjax',
  },
  bibliography: {
    parseBibFiles: true,
    natbib: true,
  },
});
```

### Phase 2: Extended Converters (Planned)

#### InDesign (IDML) Converter
- Bidirectional conversion with Adobe InDesign
- Layout hint preservation
- Style mapping and formatting

#### EPUB Converter  
- Maintain reading order and accessibility
- Handle interactive elements
- Cross-platform compatibility

## Conversion Architecture

### Bidirectional Renderer Interface

All converters implement a common `BidirectionalRenderer` interface:

```typescript
interface BidirectionalRenderer<TOptions extends RendererOptions = RendererOptions> {
  readonly format: RenderFormat;
  readonly wcagLevel: 'A' | 'AA' | 'AAA' | null;

  render(document: XatsDocument, options?: TOptions): Promise<RenderResult>;
  parse(content: string, options?: ParseOptions): Promise<ParseResult>;
  testRoundTrip(document: XatsDocument, options?: RoundTripOptions): Promise<RoundTripResult>;
  validate(content: string): Promise<FormatValidationResult>;
  getMetadata?(content: string): Promise<FormatMetadata>;
}
```

### Quality Assurance

#### Round-Trip Fidelity Testing

All converters include comprehensive fidelity testing:

```typescript
const fidelityResult = await converter.testRoundTrip(document, {
  fidelityThreshold: 0.85, // Minimum acceptable fidelity
  semanticComparison: true, // Compare meaning, not just structure
});

console.log({
  success: fidelityResult.success,
  overall: fidelityResult.fidelityScore,
  content: fidelityResult.contentFidelity,
  formatting: fidelityResult.formattingFidelity,
  structure: fidelityResult.structureFidelity,
});

// Handle fidelity issues
if (fidelityResult.issues.length > 0) {
  fidelityResult.issues.forEach(issue => {
    console.log(`${issue.severity}: ${issue.description}`);
    if (issue.recommendation) {
      console.log(`Recommendation: ${issue.recommendation}`);
    }
  });
}
```

#### Format Validation

Validate documents before and after conversion:

```typescript
// Validate source format
const sourceValidation = await converter.validate(sourceContent);
if (!sourceValidation.valid) {
  console.error('Source document has validation errors:', sourceValidation.errors);
}

// Validate conversion result
const resultValidation = await xatsValidator.validate(result.document);
if (!resultValidation.valid) {
  console.error('Converted document has validation errors:', resultValidation.errors);
}
```

## Production Workflows

### Publisher Integration

#### Manuscript Processing Pipeline

```typescript
// 1. Receive manuscript in various formats
const manuscript = await receiveManuscript(); // Word, LaTeX, etc.

// 2. Convert to xats for processing
const converter = getConverterForFormat(manuscript.format);
const xatsResult = await converter.parse(manuscript.content, {
  preserveMetadata: true,
  productionMode: true,
});

// 3. Validate and enhance content
const validation = await validateDocument(xatsResult.document);
if (!validation.valid) {
  throw new Error('Manuscript validation failed');
}

// 4. Apply editorial enhancements
const enhancedDocument = await applyEditorialEnhancements(xatsResult.document);

// 5. Generate outputs for different channels
const outputs = await generateOutputs(enhancedDocument, {
  formats: ['pdf', 'epub', 'html', 'xml'],
  quality: 'production',
});
```

#### Multi-Format Publishing

```typescript
async function publishToMultipleFormats(xatsDocument: XatsDocument) {
  const converters = {
    word: new WordConverter(),
    latex: new LaTeXConverter(),
    // Add other converters as available
  };

  const outputs: Record<string, RenderResult> = {};

  for (const [format, converter] of Object.entries(converters)) {
    try {
      outputs[format] = await converter.render(xatsDocument, {
        productionMode: true,
        includeTableOfContents: true,
        includeBibliography: true,
      });
    } catch (error) {
      console.error(`Failed to convert to ${format}:`, error);
    }
  }

  return outputs;
}
```

### Educational Institution Workflows

#### Course Material Conversion

```typescript
async function convertCourseContent(
  sourcePath: string,
  targetFormats: string[]
): Promise<ConversionResult[]> {
  
  // 1. Detect source format and load content
  const sourceFormat = detectFormat(sourcePath);
  const sourceContent = await loadContent(sourcePath);
  
  // 2. Convert to xats
  const converter = getConverter(sourceFormat);
  const xatsResult = await converter.parse(sourceContent, {
    preserveMetadata: true,
    trackChanges: { convertToAnnotations: true },
    comments: { convertToAnnotations: true },
  });
  
  // 3. Validate educational content structure
  const educationalValidation = await validateEducationalContent(xatsResult.document);
  
  // 4. Generate target formats
  const results: ConversionResult[] = [];
  
  for (const targetFormat of targetFormats) {
    const targetConverter = getConverter(targetFormat);
    const result = await targetConverter.render(xatsResult.document, {
      includeTableOfContents: true,
      accessibilityMode: true,
      theme: 'educational',
    });
    
    results.push({
      format: targetFormat,
      content: result.content,
      metadata: result.metadata,
      fidelityScore: await testFidelity(xatsResult.document, result),
    });
  }
  
  return results;
}
```

## Advanced Features

### Style Mapping and Preservation

Converters support sophisticated style mapping to preserve semantic meaning:

```typescript
// Word converter style mapping
const wordOptions = {
  styleMappings: {
    paragraphs: {
      'Normal': 'https://xats.org/vocabularies/blocks/paragraph',
      'Heading 1': 'https://xats.org/vocabularies/blocks/heading',
      'Learning Objective': 'https://xats.org/vocabularies/blocks/learningObjective',
      'Case Study': 'https://xats.org/vocabularies/blocks/caseStudy',
      'Definition': 'https://xats.org/vocabularies/blocks/definition',
    },
    characters: {
      'Emphasis': 'emphasis',
      'Strong': 'strong',
      'Key Term': 'keyTerm',
    },
  },
};

// LaTeX converter package management
const latexOptions = {
  packages: [
    { name: 'amsmath', required: true },
    { name: 'theorem', options: ['amsmath'] },
    { name: 'educational', options: ['xats'] }, // Custom package
  ],
  customCommands: {
    'learningobjective': '\\textbf{Learning Objective:} #1',
    'keyterm': '\\textit{#1}',
    'casestudy': '\\begin{tcolorbox}[title=Case Study]#1\\end{tcolorbox}',
  },
};
```

### Annotation and Collaboration Features

#### Track Changes Conversion

```typescript
// Convert Word track changes to xats annotations
const parseResult = await wordConverter.parse(docxContent, {
  trackChanges: {
    preserve: true,
    convertToAnnotations: true,
    includeRevisionHistory: true,
    authorMappings: {
      'John Smith': 'editor-john',
      'Mary Johnson': 'reviewer-mary',
    },
  },
});

// Access converted annotations
const annotations = parseResult.document.extensions?.annotations;
annotations?.forEach(annotation => {
  console.log(`${annotation.type}: ${annotation.content} by ${annotation.author}`);
});
```

#### Comment Processing

```typescript
// Handle document comments
const parseResult = await converter.parse(content, {
  comments: {
    preserve: true,
    convertToAnnotations: true,
    includeThreading: true,
  },
});

// Process comment threads
const commentThreads = extractCommentThreads(parseResult.document);
commentThreads.forEach(thread => {
  console.log(`Thread: ${thread.id}`);
  thread.comments.forEach(comment => {
    console.log(`  ${comment.author}: ${comment.content}`);
  });
});
```

### Mathematical Content Handling

LaTeX converter provides specialized mathematical content processing:

```typescript
const mathDocument = await latexConverter.parse(latexContent, {
  mathParsing: {
    renderer: 'mathjax',
    preserveLaTeX: true,
    mathML: true,
    customCommands: {
      'myoperator': '\\mathop{\\text{myop}}',
      'norm': '\\left\\|#1\\right\\|',
    },
    environments: {
      align: 'preserve',
      equation: 'convert',
      matrix: 'convert',
      cases: 'preserve',
    },
  },
});

// Test mathematical fidelity
const mathFidelity = await latexConverter.testRoundTrip(mathDocument, {
  fidelityThreshold: 0.95, // High threshold for mathematical content
});

console.log(`Mathematical fidelity: ${mathFidelity.mathFidelity}`);
```

## Error Handling and Diagnostics

### Conversion Error Management

```typescript
try {
  const result = await converter.render(document, options);
  
  if (result.errors && result.errors.length > 0) {
    // Handle non-fatal errors
    result.errors.forEach(error => {
      if (error.recoverable) {
        console.warn(`Recoverable error: ${error.message}`);
      } else {
        throw new Error(`Fatal conversion error: ${error.message}`);
      }
    });
  }
  
  return result;
} catch (error) {
  // Handle fatal conversion failures
  console.error('Conversion failed:', error);
  return await generateFallbackOutput(document);
}
```

### Diagnostic Information

```typescript
// Get detailed conversion metadata
const metadata = await converter.getMetadata(content);
console.log({
  format: metadata.format,
  wordCount: metadata.wordCount,
  complexity: metadata.mathComplexity, // For LaTeX
  features: metadata.features,
});

// Performance monitoring
const performance = {
  renderTime: result.metadata?.renderTime,
  fileSize: {
    input: content.length,
    output: result.content.length,
    ratio: result.content.length / content.length,
  },
};
```

## Best Practices

### Production Deployment

1. **Validation First**: Always validate source documents before conversion
2. **Fidelity Testing**: Implement round-trip testing in your workflow
3. **Error Handling**: Prepare fallback strategies for conversion failures
4. **Performance Monitoring**: Track conversion times and resource usage
5. **Quality Assurance**: Implement automated quality checks

### Content Optimization

1. **Source Quality**: Ensure source documents follow best practices
2. **Style Consistency**: Use consistent styling in source documents
3. **Semantic Markup**: Leverage semantic elements in source formats
4. **Metadata Completeness**: Include comprehensive document metadata
5. **Asset Management**: Organize images and other assets properly

### Accessibility Compliance

1. **Alt Text**: Ensure all images have appropriate alternative text
2. **Heading Structure**: Maintain proper heading hierarchy
3. **Color Independence**: Don't rely solely on color for meaning
4. **Screen Reader**: Test output with assistive technologies
5. **Standards Compliance**: Follow WCAG guidelines where applicable

## Migration Guide

For organizations migrating to xats-based workflows:

1. **Assessment**: Audit existing content and identify conversion needs
2. **Pilot Testing**: Start with small-scale conversions to test workflows
3. **Quality Benchmarks**: Establish acceptable fidelity thresholds
4. **Training**: Train content creators on xats principles
5. **Gradual Rollout**: Implement xats workflows incrementally

## Support and Resources

- **Documentation**: Comprehensive API documentation for each converter
- **Examples**: Sample code and workflows in the `/examples` directory
- **Issue Tracking**: Report bugs and feature requests on GitHub
- **Community**: Join discussions about conversion workflows and best practices

## Future Roadmap

### Phase 2 Converters (Planned)
- InDesign (IDML) bidirectional converter
- EPUB round-trip support with accessibility features
- PowerPoint/Google Slides for presentation content

### Phase 3 Advanced Features (Planned)
- Automated ancillary generation (study guides, slides, test banks)
- Formal peer review and annotation layer
- Collaborative project management blocks
- Advanced workflow automation

This conversion ecosystem enables seamless integration of xats into existing educational and publishing workflows while maintaining the highest standards for content fidelity and semantic preservation.