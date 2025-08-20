/**
 * @xats/renderer - Rendering engine for xats documents
 */

export { BaseRenderer, type RendererOptions } from './base-renderer.js';
export { HtmlRenderer, type HtmlRendererOptions } from './renderers/html.js';
export { MarkdownRenderer, type MarkdownRendererOptions } from './renderers/markdown.js';
export { TextRenderer, type TextRendererOptions } from './renderers/text.js';

// Convenience factory function
import type { XatsDocument } from '@xats/types';
import { HtmlRenderer } from './renderers/html.js';
import { MarkdownRenderer } from './renderers/markdown.js';
import { TextRenderer } from './renderers/text.js';

export type OutputFormat = 'html' | 'markdown' | 'text';

/**
 * Render a xats document to a specific format
 */
export function render(
  document: XatsDocument,
  format: OutputFormat = 'html',
  options: any = {}
): string {
  switch (format) {
    case 'html':
      return new HtmlRenderer(options).render(document);
    case 'markdown':
      return new MarkdownRenderer(options).render(document);
    case 'text':
      return new TextRenderer(options).render(document);
    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
}