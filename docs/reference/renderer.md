# xats HTML Renderer Reference

**Version:** 1.0 (supports xats schema v0.3.0)  
**Module:** `@xats-org/core/renderer`  
**Status:** Reference Implementation

---

## Overview

The xats HTML Renderer is a reference implementation that converts xats documents into semantic, accessible HTML. It provides complete support for all xats v0.3.0 features including Case Study blocks, Metacognitive Prompts, and IndexRun semantic text runs.

## Key Features

### Complete Schema Support
- ✅ **All Core Blocks**: paragraph, heading, list, blockquote, code, math, table, figure
- ✅ **v0.3.0 Blocks**: caseStudy, metacognitivePrompt  
- ✅ **SemanticText Runs**: text, emphasis, strong, reference, citation, index
- ✅ **Structural Elements**: units, chapters, sections with proper hierarchy
- ✅ **Placeholders**: Table of contents, bibliography, index generation

### Accessibility & Standards
- ✅ **WCAG 2.1 Compliance**: Proper semantic HTML, ARIA labels, keyboard navigation
- ✅ **Skip Navigation**: Customizable skip links for screen readers
- ✅ **Language Support**: RTL/LTR text direction, language attributes
- ✅ **Print Styles**: Optimized CSS for printing

### Advanced Features
- ✅ **Bibliography Generation**: Automatic formatting from CSL-JSON data
- ✅ **Index Generation**: Automatic index creation from IndexRun instances
- ✅ **Rights Management**: Display licensing and attribution information
- ✅ **Responsive Design**: Mobile-first, responsive layout
- ✅ **Customizable CSS**: Override styling with custom CSS classes

## Installation & Usage

### Basic Usage

```typescript
import { XatsHtmlRenderer, XatsDocument } from '@xats-org/core/renderer';

// Load your xats document
const document: XatsDocument = JSON.parse(xatsJsonString);

// Create renderer with default options
const renderer = new XatsHtmlRenderer();

// Generate HTML
const html = renderer.render(document);

// Save or serve the HTML
```

### CLI Usage

```bash
# Render a xats document to HTML
npx xats-render document.json

# Specify output file
npx xats-render document.json -o output.html

# Render without inline CSS
npx xats-render document.json --no-css

# Render with RTL text direction
npx xats-render document.json -d rtl

# Show help
npx xats-render --help
```

### Advanced Configuration

```typescript
import { XatsHtmlRenderer, RendererOptions } from '@xats-org/core/renderer';

const options: RendererOptions = {
  // Include CSS styles inline (default: true)
  includeCss: true,
  
  // Base URL for resolving resource links
  baseUrl: 'https://example.com/resources/',
  
  // Enable accessibility features (default: true)
  accessibility: true,
  
  // Text direction (default: 'ltr')
  direction: 'rtl',
  
  // Include skip navigation links (default: true)
  includeSkipNavigation: true,
  
  // Custom CSS classes for styling
  cssClasses: {
    document: 'my-custom-document',
    paragraph: 'my-paragraph',
    caseStudy: 'my-case-study',
    // ... other custom classes
  }
};

const renderer = new XatsHtmlRenderer(options);
const html = renderer.render(document);
```

## API Reference

### XatsHtmlRenderer Class

#### Constructor

```typescript
constructor(options?: RendererOptions)
```

Creates a new renderer instance with optional configuration.

#### Methods

##### render(document: XatsDocument): string

Renders a complete xats document to HTML.

**Parameters:**
- `document`: A valid xats document object conforming to the schema

**Returns:**
- Complete HTML document as a string with DOCTYPE, head, and body sections

**Example:**
```typescript
const renderer = new XatsHtmlRenderer();
const htmlOutput = renderer.render(xatsDocument);
```

### RendererOptions Interface

Configuration options for the HTML renderer.

```typescript
interface RendererOptions {
  includeCss?: boolean;           // Include inline CSS (default: true)
  baseUrl?: string;               // Base URL for resources
  accessibility?: boolean;        // Enable accessibility features (default: true)
  direction?: 'ltr' | 'rtl' | 'auto'; // Text direction (default: 'ltr')
  includeSkipNavigation?: boolean;     // Skip navigation links (default: true)
  cssClasses?: Partial<CssClasses>;   // Custom CSS class overrides
}
```

