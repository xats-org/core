/**
 * Renderer Factory - Dynamic creation and management of bidirectional renderers
 */

import type {
  BidirectionalRenderer,
  RendererFactory as IRendererFactory,
  RenderFormat,
} from '@xats-org/types';

/**
 * Constructor type for bidirectional renderer classes
 */
type RendererConstructor<T extends BidirectionalRenderer = BidirectionalRenderer> = new (
  options?: unknown
) => T;

/**
 * Renderer registration entry
 */
interface RendererRegistration<T extends BidirectionalRenderer = BidirectionalRenderer> {
  format: RenderFormat;
  constructor: RendererConstructor<T>;
  defaultOptions: unknown;
  metadata: {
    name: string;
    version: string;
    description?: string;
    wcagLevel: 'A' | 'AA' | 'AAA' | null;
  };
}

/**
 * Factory for creating and managing bidirectional renderer instances
 */
export class RendererFactory implements IRendererFactory {
  private registrations = new Map<RenderFormat, RendererRegistration>();

  /**
   * Create a renderer for the specified format
   */
  async createRenderer<T extends BidirectionalRenderer>(format: RenderFormat): Promise<T> {
    const registration = this.registrations.get(format);
    
    if (!registration) {
      throw new Error(
        `No renderer registered for format '${format}'. Available formats: ${Array.from(this.registrations.keys()).join(', ')}`
      );
    }

    try {
      // Create renderer instance with default options
      const renderer = new registration.constructor(registration.defaultOptions) as T;
      
      // Validate that the renderer implements the correct interface
      this.validateRenderer(renderer, format);
      
      return renderer;
    } catch (error) {
      throw new Error(
        `Failed to create renderer for format '${format}': ${String(error)}`
      );
    }
  }

  /**
   * Get available renderer formats
   */
  getAvailableFormats(): RenderFormat[] {
    return Array.from(this.registrations.keys());
  }

  /**
   * Check if a format is supported
   */
  supportsFormat(format: RenderFormat): boolean {
    return this.registrations.has(format);
  }

  /**
   * Register a new renderer implementation
   */
  registerRenderer<T extends BidirectionalRenderer>(
    format: RenderFormat,
    rendererClass: RendererConstructor<T>,
    options: {
      defaultOptions?: unknown;
      name?: string;
      version?: string;
      description?: string;
      wcagLevel?: 'A' | 'AA' | 'AAA' | null;
    } = {}
  ): void {
    if (this.registrations.has(format)) {
      throw new Error(`Renderer for format '${format}' is already registered`);
    }

    const metadata: RendererRegistration<T>['metadata'] = {
      name: options.name || `${format} Renderer`,
      version: options.version || '1.0.0',
      wcagLevel: options.wcagLevel || null,
    };

    if (options.description !== undefined) {
      metadata.description = options.description;
    }

    const registration: RendererRegistration<T> = {
      format,
      constructor: rendererClass,
      defaultOptions: options.defaultOptions || {},
      metadata,
    };

    this.registrations.set(format, registration);
  }

  /**
   * Unregister a renderer for a specific format
   */
  unregisterRenderer(format: RenderFormat): boolean {
    return this.registrations.delete(format);
  }

  /**
   * Get metadata for a registered renderer
   */
  getRendererMetadata(format: RenderFormat): RendererRegistration['metadata'] | undefined {
    return this.registrations.get(format)?.metadata;
  }

  /**
   * Get all renderer metadata
   */
  getAllRendererMetadata(): Array<{ format: RenderFormat; metadata: RendererRegistration['metadata'] }> {
    return Array.from(this.registrations.entries()).map(([format, registration]) => ({
      format,
      metadata: registration.metadata,
    }));
  }

  /**
   * Create multiple renderers efficiently
   */
  async createRenderers<T extends BidirectionalRenderer>(
    formats: RenderFormat[]
  ): Promise<Map<RenderFormat, T>> {
    const renderers = new Map<RenderFormat, T>();
    
    const creationPromises = formats.map(async (format) => {
      try {
        const renderer = await this.createRenderer<T>(format);
        return { format, renderer };
      } catch (error) {
        throw new Error(`Failed to create ${format} renderer: ${String(error)}`);
      }
    });

    const results = await Promise.all(creationPromises);
    
    for (const { format, renderer } of results) {
      renderers.set(format, renderer);
    }

    return renderers;
  }

  /**
   * Find renderers by WCAG compliance level
   */
  getRenderersByWcagLevel(level: 'A' | 'AA' | 'AAA'): RenderFormat[] {
    const compatibleFormats: RenderFormat[] = [];
    
    for (const [format, registration] of this.registrations.entries()) {
      const rendererLevel = registration.metadata.wcagLevel;
      
      if (rendererLevel && this.isWcagLevelCompatible(rendererLevel, level)) {
        compatibleFormats.push(format);
      }
    }

    return compatibleFormats;
  }

  /**
   * Reset factory to initial state (mainly for testing)
   */
  reset(): void {
    this.registrations.clear();
  }

  /**
   * Validate that a renderer implements the required interface
   */
  private validateRenderer(renderer: BidirectionalRenderer, expectedFormat: RenderFormat): void {
    if (!renderer.format) {
      throw new Error('Renderer must have a format property');
    }

    if (renderer.format !== expectedFormat) {
      throw new Error(
        `Renderer format mismatch: expected '${expectedFormat}', got '${renderer.format}'`
      );
    }

    // Check required methods
    const requiredMethods = ['render', 'parse', 'testRoundTrip', 'validate'];
    for (const method of requiredMethods) {
      if (typeof renderer[method as keyof BidirectionalRenderer] !== 'function') {
        throw new Error(`Renderer must implement ${method} method`);
      }
    }
  }

  /**
   * Check if a WCAG level is compatible with the required level
   */
  private isWcagLevelCompatible(rendererLevel: 'A' | 'AA' | 'AAA', requiredLevel: 'A' | 'AA' | 'AAA'): boolean {
    const levels = { 'A': 1, 'AA': 2, 'AAA': 3 };
    return levels[rendererLevel] >= levels[requiredLevel];
  }
}

/**
 * Global renderer factory instance
 */
export const rendererFactory = new RendererFactory();

/**
 * Auto-register built-in renderers if available
 * This is called lazily when the factory is first used to avoid import errors
 */
async function registerBuiltInRenderers(): Promise<void> {
  // We'll implement auto-registration in a future update
  // For now, renderers must be manually registered by the application
  
  // Example of how to register renderers:
  // 
  // import { HtmlRenderer } from '@xats-org/renderer-html';
  // rendererFactory.registerRenderer('html', HtmlRenderer, {
  //   name: 'HTML5 Bidirectional Renderer',
  //   version: '1.0.0',
  //   description: 'WCAG 2.1 AA compliant HTML5 renderer with full accessibility support',
  //   wcagLevel: 'AA',
  // });
}

// Note: Auto-registration is disabled for now to avoid import issues
// Applications should manually register the renderers they need