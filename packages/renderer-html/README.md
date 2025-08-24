# @xats-org/renderer-html

HTML5 bidirectional renderer for xats documents with comprehensive WCAG 2.1 AA accessibility compliance and v0.5.0 enhanced rendering hints support.

## Features

- **🎨 Enhanced Rendering Hints (v0.5.0)**: Full support for semantic, accessibility, layout, and pedagogical hints
- **♿ WCAG 2.1 AA Compliance**: Comprehensive accessibility features with automated testing
- **🔄 Bidirectional Conversion**: High-fidelity HTML ↔ xats conversion with >95% round-trip fidelity
- **⚡ Performance Optimized**: Efficient rendering for large documents with memory management
- **🧪 Comprehensive Testing**: Automated accessibility auditing with axe-core integration
- **📱 Responsive Design**: Built-in responsive design with user preference support

## Installation

```bash
npm install @xats-org/renderer-html
# or
pnpm add @xats-org/renderer-html
```

## Quick Start

```javascript
import { HtmlRenderer } from '@xats-org/renderer-html';

// Create renderer with enhanced features
const renderer = new HtmlRenderer({
  enhancedHints: true,
  accessibilityMode: true,
  wrapInDocument: true,
  userPreferences: ['high-contrast', 'screen-reader']
});

// Render xats document to HTML
const result = await renderer.render(xatsDocument);
console.log(result.content); // Accessible HTML5 output

// Parse HTML back to xats
const parseResult = await renderer.parse(htmlContent);
console.log(parseResult.document); // Reconstructed xats document
```

## Enhanced Rendering Hints (v0.5.0)

The HTML renderer supports all v0.5.0 enhanced rendering hints:

### Semantic Hints
```javascript
{
  renderingHints: [
    {
      hintType: 'https://xats.org/vocabularies/hints/semantic/warning',
      value: 'warning'
    }
  ]
}
```

Generates accessible HTML with appropriate ARIA roles:
```html
<div class="content-block block-paragraph semantic-warning" role="alert">
  <p>⚠️ Warning content here</p>
</div>
```

### Accessibility Hints
```javascript
{
  renderingHints: [
    {
      hintType: 'https://xats.org/vocabularies/hints/accessibility/keyboard-shortcut',
      value: 'Alt+1'
    }
  ]
}
```

Generates keyboard-accessible HTML:
```html
<div class="content-block" accesskey="Alt+1">
  <p>Content accessible via Alt+1</p>
</div>
```

### Layout Hints
```javascript
{
  renderingHints: [
    {
      hintType: 'https://xats.org/vocabularies/hints/layout/center',
      value: 'center'
    }
  ]
}
```

Generates styled HTML with CSS classes:
```html
<div class="content-block layout-center" style="margin: 0 auto; text-align: center;">
  <p>Centered content</p>
</div>
```

### Pedagogical Hints
```javascript
{
  renderingHints: [
    {
      hintType: 'https://xats.org/vocabularies/hints/pedagogical/key-concept',
      value: 'key-concept'
    }
  ]
}
```

Generates educational HTML with semantic indicators:
```html
<div class="content-block pedagogical-key-concept" role="note">
  <p>🔑 Key Concept: Important concept here</p>
</div>
```

## Configuration Options

```javascript
const renderer = new HtmlRenderer({
  // Document structure
  wrapInDocument: true,          // Include <!DOCTYPE html> and full structure
  includeStyles: true,           // Include default CSS styles
  customStyles: 'body { ... }',  // Add custom CSS
  
  // Accessibility
  accessibilityMode: true,       // Enable all accessibility features
  includeAria: true,            // Include ARIA attributes
  userPreferences: [            // User accessibility preferences
    'high-contrast',
    'large-text', 
    'reduced-motion',
    'screen-reader',
    'keyboard-only'
  ],
  
  // Enhanced rendering hints (v0.5.0)
  enhancedHints: true,          // Enable v0.5.0 rendering hints
  mediaContext: 'screen',       // Media context for conditional hints
  
  // Performance
  optimizeForLargeDocuments: true,  // Enable performance optimizations
  memoryOptimized: true,            // Use memory-efficient processing
  maxChunks: 50,                    // Chunking size for large documents
  
  // Output control
  sanitize: true,               // Sanitize HTML output
  language: 'en',              // Default language
  semantic: true               // Use semantic HTML5 elements
});
```

## Accessibility Compliance

The HTML renderer ensures WCAG 2.1 AA compliance:

