/**
 * Test suite for the complete bidirectional renderer architecture
 */

import { describe, test, expect, beforeEach } from 'vitest';

import { RendererFactory, PluginRegistry, AbstractBidirectionalRenderer } from '../index.js';

import type {
  XatsDocument,
  RenderResult,
  ParseResult,
  FormatValidationResult,
  BidirectionalRenderer,
  RendererPlugin,
  ParseOptions,
} from '@xats-org/types';

// Mock renderer for testing
class MockRenderer extends AbstractBidirectionalRenderer {
  readonly format = 'mock' as const;
  readonly wcagLevel = 'AA' as const;

  render(document: XatsDocument): Promise<RenderResult> {
    return Promise.resolve({
      content: JSON.stringify(document),
      metadata: {
        format: 'mock',
        renderTime: 10,
        wordCount: this.estimateWordCount(document),
      },
      assets: [],
      errors: [],
    });
  }

  parse(content: string, _options?: ParseOptions): Promise<ParseResult> {
    try {
      const document = JSON.parse(content) as XatsDocument;
      return Promise.resolve({
        document,
        metadata: {
          sourceFormat: 'mock',
          parseTime: 5,
          mappedElements: 10,
          unmappedElements: 0,
          fidelityScore: 1.0,
        },
        warnings: [],
        errors: [],
        unmappedData: [],
      });
    } catch (error) {
      return Promise.resolve({
        document: this.createEmptyDocument(),
        metadata: {
          sourceFormat: 'mock',
          parseTime: 5,
          mappedElements: 0,
          unmappedElements: 0,
          fidelityScore: 0,
        },
        errors: [
          {
            type: 'malformed-content',
            message: `Parse failed: ${String(error)}`,
            fatal: true,
          },
        ],
      });
    }
  }

  validate(content: string): Promise<FormatValidationResult> {
    try {
      JSON.parse(content);
      return Promise.resolve({
        valid: true,
        errors: [],
        warnings: [],
      });
    } catch (error) {
      return Promise.resolve({
        valid: false,
        errors: [
          {
            code: 'INVALID_JSON',
            message: String(error),
            severity: 'error' as const,
          },
        ],
        warnings: [],
      });
    }
  }
}

// Mock plugin for testing
class MockPlugin implements RendererPlugin {
  readonly id = 'mock-plugin';
  readonly name = 'Mock Plugin';
  readonly version = '1.0.0';
  readonly compatibleFormats = ['mock' as const];

  private initialized = false;

  initialize(_renderer: BidirectionalRenderer): Promise<void> {
    this.initialized = true;
    return Promise.resolve();
  }

  cleanup(): Promise<void> {
    this.initialized = false;
    return Promise.resolve();
  }

  get isInitialized(): boolean {
    return this.initialized;
  }
}

// Test document
const testDocument: XatsDocument = {
  schemaVersion: '0.3.0',
  bibliographicEntry: {
    type: 'book',
    title: 'Test Document',
  },
  subject: 'Testing',
  bodyMatter: {
    contents: [
      {
        id: 'chapter-1',
        label: '1',
        title: {
          runs: [{ type: 'text', text: 'Introduction' }],
        },
        contents: [
          {
            id: 'para-1',
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              text: {
                runs: [{ type: 'text', text: 'This is a test paragraph.' }],
              },
            },
          },
        ],
      },
    ],
  },
};

