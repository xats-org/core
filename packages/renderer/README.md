# @xats-org/renderer - Bidirectional Renderer Core

The `@xats-org/renderer` package provides the core infrastructure for the bidirectional renderer architecture introduced in xats v0.5.0. This package enables seamless conversion between xats documents and various target formats while maintaining semantic fidelity and accessibility compliance.

## Features

- **Factory Pattern**: Dynamic creation and management of renderer instances
- **Plugin System**: Extensible architecture for custom renderer enhancements
- **Abstract Base Class**: Simplified implementation of new bidirectional renderers
- **WCAG Compliance**: Built-in accessibility testing and validation
- **Round-trip Testing**: Automatic fidelity testing for format conversions
- **Performance Monitoring**: Built-in metrics collection and benchmarking

## Installation

```bash
npm install @xats-org/renderer
```

## Quick Start

```typescript
import { RendererFactory, pluginRegistry } from '@xats-org/renderer';
import { HtmlRenderer } from '@xats-org/renderer-html';

// Register a renderer with the factory
const factory = new RendererFactory();
factory.registerRenderer('html', HtmlRenderer, {
  name: 'HTML5 Bidirectional Renderer',
  version: '1.0.0',
  description: 'WCAG 2.1 AA compliant HTML5 renderer',
  wcagLevel: 'AA',
});

// Create and use a renderer
const htmlRenderer = await factory.createRenderer('html');
const renderResult = await htmlRenderer.render(xatsDocument);
const parseResult = await htmlRenderer.parse(renderResult.content);

// Test round-trip fidelity
const roundTripResult = await htmlRenderer.testRoundTrip(xatsDocument);
console.log(`Fidelity score: ${roundTripResult.fidelityScore}`);
```

## Architecture Overview

### Core Components

1. **RendererFactory**: Creates and manages renderer instances
2. **PluginRegistry**: Manages renderer extensions and plugins
3. **AbstractBidirectionalRenderer**: Base class for implementing renderers
4. **BidirectionalRenderer Interface**: Common contract for all renderers

### Supported Operations

Every bidirectional renderer supports these core operations:

- **render(document)**: Convert xats document to target format
- **parse(content)**: Convert target format back to xats document
- **validate(content)**: Validate format-specific content
- **testRoundTrip(document)**: Test conversion fidelity

## Creating a Custom Renderer

Implement a new renderer by extending `AbstractBidirectionalRenderer`:

```typescript
import { AbstractBidirectionalRenderer } from '@xats-org/renderer';
import type { XatsDocument, RenderResult, ParseResult } from '@xats-org/types';

export class MyCustomRenderer extends AbstractBidirectionalRenderer {
  readonly format = 'mycustom' as const;
  readonly wcagLevel = 'AA' as const;

  async render(document: XatsDocument): Promise<RenderResult> {
    // Implement conversion from xats to your format
    const content = this.convertDocumentToMyFormat(document);
    
    return {
      content,
      metadata: {
        format: this.format,
        renderTime: performance.now(),
        wordCount: this.estimateWordCount(document),
      },
      assets: [],
      errors: [],
    };
  }

  async parse(content: string): Promise<ParseResult> {
    // Implement conversion from your format back to xats
    const document = this.parseMyFormatToDocument(content);
    
    return {
      document,
      metadata: {
        sourceFormat: this.format,
        parseTime: performance.now(),
        mappedElements: 100,
        unmappedElements: 0,
        fidelityScore: 0.95,
      },
      warnings: [],
      errors: [],
      unmappedData: [],
    };
  }

  async validate(content: string): Promise<FormatValidationResult> {
    // Implement format-specific validation
    const isValid = this.isValidMyFormat(content);
    
    return {
      valid: isValid,
      errors: [],
      warnings: [],
    };
  }

  // Implement your custom conversion logic
  private convertDocumentToMyFormat(document: XatsDocument): string {
    // Your implementation here
    return '';
  }

  private parseMyFormatToDocument(content: string): XatsDocument {
    // Your implementation here
    return this.createEmptyDocument();
  }

  private isValidMyFormat(content: string): boolean {
    // Your validation logic here
    return true;
  }
}
```

### Register Your Custom Renderer

```typescript
import { rendererFactory } from '@xats-org/renderer';

rendererFactory.registerRenderer('mycustom', MyCustomRenderer, {
  name: 'My Custom Renderer',
  version: '1.0.0',
  description: 'Custom format renderer for specific use case',
  wcagLevel: 'AA',
});

// Now you can create instances
const renderer = await rendererFactory.createRenderer('mycustom');
```

## Plugin System

Extend renderer functionality with plugins:

