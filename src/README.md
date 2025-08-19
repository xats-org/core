# xats HTML Renderer

[![npm version](https://badge.fury.io/js/@xats-org/core.svg)](https://badge.fury.io/js/@xats-org/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A reference implementation HTML renderer for the [Extensible Academic Textbook Schema (xats)](https://xats.org). Converts xats documents into semantic, accessible HTML with full support for v0.3.0 features.

## Quick Start

```bash
# Install the package
npm install @xats-org/core

# Render a xats document to HTML
npx xats-render document.json -o output.html
```

```typescript
// Use in your code
import { XatsHtmlRenderer } from '@xats-org/core/renderer';

const renderer = new XatsHtmlRenderer();
const html = renderer.render(xatsDocument);
```

## Features

### ✅ Complete v0.3.0 Support
- **New Content Blocks**: Case Study, Metacognitive Prompts
- **IndexRun Support**: Automatic index generation with cross-references
- **File Modularity**: Support for multi-file documents (when loaded)

### ✅ Core Content Blocks
- Paragraphs with rich SemanticText
- Headings with proper hierarchy
- Lists (ordered, unordered, nested)
- Blockquotes and code blocks
- Mathematical expressions
- Tables with full accessibility
- Figures with captions and alt text

### ✅ Advanced Features
- **Accessibility**: WCAG 2.1 compliant HTML
- **Bibliography**: CSL-JSON integration
- **Index Generation**: From IndexRun semantic text
- **Responsive Design**: Mobile-first CSS
- **Print Support**: Optimized for printing
- **RTL Support**: Right-to-left languages

### ✅ Developer Experience
- **TypeScript**: Full type safety
- **CLI Tool**: Command-line rendering
- **Customizable**: Override CSS and behavior
- **Extensible**: Add custom block renderers

## Examples

### Basic Usage

```typescript
import { XatsHtmlRenderer, XatsDocument } from '@xats-org/core/renderer';
import { readFileSync } from 'fs';

// Load your xats document
const xatsJson = readFileSync('textbook.json', 'utf-8');
const document: XatsDocument = JSON.parse(xatsJson);

// Create renderer
const renderer = new XatsHtmlRenderer({
  includeCss: true,        // Inline CSS for standalone files
  accessibility: true,     // Enable accessibility features
  direction: 'ltr'        // Text direction
});

// Generate HTML
const html = renderer.render(document);
console.log(html);
```

### CLI Usage

```bash
# Basic rendering
xats-render textbook.json

# Custom output and options
xats-render textbook.json \
  --output rendered-textbook.html \
  --direction rtl \
  --base-url https://cdn.example.com/

# See all options
xats-render --help
```

### v0.3.0 Features Demo

The renderer fully supports the new v0.3.0 features:

**Case Study Blocks:**
```json
{
  "blockType": "https://xats.org/core/blocks/caseStudy",
  "content": {
    "title": {"runs": [{"type": "text", "text": "Business Strategy Case"}]},
    "scenario": {"runs": [{"type": "text", "text": "A startup faces..."}]},
    "stakeholders": [
      {
        "name": "CEO",
        "role": "Decision Maker",
        "motivations": ["Growth", "Investor satisfaction"]
      }
    ],
    "questions": [
      {
        "id": "q1",
        "question": {"runs": [{"type": "text", "text": "What should the CEO do?"}]},
        "type": "decision",
        "cognitiveLevel": "evaluate"
      }
    ]
  }
}
```

**Metacognitive Prompts:**
```json
{
  "blockType": "https://xats.org/core/blocks/metacognitivePrompt",
  "content": {
    "promptType": "self-assessment",
    "prompt": {"runs": [{"type": "text", "text": "Reflect on your learning..."}]},
    "guidingQuestions": [
      {
        "question": {"runs": [{"type": "text", "text": "What did you find challenging?"}]},
        "purpose": "Identify learning gaps"
      }
    ],
    "scaffolding": {
      "sentence_starters": [
        "I found it difficult when...",
        "I learned that..."
      ]
    }
  }
}
```

**IndexRun Support:**
```json
{
  "runs": [
    {"type": "text", "text": "This concept of "},
    {
      "type": "index",
      "text": "metacognition",
      "indexTerm": "metacognition",
      "subTerm": "learning strategies",
      "crossReferences": ["self-regulation", "reflection"],
      "indexId": "idx-metacognition"
    },
    {"type": "text", "text": " is fundamental to education."}
  ]
}
```

## Live Examples

See the renderer in action with our generated examples:

- **[Browse All Examples](../../examples/rendered/index.html)** - Interactive gallery
- **[v0.3.0 Features Demo](../../examples/rendered/v0.3.0-features-example.html)** - Case studies and metacognitive prompts
- **[Accessibility Sample](../../examples/rendered/accessibility-sample-v0.2.0.html)** - WCAG compliance demo
- **[Adaptive Pathways](../../examples/rendered/adaptive-pathway-example.html)** - Conditional learning paths

Each example includes multiple variants (minimal, RTL, accessibility-focused) to demonstrate different configuration options.

## Configuration Options

```typescript
interface RendererOptions {
  // Include CSS styles inline in HTML (default: true)
  includeCss?: boolean;
  
  // Base URL for resolving resource links
  baseUrl?: string;
  
  // Enable accessibility features (default: true)
  accessibility?: boolean;
  
  // Text direction for the document (default: 'ltr')
  direction?: 'ltr' | 'rtl' | 'auto';
  
  // Include skip navigation links (default: true)
  includeSkipNavigation?: boolean;
  
  // Custom CSS class names for styling
  cssClasses?: Partial<CssClasses>;
}
```

### Custom Styling

```typescript
const renderer = new XatsHtmlRenderer({
  includeCss: false,  // Use external CSS
  cssClasses: {
    document: 'my-textbook',
    caseStudy: 'case-study-card',
    metacognitivePrompt: 'reflection-box',
    paragraph: 'text-content'
  }
});
```

## Generated HTML Structure

### Document Structure
```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <title>Document Title</title>
  <style>/* Inline CSS (if enabled) */</style>
</head>
<body>
  <nav class="xats-skip-navigation"><!-- Skip links --></nav>
  <header class="xats-header"><!-- Document metadata --></header>
  <main class="xats-main">
    <div class="body-matter"><!-- Content --></div>
  </main>
  <footer class="xats-footer">
    <section class="bibliography"><!-- Generated bibliography --></section>
    <section class="index"><!-- Generated index --></section>
  </footer>
</body>
</html>
```

### Content Block Examples

**Case Study Block:**
```html
<article class="xats-case-study">
  <header><h4>Case Title</h4></header>
  <section class="case-scenario">
    <h5>Scenario</h5>
    <div>Scenario description...</div>
  </section>
  <section class="case-stakeholders">
    <h5>Key Stakeholders</h5>
    <div class="stakeholder-list">
      <div class="stakeholder">
        <h6>Name <span class="role">(Role)</span></h6>
        <p>Description...</p>
        <div class="motivations">Motivations: ...</div>
      </div>
    </div>
  </section>
  <section class="case-questions">
    <h5>Discussion Questions</h5>
    <ol>
      <li data-type="analysis" data-cognitive-level="analyze">
        Question text...
      </li>
    </ol>
  </section>
</article>
```

**Metacognitive Prompt:**
```html
<aside class="xats-metacognitive-prompt" data-prompt-type="self-assessment">
  <header><h4>Self Assessment Prompt</h4></header>
  <div class="main-prompt">Main prompt text...</div>
  <div class="guiding-questions">
    <h5>Consider these questions:</h5>
    <ul>
      <li data-purpose="identify-gaps">Guiding question...</li>
    </ul>
  </div>
  <div class="sentence-starters">
    <h5>Sentence starters:</h5>
    <ul>
      <li>"I found it challenging when..."</li>
    </ul>
  </div>
</aside>
```

## Accessibility Features

### WCAG 2.1 Compliance
- **Skip Navigation**: Keyboard-accessible content jumping
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Screen reader support for complex content
- **Language Support**: Language attributes and text direction
- **Alt Text**: Required for images, math, and complex content

### Content-Specific Accessibility
- **Tables**: Full header association and descriptions
- **Math**: Alternative text and speech-friendly markup
- **Interactive Elements**: Proper labeling and keyboard support
- **Complex Graphics**: Long descriptions and structured alternatives

### Testing
All generated HTML is tested with:
- **Screen Readers**: NVDA, JAWS, VoiceOver
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG AA compliance
- **Automated Testing**: axe-core integration

## Performance

### Optimization Features
- **Efficient Rendering**: Single-pass document processing
- **Memory Management**: Minimal memory footprint
- **CSS Optimization**: Minified inline styles
- **Resource Handling**: Lazy loading support

### Benchmarks
- **Small Document** (10 pages): ~50ms render time
- **Medium Document** (100 pages): ~200ms render time  
- **Large Document** (1000 pages): ~800ms render time
- **Memory Usage**: ~5MB for typical textbook

## Browser Support

- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅
- **Mobile Safari**: iOS 14+ ✅
- **Chrome Mobile**: Android 90+ ✅

## Development & Testing

### Running Tests
```bash
npm test                    # Run all tests
npm run test:accessibility  # Accessibility tests
npm run test:integration    # Integration tests
```

### Building Examples
```bash
npm run build              # Build TypeScript
node dist/generate-examples.js  # Generate HTML examples
```

### Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Add** tests for your changes
4. **Ensure** accessibility compliance
5. **Submit** a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

## Related Projects

- **[xats-org/core](https://github.com/xats-org/core)** - Main schema and validation
- **[xats-org/website](https://github.com/xats-org/website)** - Project website
- **[xats-org/examples](https://github.com/xats-org/examples)** - Community examples

## License

MIT License. See [LICENSE.md](../LICENSE.md) for details.

## Support

- **Documentation**: [docs/reference/renderer.md](../docs/reference/renderer.md)
- **Examples**: [examples/rendered/](../../examples/rendered/)
- **Issues**: [GitHub Issues](https://github.com/xats-org/core/issues)
- **Discussions**: [GitHub Discussions](https://github.com/xats-org/core/discussions)

---

Made with ❤️ by the [xats.org](https://xats.org) community