```javascript
// Test WCAG compliance
const complianceResult = await renderer.testCompliance(htmlContent, 'AA');
console.log(`Compliant: ${complianceResult.compliant}`);
console.log(`Score: ${complianceResult.score}/100`);

// Get comprehensive accessibility audit
const auditResult = await renderer.auditAccessibility(htmlContent);
console.log(`Recommendations: ${auditResult.recommendations.length}`);
```

### Accessibility Features

- **Semantic HTML5**: Proper heading hierarchy, landmarks, and semantic elements
- **ARIA Support**: Comprehensive ARIA roles, properties, and states
- **Keyboard Navigation**: Full keyboard accessibility with logical tab order
- **Screen Reader Support**: Optimized for assistive technologies
- **Color Contrast**: WCAG AA compliant color ratios (4.5:1)
- **Focus Management**: Visible focus indicators and skip links
- **Responsive Design**: Works across all devices and zoom levels

## Performance Features

For large documents (>1000 content blocks):

```javascript
const largeDocResult = await renderer.render(largeDocument, {
  optimizeForLargeDocuments: true,
  memoryOptimized: true,
  maxChunks: 25  // Process in smaller chunks
});
```

Performance features include:
- **Chunked Processing**: Breaks large documents into manageable pieces
- **Memory Management**: Efficient memory usage with garbage collection hints
- **Asynchronous Rendering**: Non-blocking rendering with progress yielding
- **Streaming Support**: Supports streaming output for very large documents

## Bidirectional Conversion

High-fidelity conversion in both directions:

```javascript
// xats → HTML → xats round-trip
const renderResult = await renderer.render(originalDocument);
const parseResult = await renderer.parse(renderResult.content);

// Test round-trip fidelity
const roundTripResult = await renderer.testRoundTrip(originalDocument);
console.log(`Fidelity: ${roundTripResult.fidelityScore}%`); // Typically >95%
```

### What's Preserved
- ✅ Document structure and hierarchy
- ✅ Content blocks and semantic text
- ✅ Enhanced rendering hints (v0.5.0)
- ✅ Language and text direction
- ✅ Accessibility metadata
- ✅ Citations and references

## CSS Classes Reference

The renderer generates semantic CSS classes for styling:

### Content Blocks
- `.content-block` - Base class for all blocks
- `.block-paragraph`, `.block-heading`, `.block-list`, etc.

### Semantic Hints
- `.semantic-warning`, `.semantic-info`, `.semantic-success`, `.semantic-error`
- `.semantic-featured`, `.semantic-secondary`, `.semantic-highlight`
- `.semantic-call-to-action`, `.semantic-definition`, `.semantic-example`

### Accessibility Hints  
- `.sr-priority-high`, `.sr-priority-low` - Screen reader priority
- `.high-contrast-compatible` - High contrast mode support
- `.motion-safe` - Reduced motion support
- `.cognitive-high`, `.cognitive-low` - Cognitive load indicators

### Layout Hints
- `.layout-center`, `.layout-float-left`, `.layout-float-right`
- `.layout-full-width`, `.layout-keep-together`, `.layout-responsive`

### Pedagogical Hints
- `.pedagogical-key-concept`, `.pedagogical-learning-objective`
- `.pedagogical-assessment`, `.pedagogical-practice`, `.pedagogical-reflection`

## Examples

See the `/examples` directory for comprehensive usage examples:

- `enhanced-features-demo.js` - Complete feature demonstration
- Run with: `node examples/enhanced-features-demo.js`

## API Reference

### HtmlRenderer Class

#### Constructor
```javascript
new HtmlRenderer(options?: HtmlRendererOptions)
```

#### Methods

##### render(document, options?)
Renders a xats document to HTML5.
- **Returns**: `Promise<RenderResult>`
- **Throws**: Never (errors returned in result)

##### parse(content, options?)  
Parses HTML back to a xats document.
- **Returns**: `Promise<ParseResult>`
- **Throws**: Never (errors returned in result)

##### testCompliance(content, level?)
Tests WCAG compliance of HTML content.
- **Level**: 'A' | 'AA' | 'AAA' (default: 'AA')
- **Returns**: `Promise<WcagResult>`

##### auditAccessibility(content)
Generates comprehensive accessibility audit.
- **Returns**: `Promise<AccessibilityAudit>`

##### testRoundTrip(document, options?)
Tests round-trip conversion fidelity.
- **Returns**: `Promise<RoundTripResult>`

## Contributing

This package is part of the xats monorepo. See the main repository for contribution guidelines.

## License

Licensed under CC-BY-SA-4.0. See LICENSE.md for details.