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

// Specialized conversion utilities
export { WordToXatsConverter } from './converters/word-to-xats.js';
export { XatsToWordConverter } from './converters/xats-to-word.js';

// Style and format handling
export { StyleMapper } from './style-mapper.js';
export { FormatPreserver } from './format-preserver.js';

// Annotation and collaboration features
export { AnnotationConverter } from './annotations/annotation-converter.js';
export { CommentHandler } from './annotations/comment-handler.js';
export { TrackChangesHandler } from './annotations/track-changes-handler.js';

// Utility classes
export { WordDocumentAnalyzer } from './utils/document-analyzer.js';
export { FidelityTester } from './utils/fidelity-tester.js';

// Types and interfaces
export type {
  WordConverterOptions,
  WordParseOptions,
  WordMetadata,
  WordRoundTripResult,
  WordConversionContext,
  DocumentProperties,
  DocumentComment,
  Revision,
  PageSetup,
  Typography,
  TrackChangesOptions,
  CommentOptions,
  StyleMappings,
  StyleMapping,
  ImageHandling,
  TableFormatting,
  MathHandling,
  DocumentStatistics,
  StyleInfo,
  FidelityIssue,
} from './types.js';

// Constants and configuration
export { DEFAULT_WORD_OPTIONS } from './config/defaults.js';
export { WORD_STYLE_MAPPINGS } from './config/style-mappings.js';
export { PRODUCTION_PRESETS } from './config/production-presets.js';

/**
 * Create a Word converter instance with sensible defaults
 */
export function createWordConverter(): WordConverter {
  return new WordConverter();
}

/**
 * Convenience function to convert xats document to Word
 */
export async function convertToWord(
  document: import('@xats-org/types').XatsDocument,
  options?: WordConverterOptions
) {
  const converter = new WordConverter();
  return converter.render(document, options);
}

/**
 * Convenience function to convert Word document to xats
 */
export async function convertFromWord(
  content: string,
  options?: WordParseOptions
) {
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
  const converter = new WordConverter();
  return converter.testRoundTrip(document, options);
}