# xats HTML Renderer Examples

This directory contains rendered HTML examples demonstrating the capabilities of the xats HTML reference renderer. These examples showcase all supported features from the xats schema v0.3.0.

## 🚀 Quick Start

**Browse all examples:** Open [`index.html`](./index.html) in your web browser for an interactive gallery.

**Individual examples:** Each `.html` file is a complete, standalone document that can be opened directly in any web browser.

## 📋 Available Examples

### Core Examples

#### [`v0.3.0-features-example.html`](./v0.3.0-features-example.html)
**Demonstrates:** v0.3.0 features including Case Study blocks, Metacognitive Prompts, and IndexRun support.

**Key features shown:**
- Case Study with stakeholders, timeline, and discussion questions
- Metacognitive Prompt with scaffolding and guidance
- IndexRun semantic text with cross-references and index generation
- Bibliography and index generation

#### [`accessibility-sample-v0.2.0.html`](./accessibility-sample-v0.2.0.html)  
**Demonstrates:** WCAG 2.1 accessibility compliance and inclusive design features.

**Key features shown:**
- Skip navigation links
- Semantic HTML structure
- ARIA labels and roles
- Proper heading hierarchy
- Alt text for images and complex content
- Keyboard navigation support

#### [`adaptive-pathway-example.html`](./adaptive-pathway-example.html)
**Demonstrates:** Conditional learning pathways and adaptive content delivery.

**Key features shown:**
- Pathway conditions and routing rules
- Learning objective tracking
- Assessment-driven content flow
- Pedagogical metadata

### Integration Examples

#### [`lti-integration-example.html`](./lti-integration-example.html)
**Demonstrates:** Learning Tools Interoperability (LTI) 1.3 integration features.

**Key features shown:**
- LTI launch metadata
- Grade passback configuration
- Deep linking support
- Assessment integration

#### [`rights-management-example.html`](./rights-management-example.html)
**Demonstrates:** Comprehensive rights and licensing metadata support.

**Key features shown:**
- Creative Commons licensing
- Copyright attribution
- Usage permissions and restrictions
- Rights metadata display

## 🎨 Rendering Variants

Each example is available in multiple variants to demonstrate different rendering options:

### Standard Rendering (`example.html`)
- Full CSS styling included inline
- All accessibility features enabled
- Skip navigation links included
- Left-to-right text direction
- Complete feature set

### Minimal Rendering (`example-minimal.html`)
- No CSS styling (external CSS expected)
- Reduced accessibility features
- No skip navigation
- Bare HTML structure for custom styling

### RTL Rendering (`example-rtl.html`)
- Right-to-left text direction
- RTL-optimized layout
- Full accessibility maintained
- Appropriate for Arabic, Hebrew, etc.

### Accessibility-Focused (`example-accessibility-focused.html`)
- Enhanced accessibility features
- Maximum WCAG compliance
- Additional ARIA labels
- Screen reader optimizations

## 🛠️ How These Examples Were Generated

These HTML files were generated using the xats HTML renderer:

### Command Line
```bash
# Generate standard example
xats-render v0.3.0-features-example.json -o v0.3.0-features-example.html

# Generate minimal example
xats-render v0.3.0-features-example.json --no-css -o v0.3.0-features-example-minimal.html

# Generate RTL example
xats-render v0.3.0-features-example.json -d rtl -o v0.3.0-features-example-rtl.html
```

### Programmatic Generation
```typescript
import { XatsHtmlRenderer } from '@xats-org/core/renderer';

const renderer = new XatsHtmlRenderer({
  includeCss: true,
  accessibility: true,
  direction: 'ltr',
  includeSkipNavigation: true
});

const html = renderer.render(xatsDocument);
```

## 🔍 What to Look For

### v0.3.0 Features

#### Case Study Blocks
- Rich stakeholder information with roles and motivations
- Interactive timeline with event significance
- Cognitive-level tagged discussion questions
- Pedagogical metadata integration

