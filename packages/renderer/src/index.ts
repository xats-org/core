/**
 * @xats-org/renderer - Rendering engine for xats documents
 */

export { BaseRenderer, type RendererOptions } from './base-renderer.js';
export { HtmlRenderer, type HtmlRendererOptions } from './renderers/html.js';
export { MarkdownRenderer, type MarkdownRendererOptions } from './renderers/markdown.js';
export { TextRenderer, type TextRendererOptions } from './renderers/text.js';

// Convenience factory function
import { HtmlRenderer, type HtmlRendererOptions } from './renderers/html.js';
import { MarkdownRenderer, type MarkdownRendererOptions } from './renderers/markdown.js';
import { TextRenderer, type TextRendererOptions } from './renderers/text.js';

import type { XatsDocument } from '@xats-org/types';

export type OutputFormat = 'html' | 'markdown' | 'text';

export type RenderOptions = HtmlRendererOptions | MarkdownRendererOptions | TextRendererOptions;

/**
 * Render a xats document to a specific format
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
