/**
 * @fileoverview LaTeX bidirectional converter for xats documents
 * Academic publishing-grade conversion between xats and LaTeX with support for:
 * - Advanced mathematical content
 * - Academic publishing workflows
 * - Bibliography and cross-references
 * - Professional typesetting
 */

export { LaTeXConverter } from './converter';
export type {
  LaTeXConverterOptions,
  LaTeXRenderOptions,
  LaTeXParseOptions,
  LaTeXPackage,
  MathDelimiters,
  MathParsingOptions,
  BibliographyOptions,
  LaTeXRenderResult,
  LaTeXParseResult,
  LaTeXRenderMetadata,
  LaTeXParseMetadata,
} from './types';
export { LaTeXValidator } from './validator';
export { MathProcessor } from './math-processor';
export { BibliographyProcessor } from './bibliography-processor';
export { PackageManager } from './package-manager';