### CssClasses Interface

CSS class names used throughout the rendered HTML. Override these to integrate with your design system.

```typescript
interface CssClasses {
  document: string;              // Root document container
  header: string;                // Document header
  main: string;                  // Main content area
  footer: string;                // Document footer
  unit: string;                  // Unit containers
  chapter: string;               // Chapter containers
  section: string;               // Section containers
  contentBlock: string;          // Content block wrapper
  paragraph: string;             // Paragraph blocks
  heading: string;               // Heading blocks
  list: string;                  // List blocks
  blockquote: string;            // Blockquote blocks
  codeBlock: string;             // Code blocks
  mathBlock: string;             // Math blocks
  table: string;                 // Table blocks
  figure: string;                // Figure blocks
  caseStudy: string;             // Case study blocks (v0.3.0)
  metacognitivePrompt: string;   // Metacognitive prompt blocks (v0.3.0)
  // ... semantic text runs
  emphasis: string;              // Emphasis runs
  strong: string;                // Strong runs
  reference: string;             // Reference runs
  citation: string;              // Citation runs
  index: string;                 // Index runs (v0.3.0)
  skipNavigation: string;        // Skip navigation container
}
```

## Content Block Rendering

### Core Blocks

#### Paragraph
- **Block Type**: `https://xats.org/core/blocks/paragraph`
- **HTML Output**: `<p>` with SemanticText content
- **CSS Class**: `xats-paragraph`

#### Heading
- **Block Type**: `https://xats.org/core/blocks/heading`
- **HTML Output**: `<h1>` to `<h6>` based on structural level
- **CSS Class**: `xats-heading`

#### List
- **Block Type**: `https://xats.org/core/blocks/list`
- **HTML Output**: `<ul>` or `<ol>` with nested support
- **CSS Class**: `xats-list`, `xats-list-item`

#### Blockquote
- **Block Type**: `https://xats.org/core/blocks/blockquote`
- **HTML Output**: `<blockquote>`
- **CSS Class**: `xats-blockquote`

#### Code Block
- **Block Type**: `https://xats.org/core/blocks/codeBlock`
- **HTML Output**: `<pre><code>` with language class
- **CSS Class**: `xats-code-block`
- **Features**: Syntax highlighting class support

#### Math Block
- **Block Type**: `https://xats.org/core/blocks/mathBlock`
- **HTML Output**: `<div role="img">` with alt text
- **CSS Class**: `xats-math-block`
- **Features**: MathJax/KaTeX ready, accessibility compliant

#### Table
- **Block Type**: `https://xats.org/core/blocks/table`
- **HTML Output**: `<table>` with full accessibility
- **CSS Class**: `xats-table`
- **Features**: Headers, captions, summary, scope attributes

#### Figure
- **Block Type**: `https://xats.org/core/blocks/figure`
- **HTML Output**: `<figure>` with media element
- **CSS Class**: `xats-figure`
- **Features**: Images, video, audio support, captions

### v0.3.0 Features

#### Case Study Block
- **Block Type**: `https://xats.org/core/blocks/caseStudy`
- **HTML Output**: `<article>` with structured content
- **CSS Class**: `xats-case-study`

**Structure:**
- Header with title
- Scenario section
- Background section (optional)
- Stakeholders list with roles and motivations
- Timeline with events and significance
- Discussion questions with cognitive levels
- Metadata footer

**Example HTML Structure:**
```html
<article class="xats-case-study">
  <header><h4>Case Title</h4></header>
  <section class="case-scenario">
    <h5>Scenario</h5>
    <div>Scenario content...</div>
  </section>
  <section class="case-stakeholders">
    <h5>Key Stakeholders</h5>
    <div class="stakeholder-list">...</div>
  </section>
  <section class="case-timeline">
    <h5>Timeline</h5>
    <div class="timeline">...</div>
  </section>
  <section class="case-questions">
    <h5>Discussion Questions</h5>
    <ol>...</ol>
  </section>
</article>
```

