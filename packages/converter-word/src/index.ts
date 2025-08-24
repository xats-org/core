/**
 * @fileoverview Microsoft Word bidirectional converter for xats documents
 * High-fidelity conversion between xats and Word documents with support for:
 * - Educational content preservation
 * - Track changes and comments
 * - Complex formatting and styles
 * - Production workflows
 */

export { WordConverter } from './converter';
export type {
  WordConverterOptions,
  WordRenderOptions,
  WordParseOptions,
  WordStyleMappings,
  TrackChangesOptions,
  CommentsOptions,
  WordRenderResult,
  WordParseResult,
  RoundTripOptions,
  RoundTripResult,
} from './types';
export { WordValidator } from './validator';
export { StyleMapper } from './style-mapper';
export { AnnotationProcessor } from './annotation-processor';
