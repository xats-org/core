/**
 * Validation-related types for xats
 */

/**
 * Result of validating a xats document
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  schemaVersion?: string;
  warnings?: ValidationWarning[];
  metadata?: ValidationMetadata;
}

/**
 * Validation error details
 */
export interface ValidationError {
  path: string;
  message: string;
  keyword?: string;
  params?: Record<string, unknown>;
  data?: unknown;
  severity?: 'error' | 'critical';
}

/**
 * Validation warning (non-fatal issues)
 */
export interface ValidationWarning {
  path: string;
  message: string;
  code?: string;
  suggestion?: string;
}

/**
 * Metadata about the validation process
 */
export interface ValidationMetadata {
  validationTime: number;
  schemaUsed: string;
  validatorVersion: string;
  documentSize?: number;
  checksum?: string;
}

/**
 * Options for configuring validation
 */
export interface ValidatorOptions {
  schemaVersion?: string;
  strict?: boolean;
  allErrors?: boolean;
  verbose?: boolean;
  includeWarnings?: boolean;
  maxErrors?: number;
}

/**
 * Schema validation mode
 */
export type ValidationMode = 'strict' | 'lenient' | 'legacy';

/**
 * Validation context for tracking state
 */
export interface ValidationContext {
  currentPath: string[];
  errors: ValidationError[];
  warnings: ValidationWarning[];
  seenIds: Set<string>;
  fileReferences: Map<string, string>;
}