describe('Bidirectional Renderer Architecture', () => {
  let factory: RendererFactory;
  let pluginRegistry: PluginRegistry;

  beforeEach(() => {
    factory = new RendererFactory();
    pluginRegistry = new PluginRegistry();
  });

  describe('RendererFactory', () => {
    test('should register and create renderers', () => {
      // Register mock renderer
      factory.registerRenderer('mock', MockRenderer, {
        name: 'Mock Renderer',
        version: '1.0.0',
        description: 'Mock renderer for testing',
        wcagLevel: 'AA',
      });

      // Check registration
      expect(factory.supportsFormat('mock')).toBe(true);
      expect(factory.getAvailableFormats()).toContain('mock');

      // Create renderer
      const renderer = factory.createRenderer('mock');
      expect(renderer.format).toBe('mock');
      expect(renderer.wcagLevel).toBe('AA');
    });

    test('should provide renderer metadata', () => {
      factory.registerRenderer('mock', MockRenderer, {
        name: 'Mock Renderer',
        version: '1.0.0',
        description: 'Mock renderer for testing',
        wcagLevel: 'AA',
      });

      const metadata = factory.getRendererMetadata('mock');
      expect(metadata).toEqual({
        name: 'Mock Renderer',
        version: '1.0.0',
        description: 'Mock renderer for testing',
        wcagLevel: 'AA',
      });
    });

    test('should find renderers by WCAG level', () => {
      factory.registerRenderer('mock', MockRenderer, {
        wcagLevel: 'AA',
      });

      const aaRenderers = factory.getRenderersByWcagLevel('AA');
      expect(aaRenderers).toContain('mock');

      const aaaRenderers = factory.getRenderersByWcagLevel('AAA');
      expect(aaaRenderers).not.toContain('mock');
    });

    test('should create multiple renderers efficiently', () => {
      factory.registerRenderer('mock', MockRenderer);

      const renderers = factory.createRenderers(['mock']);
      expect(renderers.size).toBe(1);
      expect(renderers.get('mock')?.format).toBe('mock');
    });

    test('should throw error for unsupported format', () => {
      expect(() => factory.createRenderer('unsupported')).toThrow(
        'No renderer registered for format'
      );
    });

    test('should prevent duplicate registration', () => {
      factory.registerRenderer('mock', MockRenderer);

      expect(() => {
        factory.registerRenderer('mock', MockRenderer);
      }).toThrow('already registered');
    });
  });

  describe('PluginRegistry', () => {
    test('should register and manage plugins', () => {
      const plugin = new MockPlugin();

      // Register plugin
      pluginRegistry.register(plugin);

      // Check registration
      expect(pluginRegistry.getPlugin('mock-plugin')).toBe(plugin);
      expect(pluginRegistry.listPlugins()).toContain(plugin);
    });

    test('should find compatible plugins', () => {
      const plugin = new MockPlugin();
      pluginRegistry.register(plugin);

      const compatiblePlugins = pluginRegistry.findCompatiblePlugins('mock');
      expect(compatiblePlugins).toContain(plugin);

      const incompatiblePlugins = pluginRegistry.findCompatiblePlugins('other');
      expect(incompatiblePlugins).not.toContain(plugin);
    });

    test('should initialize plugins with renderers', async () => {
      const plugin = new MockPlugin();
      const mockRenderer = new MockRenderer();

      pluginRegistry.register(plugin);
      await pluginRegistry.initializePlugin('mock-plugin', mockRenderer);

      expect(plugin.isInitialized).toBe(true);
    });

    test('should provide registry statistics', () => {
      const plugin = new MockPlugin();
      pluginRegistry.register(plugin);

      const stats = pluginRegistry.getStatistics();
      expect(stats.totalPlugins).toBe(1);
      expect(stats.pluginsByFormat.mock).toBe(1);
    });

    test('should prevent duplicate plugin registration', () => {
      const plugin = new MockPlugin();
      pluginRegistry.register(plugin);

      expect(() => pluginRegistry.register(plugin)).toThrow('already registered');
    });

    test('should unregister plugins', async () => {
      const plugin = new MockPlugin();
      pluginRegistry.register(plugin);

      await pluginRegistry.unregister('mock-plugin');
      expect(pluginRegistry.getPlugin('mock-plugin')).toBeUndefined();
    });
  });

  describe('AbstractBidirectionalRenderer', () => {
    let renderer: MockRenderer;

    beforeEach(() => {
      renderer = new MockRenderer();
    });

    test('should render documents', async () => {
      const result = await renderer.render(testDocument);

      expect(result.content).toBeDefined();
      expect(result.metadata?.format).toBe('mock');
      expect(result.metadata?.wordCount).toBeGreaterThan(0);
    });

    test('should parse content back to documents', async () => {
      const renderResult = await renderer.render(testDocument);
      const parseResult = await renderer.parse(renderResult.content);

      expect(parseResult.document).toBeDefined();
      expect(parseResult.metadata?.fidelityScore).toBe(1.0);
    });

    test('should validate content', async () => {
      const renderResult = await renderer.render(testDocument);
      const validationResult = await renderer.validate(renderResult.content);

      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    test('should test round-trip fidelity', async () => {
      const roundTripResult = await renderer.testRoundTrip(testDocument);

      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.fidelityScore).toBeGreaterThan(0.9);
      expect(roundTripResult.original).toEqual(testDocument);
    });

    test('should handle errors gracefully', async () => {
      const parseResult = await renderer.parse('invalid json');

      expect(parseResult.errors).toHaveLength(1);
      expect(parseResult.errors?.[0]?.type).toBe('malformed-content');
    });

    test('should estimate word count', async () => {
      const result = await renderer.render(testDocument);
      const wordCount = result.metadata?.wordCount;

      expect(wordCount).toBeGreaterThan(0);
      expect(wordCount).toBeLessThan(100); // Should be reasonable for test document
    });

    test('should provide semantic text utilities', () => {
      const semanticText = testDocument.bodyMatter.contents[0]?.title;
      const textString = renderer['getSemanticTextString'](semanticText!);

      expect(textString).toBe('Introduction');
    });
  });

  describe('Complete Architecture Integration', () => {
    test('should work end-to-end with factory, registry, and renderer', async () => {
      // Register renderer in factory
      factory.registerRenderer('mock', MockRenderer, {
        name: 'Mock Renderer',
        version: '1.0.0',
        wcagLevel: 'AA',
      });

      // Register plugin in registry
      const plugin = new MockPlugin();
      pluginRegistry.register(plugin);

      // Create renderer from factory
      const renderer = factory.createRenderer('mock');

      // Initialize plugin with renderer
      await pluginRegistry.initializePlugin('mock-plugin', renderer);

      // Test complete workflow
      const renderResult = await renderer.render(testDocument);
      const parseResult = await renderer.parse(renderResult.content);
      const validationResult = await renderer.validate(renderResult.content);
      const roundTripResult = await renderer.testRoundTrip(testDocument);

      // Verify all operations succeeded
      expect(renderResult.content).toBeDefined();
      expect(parseResult.document.bibliographicEntry?.title).toBe('Test Document');
      expect(validationResult.valid).toBe(true);
      expect(roundTripResult.success).toBe(true);
      expect(plugin.isInitialized).toBe(true);
    });

    test('should support multiple renderers and plugins', () => {
      // Register multiple renderer instances (in real usage these would be different classes)
      factory.registerRenderer('mock', MockRenderer, { name: 'Mock Renderer 1' });

      // Could register different renderer classes here:
      // factory.registerRenderer('html', HtmlRenderer, { name: 'HTML Renderer' });
      // factory.registerRenderer('docx', DocxRenderer, { name: 'DOCX Renderer' });

      // Register multiple plugins
      const plugin1 = new MockPlugin();
      pluginRegistry.register(plugin1);

      // Get statistics
      const factoryMetadata = factory.getAllRendererMetadata();
      const registryStats = pluginRegistry.getStatistics();

      expect(factoryMetadata.length).toBe(1);
      expect(registryStats.totalPlugins).toBe(1);
    });
  });
});