#### Metacognitive Prompt Block
- **Block Type**: `https://xats.org/core/blocks/metacognitivePrompt`
- **HTML Output**: `<aside>` with scaffolded content
- **CSS Class**: `xats-metacognitive-prompt`

**Structure:**
- Header with prompt type
- Main prompt
- Context (optional)
- Guiding questions
- Scaffolding (sentence starters, examples)
- Metadata footer

**Example HTML Structure:**
```html
<aside class="xats-metacognitive-prompt" data-prompt-type="self-assessment">
  <header><h4>Self Assessment Prompt</h4></header>
  <div class="main-prompt">Main prompt text...</div>
  <div class="guiding-questions">
    <h5>Consider these questions:</h5>
    <ul>...</ul>
  </div>
  <div class="sentence-starters">
    <h5>Sentence starters:</h5>
    <ul>...</ul>
  </div>
</aside>
```

## SemanticText Rendering

### Text Runs
- **Type**: `text`
- **HTML**: Plain text (HTML-escaped)

### Emphasis Runs
- **Type**: `emphasis`
- **HTML**: `<em class="xats-emphasis">`

### Strong Runs
- **Type**: `strong`
- **HTML**: `<strong class="xats-strong">`

### Reference Runs
- **Type**: `reference`
- **HTML**: `<a href="#refId" class="xats-reference">`
- **Features**: Internal document linking

### Citation Runs
- **Type**: `citation`
- **HTML**: `<a href="#cite-refId" class="xats-citation">`
- **Features**: Links to bibliography, formatted citation text

### Index Runs (v0.3.0)
- **Type**: `index`
- **HTML**: `<span class="xats-index" id="indexId" data-index-term="...">`
- **Features**: 
  - Hierarchical indexing with sub-terms
  - Cross-references and redirections
  - Automatic index generation

**Example:**
```html
<span class="xats-index" 
      id="idx-case-study-pedagogy" 
      data-index-term="case study" 
      data-index-subterm="pedagogy">case study</span>
```

## Generated Content

### Table of Contents
- **Placeholder**: `https://xats.org/core/placeholders/tableOfContents`
- **Generation**: Automatic from document structure
- **HTML**: Nested `<ul>` with internal links
- **Features**: Skip links, hierarchical navigation

### Bibliography
- **Placeholder**: `https://xats.org/core/placeholders/bibliography`
- **Generation**: From `backMatter.bibliography` CSL-JSON data
- **HTML**: `<section id="bibliography">` with formatted entries
- **Features**: CSL-style formatting, linked citations

### Index
- **Generation**: Automatic from IndexRun instances
- **HTML**: `<section id="index">` with alphabetical entries
- **Features**: 
  - Hierarchical terms and sub-terms
  - Cross-references ("See also")
  - Redirections ("See")
  - Page-like references to content locations

## Styling & Customization

### Default CSS
The renderer includes comprehensive CSS covering:
- Typography and layout
- Responsive design (mobile-first)
- Print styles
- Accessibility enhancements
- v0.3.0 feature styling

### Custom Styling
Override default classes via `cssClasses` option:

```typescript
const renderer = new XatsHtmlRenderer({
  cssClasses: {
    document: 'my-doc',
    caseStudy: 'case-study-card',
    metacognitivePrompt: 'reflection-prompt'
  }
});
```

### External CSS
Disable inline CSS and use external stylesheets:

```typescript
const renderer = new XatsHtmlRenderer({
  includeCss: false
});
```

## Accessibility Features

### WCAG 2.1 Compliance
- **Skip Navigation**: Keyboard-accessible skip links
- **Semantic HTML**: Proper heading hierarchy, landmarks
- **ARIA Labels**: Screen reader support
- **Alt Text**: Images, math, complex content
- **Language Support**: Language attributes, text direction
- **Keyboard Navigation**: Full keyboard accessibility

### Content-Specific Accessibility
- **Tables**: Headers, captions, scope attributes
- **Math**: Alt text, speech-friendly markup
- **Figures**: Long descriptions for complex content
- **Forms**: Labels and instructions (for interactive content)

