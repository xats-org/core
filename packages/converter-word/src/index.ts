/**
 * @xats-org/converter-word
 * 
 * Advanced bidirectional Word converter for xats with production workflow support.
 * Provides high-fidelity conversion between xats documents and Microsoft Word format
 * with comprehensive support for educational content, track changes, comments, and
 * complex formatting preservation.
 */

// Main converter class
export { WordConverter } from './word-converter.js';
export { WordConverter as default } from './word-converter.js';

// Types and interfaces
export type * from './types.js';

/**
 * Create a Word converter instance with sensible defaults
 */
export function createWordConverter() {
  const { WordConverter } = require('./word-converter.js');
  return new WordConverter();
}

/**
 * Convenience function to convert xats document to Word
 */
export async function convertToWord(
  document: import('@xats-org/types').XatsDocument,
  options?: import('./types.js').WordConverterOptions
) {
  const { WordConverter } = require('./word-converter.js');
  const converter = new WordConverter();
  return converter.render(document, options);
}

/**
 * Convenience function to convert Word document to xats
 */
export async function convertFromWord(
  content: string,
  options?: import('./types.js').WordParseOptions
) {
  const { WordConverter } = require('./word-converter.js');
  const converter = new WordConverter();
  return converter.parse(content, options);
}

/**
 * Test round-trip conversion fidelity
 */
export async function testWordRoundTrip(
  document: import('@xats-org/types').XatsDocument,
  options?: import('@xats-org/types').RoundTripOptions
) {
  const { WordConverter } = require('./word-converter.js');
  const converter = new WordConverter();
  return converter.testRoundTrip(document, options);
}