```typescript
import type { RendererPlugin, BidirectionalRenderer } from '@xats-org/types';

export class MyRendererPlugin implements RendererPlugin {
  readonly id = 'my-plugin';
  readonly name = 'My Renderer Plugin';
  readonly version = '1.0.0';
  readonly compatibleFormats = ['html', 'markdown'];

  async initialize(renderer: BidirectionalRenderer): Promise<void> {
    // Initialize plugin with renderer instance
    console.log(`Plugin initialized for ${renderer.format} renderer`);
  }

  async beforeRender?(document: XatsDocument): Promise<void> {
    // Pre-processing before rendering
  }

  async afterRender?(result: RenderResult): Promise<RenderResult> {
    // Post-processing after rendering
    return result;
  }

  async cleanup?(): Promise<void> {
    // Cleanup plugin resources
  }
}

// Register and use the plugin
import { pluginRegistry } from '@xats-org/renderer';

await pluginRegistry.register(new MyRendererPlugin());
await pluginRegistry.initializePlugin('my-plugin', renderer);
```

## Testing and Quality Assurance

The architecture includes comprehensive testing capabilities:

### Round-trip Testing

```typescript
const roundTripResult = await renderer.testRoundTrip(document, {
  fidelityThreshold: 0.95,
  semanticComparison: true,
  ignoreElements: ['id', 'extensions'],
});

if (roundTripResult.success) {
  console.log('Round-trip test passed!');
} else {
  console.log('Differences found:', roundTripResult.differences);
}
```

### WCAG Compliance Testing

```typescript
import { WcagTester } from '@xats-org/testing';

const wcagTester = new WcagTester();
const renderResult = await renderer.render(document);
const audit = await wcagTester.auditAccessibility(renderResult.content);

console.log(`WCAG compliance: ${audit.compliant ? 'PASS' : 'FAIL'}`);
console.log(`Overall score: ${audit.overallScore}/100`);
```

### Performance Benchmarking

```typescript
import { PerformanceBenchmark, BenchmarkTestFactory } from '@xats-org/testing';

const benchmark = new PerformanceBenchmark();
const testCase = BenchmarkTestFactory.createSmallDocumentTest(document);

const results = await benchmark.runBenchmarkSuite(renderer, [testCase]);
console.log(`Average throughput: ${results.summary.averageThroughput} docs/sec`);
```

## Available Renderers

The following official renderers are available:

- **@xats-org/renderer-html**: HTML5 with full WCAG 2.1 AA compliance
- **@xats-org/renderer-docx**: Microsoft Word DOCX format
- **@xats-org/renderer-latex**: LaTeX for academic publishing
- **@xats-org/renderer-markdown**: GitHub-flavored Markdown
- **@xats-org/renderer-rmarkdown**: R Markdown for data science

## API Reference

### RendererFactory

- `createRenderer<T>(format)`: Create renderer instance
- `registerRenderer(format, class, options)`: Register new renderer
- `getAvailableFormats()`: List supported formats
- `supportsFormat(format)`: Check format support
- `getRenderersByWcagLevel(level)`: Find WCAG-compliant renderers

### PluginRegistry

- `register(plugin)`: Register new plugin
- `unregister(pluginId)`: Remove plugin
- `initializePlugin(pluginId, renderer)`: Initialize plugin with renderer
- `findCompatiblePlugins(format)`: Find plugins for format
- `getStatistics()`: Get registry statistics

### AbstractBidirectionalRenderer

Protected utility methods for subclasses:

- `estimateWordCount(document)`: Calculate word count
- `getSemanticTextString(semanticText)`: Extract plain text
- `createEmptyDocument()`: Create fallback document
- `validateDocument(document)`: Validate document structure
- `handleError(error, operation)`: Consistent error handling

## Migration from Legacy Renderers

The new bidirectional architecture is backward compatible with existing renderers. Legacy render functions are still available but deprecated:

```typescript
// Old way (deprecated)
import { render } from '@xats-org/renderer';
const html = render(document, 'html');

// New way (recommended)
import { rendererFactory } from '@xats-org/renderer';
const renderer = await rendererFactory.createRenderer('html');
const result = await renderer.render(document);
const html = result.content;
```

## Contributing

To contribute a new renderer:

1. Extend `AbstractBidirectionalRenderer`
2. Implement the four required methods: `render`, `parse`, `validate`, `testRoundTrip`
3. Add comprehensive tests using the testing framework
4. Ensure WCAG compliance if applicable
5. Document your renderer's specific features and limitations

## License

MIT - see LICENSE file for details.

## Related Packages

- [@xats-org/types](../types/): TypeScript type definitions
- [@xats-org/testing](../testing/): Testing framework for renderers
- [@xats-org/validator](../validator/): Schema validation utilities
- [@xats-org/examples](../examples/): Example xats documents