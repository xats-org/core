/**
 * Type definitions for the xats authoring tools
 */

import type {
  XatsDocument,
  ValidationResult,
  RenderResult,
  ParseResult,
} from '@xats-org/types';

/**
 * Options for the authoring tool
 */
export interface AuthoringToolOptions {
  /** Enable real-time validation */
  realTimeValidation?: boolean;

  /** Enable preview generation */
  enablePreview?: boolean;

  /** Preview format (html, markdown, etc.) */
  previewFormat?: 'html' | 'markdown';

  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;

  /** Maximum number of validation errors to display */
  maxValidationErrors?: number;

  /** Include helpful suggestions in error messages */
  includeSuggestions?: boolean;

  /** User experience level (beginner, intermediate, advanced) */
  userLevel?: 'beginner' | 'intermediate' | 'advanced';

  /** Language for error messages and suggestions */
  language?: string;
}

/**
 * Result of authoring operations
 */
export interface AuthoringResult {
  /** Success status */
  success: boolean;

  /** Generated xats document */
  document?: XatsDocument;

  /** Validation feedback */
  validation?: ValidationFeedback;

  /** Any errors encountered */
  errors?: UserFriendlyError[];

  /** Processing time in milliseconds */
  processingTime?: number;
}

/**
 * Result of import operations
 */
export interface ImportResult extends AuthoringResult {
  /** Source format that was imported */
  sourceFormat: string;

  /** Import warnings */
  warnings?: string[];

  /** Elements that couldn't be mapped */
  unmappedElements?: string[];

  /** Fidelity score (0-1) */
  fidelityScore?: number;
}

/**
 * Result of export operations
 */
export interface ExportResult {
  /** Success status */
  success: boolean;

  /** Exported content */
  content?: string;

  /** Target format */
  format: string;

  /** Export warnings */
  warnings?: string[];

  /** Processing time */
  processingTime?: number;

  /** Any errors encountered */
  errors?: UserFriendlyError[];
}

/**
 * Enhanced validation feedback for authors
 */
export interface ValidationFeedback {
  /** Is the document valid? */
  isValid: boolean;

  /** User-friendly error messages */
  errors: UserFriendlyError[];

  /** Suggestions for improvement */
  suggestions: ErrorSuggestion[];

  /** Overall quality score (0-100) */
  qualityScore?: number;

  /** Schema version used for validation */
  schemaVersion?: string;
}

/**
 * Preview generation options
 */
export interface PreviewOptions {
  /** Output format for preview */
  format: 'html' | 'markdown';

  /** Include CSS styles */
  includeStyles?: boolean;

  /** Theme for preview */
  theme?: string;

  /** Accessibility mode */
  accessibilityMode?: boolean;

  /** Preview only specific sections */
  sectionIds?: string[];
}

/**
 * Preview generation result
 */
export interface PreviewResult {
  /** Preview content */
  content: string;

  /** Format used */
  format: string;

  /** Assets (CSS, images, etc.) */
  assets?: Array<{ type: string; content: string; name?: string }>;

  /** Generation time */
  generationTime: number;

  /** Any warnings */
  warnings?: string[];
}

/**
 * Options for simplified syntax parsing
 */
export interface SimplifiedSyntaxOptions {
  /** Enable strict mode (more validation) */
  strict?: boolean;

  /** Allow custom block types */
  allowCustomBlocks?: boolean;

  /** Enable auto-completion */
  autoComplete?: boolean;

  /** Include line numbers in errors */
  includeLineNumbers?: boolean;
}

/**
 * Simplified document representation
 */
export interface SimplifiedDocument {
  /** Document metadata */
  title?: string;
  author?: string;
  subject?: string;

  /** Document content as simplified syntax */
  content: string;

  /** Parsing options */
  options?: SimplifiedSyntaxOptions;
}

/**
 * Syntax element in simplified format
 */
export interface SyntaxElement {
  /** Element type */
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'code' | 'table' | 'figure' | 'math';

  /** Element content */
  content: string | SyntaxElement[];

  /** Element properties */
  properties?: Record<string, unknown>;

  /** Line number in source */
  line?: number;

  /** Column position */
  column?: number;
}

/**
 * Syntax parsing error
 */
export interface SyntaxError {
  /** Error message */
  message: string;

  /** Line number */
  line: number;

  /** Column position */
  column?: number;

  /** Error type */
  type: 'syntax' | 'semantic' | 'validation';

  /** Error severity */
  severity: ErrorSeverity;

  /** Suggested fixes */
  suggestions?: ErrorSuggestion[];
}

/**
 * User-friendly error representation
 */
export interface UserFriendlyError {
  /** Error message in plain language */
  message: string;

  /** Error code (for internationalization) */
  code?: string;

  /** Severity level */
  severity: ErrorSeverity;

  /** Location in document */
  location?: {
    line?: number;
    column?: number;
    path?: string;
  };

  /** Suggested fixes */
  suggestions: ErrorSuggestion[];

  /** Related documentation links */
  documentation?: Array<{
    title: string;
    url: string;
  }>;
}

/**
 * Error suggestion
 */
export interface ErrorSuggestion {
  /** Suggestion description */
  description: string;

  /** Action to take */
  action: 'fix' | 'add' | 'remove' | 'replace' | 'move';

  /** Replacement text */
  fix: string;

  /** Location to apply fix */
  location?: {
    line: number;
    column: number;
  };

  /** Confidence level (0-1) */
  confidence: number;

  /** Whether this is an automatic fix */
  automatic?: boolean;
}

/**
 * Error severity levels
 */
export type ErrorSeverity = 'error' | 'warning' | 'info' | 'hint';