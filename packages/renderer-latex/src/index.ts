/**
 * @xats-org/renderer-latex - LaTeX Bidirectional Renderer
 *
 * Provides bidirectional conversion between xats documents and LaTeX format
 * supporting academic publishing workflows with high fidelity preservation.
 */

// Main simplified renderer (working implementation)
export { SimpleLaTeXRenderer as LaTeXRenderer } from './simple-renderer.js';
export { SimpleLaTeXRenderer as default } from './simple-renderer.js';

// Types
export type {
  LaTeXRendererOptions,
  LaTeXParseOptions,
  LaTeXDocumentClass,
  LaTeXPackage,
  LaTeXEnvironment,
  LaTeXMetadata,
} from './types.js';

// Advanced components (work in progress - not included in build)
// export { LaTeXRenderer as AdvancedLaTeXRenderer } from './renderer.js';
// export { LaTeXParser } from './parser.js';
// export { LaTeXConverter } from './converter.js';
// export { LaTeXValidator } from './validator.js';
// export { LaTeXTestSuite } from './testing/index.js';
