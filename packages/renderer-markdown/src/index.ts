/**
 * @xats-org/renderer-markdown - Markdown Bidirectional Renderer
 *
 * Provides bidirectional conversion between xats documents and Markdown format
 * supporting documentation workflows with high fidelity preservation.
 */

// Main simplified renderer (working implementation)
export { SimpleMarkdownRenderer as MarkdownRenderer } from './simple-renderer.js';
export { SimpleMarkdownRenderer as default } from './simple-renderer.js';

// Types
export type {
  MarkdownRendererOptions,
  MarkdownParseOptions,
  MarkdownVariant,
  MarkdownMetadata,
  MarkdownSyntaxPreferences,
  MarkdownHeading,
  MarkdownLink,
  MarkdownImage,
  MarkdownCodeBlock,
  MarkdownTable,
  MarkdownFootnote,
  MarkdownCitation,
  MarkdownTaskList,
  MarkdownTaskItem,
  MarkdownContext,
  MarkdownSyntaxError,
  MarkdownFormatting,
  MarkdownElementType,
  MarkdownPipelineStage,
  AcademicMarkdownOptions,
} from './types.js';