#### Metacognitive Prompts
- Self-assessment and reflection guidance  
- Scaffolding with sentence starters
- Progressive questioning techniques
- Response format suggestions

#### IndexRun Support
- Inline term marking with yellow highlighting
- Hierarchical index terms and sub-terms
- Cross-references ("See also") functionality
- Automatic index generation in footer

### Core Features

#### SemanticText Rendering
- **Emphasis**: *Italicized text* with `<em>` tags
- **Strong**: **Bold text** with `<strong>` tags  
- **References**: Links to other parts of the document
- **Citations**: Links to bibliography with formatted citations
- **Index terms**: Highlighted indexable content

#### Content Block Support
- **Paragraphs**: Rich text with semantic runs
- **Headings**: Proper hierarchy (H1-H6)
- **Lists**: Ordered and unordered with nesting
- **Code blocks**: Syntax highlighting ready
- **Math blocks**: Accessible mathematical content
- **Tables**: Full accessibility with headers and captions
- **Figures**: Images, videos, audio with alt text

#### Generated Content
- **Bibliography**: Formatted from CSL-JSON data
- **Index**: Alphabetical with cross-references
- **Table of Contents**: Hierarchical navigation (when present)

### Accessibility Features

#### WCAG 2.1 Compliance
- Skip navigation for keyboard users
- Semantic HTML structure throughout
- Proper heading hierarchy (H1→H2→H3)
- ARIA labels for complex content
- Alt text for all images and math
- Language attributes on content

#### Screen Reader Support
- Descriptive link text
- Table headers properly associated
- Form labels (when present)
- Landmark roles for navigation

#### Keyboard Navigation
- All interactive elements reachable
- Focus indicators visible
- Logical tab order maintained
- Skip links functional

## 💡 Usage Tips

### Integration with Your Site
1. **External CSS**: Use minimal variants and add your own styling
2. **Custom Classes**: Override CSS classes in renderer options
3. **Base URL**: Set base URL for proper resource resolution
4. **Language Support**: Use direction option for RTL languages

### Development Workflow
1. **Preview**: Use standard variants for content review
2. **Styling**: Use minimal variants for CSS development  
3. **Testing**: Use accessibility variants for compliance testing
4. **Production**: Configure renderer for your specific needs

### Performance Optimization
- Use external CSS for multiple documents
- Optimize images and media resources
- Consider lazy loading for large documents
- Minimize inline styles for better caching

## 🔧 Customization Examples

### Custom CSS Classes
```typescript
const renderer = new XatsHtmlRenderer({
  cssClasses: {
    caseStudy: 'business-case-study',
    metacognitivePrompt: 'reflection-prompt',
    index: 'term-highlight'
  }
});
```

### External Styling
```typescript
const renderer = new XatsHtmlRenderer({
  includeCss: false  // Use your own CSS
});
```

### Multi-language Support
```typescript
const renderer = new XatsHtmlRenderer({
  direction: 'rtl',  // For Arabic, Hebrew, etc.
  accessibility: true
});
```

## 📖 Further Reading

- **[Renderer Documentation](../../docs/reference/renderer.md)** - Complete API reference
- **[xats Schema](../../schemas/0.3.0/xats.json)** - Full schema specification
- **[Source Code](../../src/renderer.ts)** - Implementation details
- **[CLI Tool](../../src/render-cli.ts)** - Command-line interface

## 🤝 Contributing

Found an issue with the renderer? Have suggestions for improvements?

1. **Check existing examples** to understand current behavior
2. **Test with different variants** to isolate the issue
3. **File an issue** with example documents and expected output
4. **Submit PRs** with test cases and documentation

## 📊 Browser Compatibility

These examples work in:
- **Chrome** 90+ ✅
- **Firefox** 88+ ✅  
- **Safari** 14+ ✅
- **Edge** 90+ ✅
- **Mobile browsers** ✅

---

**Generated automatically** by the xats HTML renderer on ${new Date().toISOString()}  
**Part of the** [Extensible Academic Textbook Schema (xats)](https://xats.org) project