/**
 * @xats-org/renderer - Bidirectional Rendering Core for xats documents
 * 
 * This package provides the core infrastructure for the bidirectional renderer
 * architecture introduced in v0.5.0, including factory pattern, plugin system,
 * and shared utilities for all format-specific renderers.
 */

// Legacy renderers (will be deprecated in favor of bidirectional renderers)
export { BaseRenderer, type RendererOptions } from './base-renderer.js';
export { HtmlRenderer, type HtmlRendererOptions } from './renderers/html.js';
export { MarkdownRenderer, type MarkdownRendererOptions } from './renderers/markdown.js';
export { TextRenderer, type TextRendererOptions } from './renderers/text.js';

// v0.5.0 Bidirectional Renderer Architecture
export { RendererFactory } from './factory.js';
export { PluginRegistry } from './plugin-registry.js';
export { 
  AbstractBidirectionalRenderer,
  type BidirectionalRendererConfig 
} from './abstract-bidirectional-renderer.js';

// Re-export types from @xats-org/types for convenience
export type {
  BidirectionalRenderer,
  RendererPlugin,
  RendererFactory as IRendererFactory,
  PluginRegistry as IPluginRegistry,
  RenderFormat,
  RenderResult,
  ParseResult,
  RoundTripResult,
  FormatValidationResult,
  FormatMetadata,
  ParseOptions,
  RoundTripOptions,
  WcagCompliance,
  AccessibilityAudit,
} from '@xats-org/types';

// Convenience factory function (legacy - use RendererFactory for new code)
import { HtmlRenderer, type HtmlRendererOptions } from './renderers/html.js';
import { MarkdownRenderer, type MarkdownRendererOptions } from './renderers/markdown.js';
import { TextRenderer, type TextRendererOptions } from './renderers/text.js';

import type { XatsDocument } from '@xats-org/types';

export type OutputFormat = 'html' | 'markdown' | 'text';

export type RenderOptions = HtmlRendererOptions | MarkdownRendererOptions | TextRendererOptions;

/**
 * Legacy render function for backwards compatibility
 * @deprecated Use RendererFactory.createRenderer() for new code
 */
export function render(
  document: XatsDocument,
  format: OutputFormat = 'html',
  options: RenderOptions = {}
): string {
  switch (format) {
    case 'html':
      return new HtmlRenderer(options as HtmlRendererOptions).render(document);
    case 'markdown':
      return new MarkdownRenderer(options as MarkdownRendererOptions).render(document);
    case 'text':
      return new TextRenderer(options as TextRendererOptions).render(document);
    default:
      throw new Error(`Unsupported output format: ${format as string}`);
  }
}
