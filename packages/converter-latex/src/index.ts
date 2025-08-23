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

// Types and interfaces
export type * from './types.js';

/**
 * Create a LaTeX converter instance with sensible defaults
 */
export function createLaTeXConverter() {
  const { LaTeXConverter } = require('./latex-converter.js');
  return new LaTeXConverter();
}

/**
 * Convenience function to convert xats document to LaTeX
 */
export async function convertToLaTeX(
  document: import('@xats-org/types').XatsDocument,
  options?: import('./types.js').LaTeXConverterOptions
) {
  const { LaTeXConverter } = require('./latex-converter.js');
  const converter = new LaTeXConverter();
  return converter.render(document, options);
}

/**
 * Convenience function to convert LaTeX document to xats
 */
export async function convertFromLaTeX(
  content: string,
  options?: import('./types.js').LaTeXParseOptions
) {
  const { LaTeXConverter } = require('./latex-converter.js');
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
  const { LaTeXConverter } = require('./latex-converter.js');
  const converter = new LaTeXConverter();
  return converter.testRoundTrip(document, options);
}

/**
 * Create LaTeX converter optimized for academic journals
 */
export function createAcademicConverter(journalName?: string) {
  const { LaTeXConverter } = require('./latex-converter.js');
  const converter = new LaTeXConverter();
  // TODO: Apply journal-specific configurations
  return converter;
}

/**
 * Create LaTeX converter optimized for mathematical content
 */
export function createMathConverter() {
  const { LaTeXConverter } = require('./latex-converter.js');
  const converter = new LaTeXConverter();
  // TODO: Apply math-optimized configurations
  return converter;
}