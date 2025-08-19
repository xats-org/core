/**
 * xats Core Library
 * 
 * Main entry point for the xats core validation and tooling library.
 */

export {
  XatsValidator,
  createValidator,
  validateXats,
  validateXatsFile,
  type ValidationResult,
  type ValidationError,
  type ValidatorOptions
} from './validator.js';

export {
  FileModularityValidator,
  createFileModularityValidator,
  validateModularXats,
  type FileReference,
  type ResolvedFile,
  type FileResolutionResult,
  type PerformanceMetrics,
  type FileModularityValidatorOptions
} from './file-modularity-validator.js';

export {
  XatsHtmlRenderer,
  renderXatsToHtml,
  type XatsDocument,
  type RendererOptions,
  type CssClasses,
  type SemanticText,
  type Run,
  type IndexRun,
  type ContentBlock
} from './renderer.js';

// Version information
export const version = '0.2.0';
export const schemaVersion = '0.3.0';