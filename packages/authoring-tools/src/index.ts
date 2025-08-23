/**
 * @xats-org/authoring-tools - Enhanced Authoring Tools
 *
 * Provides simplified authoring capabilities for creating xats documents
 * with markdown-like syntax, DOCX import/export, real-time validation,
 * and preview generation.
 */

export { XatsAuthoringTool } from './authoring-tool.js';
export { SimplifiedSyntaxParser } from './syntax-parser.js';
export { ErrorMessagesService } from './error-messages.js';
export { PreviewGenerator } from './preview-generator.js';

export type {
  AuthoringToolOptions,
  AuthoringResult,
  ImportResult,
  ExportResult,
  ValidationFeedback,
  PreviewOptions,
  PreviewResult,
  SimplifiedSyntaxOptions,
  SimplifiedDocument,
  SyntaxElement,
  SyntaxError,
  UserFriendlyError,
  ErrorSuggestion,
  ErrorSeverity,
} from './types.js';
