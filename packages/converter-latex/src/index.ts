/**
 * @xats-org/converter-latex
 * 
 * Advanced bidirectional LaTeX converter for xats with academic publishing workflow support.
 * Provides high-fidelity conversion between xats documents and LaTeX format with
 * comprehensive support for mathematical content, scholarly structures, and
 * production publishing workflows.
 */

// Main converter class
export { LaTeXConverter } from './latex-converter.js';
export { LaTeXConverter as default } from './latex-converter.js';

// Specialized conversion utilities
export { LaTeXToXatsConverter } from './converters/latex-to-xats.js';
export { XatsToLaTeXConverter } from './converters/xats-to-latex.js';

// Math handling utilities
export { MathProcessor } from './math/math-processor.js';
export { LaTeXMathParser } from './math/latex-math-parser.js';
export { MathMLConverter } from './math/mathml-converter.js';

// Bibliography and citation handling
export { BibliographyProcessor } from './bibliography/bibliography-processor.js';
export { CitationResolver } from './bibliography/citation-resolver.js';

// Package and command handling
export { PackageRegistry } from './packages/package-registry.js';
export { CommandProcessor } from './packages/command-processor.js';

// Document structure utilities
export { DocumentAnalyzer } from './utils/document-analyzer.js';
export { LaTeXValidator } from './utils/latex-validator.js';
export { FidelityTester } from './utils/fidelity-tester.js';

// Types and interfaces
export type {
  LaTeXConverterOptions,
  LaTeXParseOptions,
  LaTeXMetadata,
  LaTeXRoundTripResult,
  LaTeXConversionContext,
  LaTeXPackage,
  GeometryOptions,
  FontConfiguration,
  MathFontConfiguration,
  NumberingOptions,
  CrossReferenceOptions,
  IndexingOptions,
  GlossaryOptions,
  JournalOptions,
  MathParsingOptions,
  MathEnvironmentOptions,
  BibliographyParsingOptions,
  FloatHandlingOptions,
  CrossReferenceResolution,
  CommandDefinition,
  PackageParser,
  BibliographyMetadata,
  LaTeXFidelityIssue,
} from './types.js';

// Constants and presets
export { DEFAULT_LATEX_OPTIONS } from './config/defaults.js';
export { ACADEMIC_PACKAGES } from './config/academic-packages.js';
export { JOURNAL_PRESETS } from './config/journal-presets.js';
export { MATH_ENVIRONMENTS } from './config/math-environments.js';

/**
 * Create a LaTeX converter instance with sensible defaults
 */
export function createLaTeXConverter(): LaTeXConverter {
  return new LaTeXConverter();
}

/**
 * Convenience function to convert xats document to LaTeX
 */
export async function convertToLaTeX(
  document: import('@xats-org/types').XatsDocument,
  options?: LaTeXConverterOptions
) {
  const converter = new LaTeXConverter();
  return converter.render(document, options);
}

/**
 * Convenience function to convert LaTeX document to xats
 */
export async function convertFromLaTeX(
  content: string,
  options?: LaTeXParseOptions
) {
  const converter = new LaTeXConverter();
  return converter.parse(content, options);
}

/**
 * Test round-trip conversion fidelity
 */
export async function testLaTeXRoundTrip(
  document: import('@xats-org/types').XatsDocument,
  options?: import('@xats-org/types').RoundTripOptions
) {
  const converter = new LaTeXConverter();
  return converter.testRoundTrip(document, options);
}

/**
 * Create LaTeX converter optimized for academic journals
 */
export function createAcademicConverter(journalName?: string): LaTeXConverter {
  const converter = new LaTeXConverter();
  // TODO: Apply journal-specific configurations
  return converter;
}

/**
 * Create LaTeX converter optimized for mathematical content
 */
export function createMathConverter(): LaTeXConverter {
  const converter = new LaTeXConverter();
  // TODO: Apply math-optimized configurations
  return converter;
}