# @xats-org/converter-latex

Advanced bidirectional LaTeX converter for xats with academic publishing workflow support.

## Overview

This package provides high-fidelity conversion between xats documents and LaTeX format, with comprehensive support for:

- **Academic Publishing**: Support for journal templates, document classes, and scholarly workflows
- **Mathematical Content**: Advanced handling of equations, symbols, and mathematical environments
- **Bibliography Management**: Integration with BibTeX, BibLaTeX, and citation styles
- **Cross-References**: Automatic handling of figures, tables, equations, and sections
- **Production Quality**: Features designed for professional publishing workflows
- **Round-trip Fidelity**: High-quality bidirectional conversion with mathematical precision

## Installation

```bash
npm install @xats-org/converter-latex
```

## Quick Start

### Convert xats to LaTeX

```typescript
import { LaTeXConverter } from '@xats-org/converter-latex';

const converter = new LaTeXConverter();
const result = await converter.render(xatsDocument, {
  documentClass: 'article',
  packages: [
    { name: 'amsmath' },
    { name: 'amsfonts' },
    { name: 'graphicx' },
    { name: 'hyperref' },
  ],
  bibliographyStyle: 'plain',
  productionMode: true,
});

// result.content contains LaTeX source
console.log(result.content);
```

### Convert LaTeX to xats

```typescript
const latexContent = `
\\documentclass{article}
\\usepackage{amsmath}
\\begin{document}
\\title{Mathematical Examples}
\\author{John Doe}
\\maketitle

\\section{Introduction}
This document contains mathematical examples.

\\begin{equation}
E = mc^2
\\end{equation}

\\end{document}
`;

const result = await converter.parse(latexContent, {
  mathParsing: {
    preserveLaTeX: true,
    renderer: 'mathjax',
  },
  floats: {
    figures: 'convert',
    tables: 'convert',
    captions: 'extract',
  },
});

console.log(result.document);
```

### Test Mathematical Fidelity

```typescript
const roundTripResult = await converter.testRoundTrip(mathDocument, {
  fidelityThreshold: 0.95, // Higher threshold for math content
  semanticComparison: true,
});

console.log(`Math Fidelity: ${roundTripResult.mathFidelity}`);
console.log(`Overall Score: ${roundTripResult.fidelityScore}`);

if (roundTripResult.issues.some(issue => issue.type === 'math')) {
  console.log('Mathematical conversion issues found');
}
```

## Advanced Features

### Academic Journal Support

```typescript
const result = await converter.render(document, {
  journal: {
    template: 'ieee',
    doublespacing: true,
    linenumbers: true,
  },
  documentClass: 'IEEEtran',
  bibliographyStyle: 'IEEEtran',
  crossReferences: {
    useCleveref: true,
    useHyperref: true,
  },
});
```

### Mathematical Content Handling

```typescript
const result = await converter.parse(latexContent, {
  mathParsing: {
    renderer: 'mathjax',
    preserveLaTeX: true,
    mathML: true,
    customCommands: {
      'mycommand': '\\mathbf{#1}',
      'special': '\\mathcal{S}',
    },
    environments: {
      align: 'preserve',
      equation: 'convert',
      matrix: 'convert',
      cases: 'preserve',
    },
  },
});
```

### Bibliography Integration

```typescript
const result = await converter.render(document, {
  bibliographyStyle: 'biblatex',
  bibliographyBackend: 'biber',
  // Custom bibliography processing
});

const parseResult = await converter.parse(latexContent, {
  bibliography: {
    parseBibFiles: true,
    natbib: true,
    biblatex: true,
    citationStyles: {
      '\\cite': 'standard',
      '\\citep': 'parenthetical',
      '\\citet': 'textual',
    },
  },
});
```

### Document Class and Package Management