### Customizable Accessibility
```typescript
const renderer = new XatsHtmlRenderer({
  accessibility: true,           // Enable accessibility features
  includeSkipNavigation: true,   // Include skip links
  direction: 'auto'             // Auto-detect text direction
});
```

## Error Handling & Fallbacks

### Unknown Block Types
- Graceful degradation to generic block rendering
- Preserves content where possible
- Logs warnings for debugging

### Missing Resources
- Placeholder content for missing images/media
- Maintains document structure
- Clear error indication

### Invalid Content
- HTML escaping for safety
- Fallback rendering for malformed SemanticText
- Continues rendering despite individual block errors

## Performance Considerations

### Large Documents
- Efficient DOM construction
- Minimal memory footprint
- Stream-friendly architecture

### Resource Optimization
- Inline CSS option for single-file output
- Lazy loading support for images
- Print-optimized rendering

## Integration Examples

### Express.js Server
```javascript
import express from 'express';
import { XatsHtmlRenderer } from '@xats-org/core/renderer';

const app = express();
const renderer = new XatsHtmlRenderer();

app.get('/document/:id', async (req, res) => {
  const document = await loadXatsDocument(req.params.id);
  const html = renderer.render(document);
  res.send(html);
});
```

### Static Site Generation
```javascript
import { writeFileSync } from 'fs';
import { XatsHtmlRenderer } from '@xats-org/core/renderer';

const documents = loadAllDocuments();
const renderer = new XatsHtmlRenderer();

documents.forEach(doc => {
  const html = renderer.render(doc.content);
  writeFileSync(`dist/${doc.id}.html`, html);
});
```

### React Integration
```jsx
import { XatsHtmlRenderer } from '@xats-org/core/renderer';

function XatsDocumentViewer({ document }) {
  const renderer = new XatsHtmlRenderer({ includeCss: false });
  const html = renderer.render(document);
  
  return (
    <div 
      className="xats-document"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

## CLI Reference

### Commands

#### Basic Rendering
```bash
xats-render input.json
```

#### Options
```bash
xats-render [options] <input-file>

Options:
  -o, --output <file>           Output HTML file path
  -c, --include-css             Include CSS styles inline (default: true)
  -b, --base-url <url>          Base URL for resolving resources
  -a, --accessibility           Enable accessibility features (default: true)
  -d, --direction <dir>         Text direction: ltr, rtl, auto (default: ltr)
  -s, --skip-navigation         Include skip navigation links (default: true)
  -h, --help                    Show help message
  -v, --version                 Show version information
```

#### Examples
```bash
# Render with custom output
xats-render textbook.json -o output.html

# Render without inline CSS
xats-render textbook.json --no-css

# Render with RTL support
xats-render textbook.json -d rtl -o arabic-textbook.html

# Render with custom base URL
xats-render textbook.json -b https://cdn.example.com/assets/
```

## Browser Compatibility

### Supported Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Fallbacks
- Modern CSS with graceful degradation
- Progressive enhancement approach
- Print styles for legacy browsers

## Troubleshooting

### Common Issues

#### Large File Sizes
- Use `includeCss: false` and external stylesheets
- Optimize resource URLs
- Consider content pagination

#### Styling Conflicts
- Use custom CSS classes
- Namespace selectors
- Override specific properties

#### Accessibility Warnings
- Ensure alt text for images
- Verify heading hierarchy
- Test with screen readers

#### Performance Issues
- Profile large documents
- Consider chunked rendering
- Optimize resource loading

### Debug Mode
Enable debug logging for troubleshooting:

```typescript
const renderer = new XatsHtmlRenderer({
  // Enable debug mode (if available in future versions)
  debug: true
});
```

## Contributing

### Extension Points
- Custom block renderers
- SemanticText run handlers
- CSS theme development
- Accessibility enhancements

### Testing
- Unit tests for all block types
- Integration tests with example documents
- Accessibility testing with screen readers
- Cross-browser compatibility testing

---

For additional examples and advanced usage patterns, see the [examples/rendered/](../../examples/rendered/) directory.