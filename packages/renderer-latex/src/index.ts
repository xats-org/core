/**
 * @xats-org/renderer-latex - LaTeX Bidirectional Renderer
 *
 * Provides bidirectional conversion between xats documents and LaTeX format
 * supporting academic publishing workflows with high fidelity preservation.
 */

// Main bidirectional renderer (full implementation)
export { LaTeXRenderer } from './renderer.js';
export { LaTeXRenderer as default } from './renderer.js';

// Also export the simple renderer for compatibility
export { SimpleLaTeXRenderer } from './simple-renderer.js';

// Types
export type {
  LaTeXRendererOptions,
  LaTeXParseOptions,
  LaTeXDocumentClass,
  LaTeXPackage,
  LaTeXEnvironment,
  LaTeXMetadata,
} from './types.js';

// Advanced components
export { LaTeXParser } from './parser.js';
export { LaTeXConverter } from './converter.js';
export { LaTeXValidator } from './validator.js';
// export { LaTeXTestSuite } from './testing/index.js';