```typescript
const result = await converter.render(document, {
  documentClass: 'amsart', // AMS article class
  documentClassOptions: ['11pt', 'letterpaper', 'oneside'],
  packages: [
    { name: 'amsmath', required: true },
    { name: 'amsfonts', required: true },
    { name: 'amssymb', required: true },
    { name: 'theorem', options: ['amsmath'] },
    { name: 'graphicx' },
    { name: 'hyperref', options: ['colorlinks=true'] },
  ],
  customCommands: {
    'R': '\\mathbb{R}',
    'N': '\\mathbb{N}',
    'norm': '\\left\\|#1\\right\\|',
  },
});
```

### Geometry and Typography

```typescript
const result = await converter.render(document, {
  geometry: {
    papersize: 'a4paper',
    margin: {
      top: '1in',
      bottom: '1in',
      left: '1.2in',
      right: '1.2in',
    },
    bindingoffset: '0.2in',
  },
  fonts: {
    main: 'Times New Roman',
    sans: 'Helvetica',
    mono: 'Courier New',
    fontsize: '12pt',
  },
  microtype: true, // Enable micro-typography
});
```

## Production Workflows

### Journal Submission

```typescript
import { createAcademicConverter } from '@xats-org/converter-latex';

const journalConverter = createAcademicConverter('nature');
const result = await journalConverter.render(manuscript, {
  journal: {
    template: 'nature',
    anonymize: true, // Remove author info for blind review
    linenumbers: true,
    doublespacing: true,
  },
  draftMode: false,
  productionMode: true,
});
```

### Mathematical Publications

```typescript
import { createMathConverter } from '@xats-org/converter-latex';

const mathConverter = createMathConverter();
const result = await mathConverter.render(mathPaper, {
  packages: [
    { name: 'amsmath' },
    { name: 'amsthm' },
    { name: 'amsfonts' },
    { name: 'amssymb' },
    { name: 'mathtools' },
  ],
  numbering: {
    theorems: true,
    equations: true,
    maxDepth: 4,
  },
  crossReferences: {
    useCleveref: true,
    linkColors: {
      cite: 'blue',
      link: 'red',
    },
  },
});
```

## API Reference

### LaTeXConverter

Main converter class implementing `BidirectionalRenderer` interface.

#### Methods

- `render(document, options?)` - Convert xats to LaTeX format
- `parse(content, options?)` - Convert LaTeX to xats format
- `testRoundTrip(document, options?)` - Test conversion fidelity
- `validate(content)` - Validate LaTeX document
- `getMetadata(content)` - Extract document metadata

### Configuration Types

Key configuration interfaces:

- `LaTeXConverterOptions` - Rendering configuration
- `LaTeXParseOptions` - Parsing configuration
- `GeometryOptions` - Page layout settings
- `MathParsingOptions` - Mathematical content handling
- `BibliographyParsingOptions` - Citation and bibliography processing

## Fidelity and Quality

### Mathematical Fidelity

The converter provides specialized fidelity testing for mathematical content:

```typescript
const fidelityResult = await converter.testRoundTrip(mathDocument);

console.log({
  overall: fidelityResult.fidelityScore,
  content: fidelityResult.contentFidelity,
  mathematics: fidelityResult.mathFidelity, // LaTeX-specific
  structure: fidelityResult.structureFidelity,
  formatting: fidelityResult.formattingFidelity,
});
```

### Supported LaTeX Features

### ✅ Fully Supported

- Document classes (article, book, report, amsart, etc.)
- Mathematical environments (equation, align, gather, etc.)
- Text formatting and sectioning
- Cross-references and labels
- Bibliography and citations
- Figures and tables
- Lists and enumerations
- Custom commands and environments

### 🚧 Partial Support

- Complex package interactions
- Advanced TikZ graphics
- Custom document classes
- Specialized mathematical packages

### 📋 Planned Features

- Full TikZ support
- Advanced theorem environments
- Beamer presentation support
- LuaTeX and XeTeX specific features

## Dependencies

This package uses several specialized LaTeX processing libraries:

- `latex-parser` - LaTeX parsing and AST generation
- `node-latex` - LaTeX compilation support
- `mathjax-node` - Mathematical expression processing
- `unified` - Text processing pipeline

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

# Type check
pnpm run type-check
```

## License

MIT © xats contributors