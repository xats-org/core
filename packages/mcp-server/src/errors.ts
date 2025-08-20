/**
 * @xats/mcp-server - Comprehensive Error Handling
 */

import type { McpServerConfig } from './types.js';

/**
 * Base MCP error with structured information
 */
export class McpError extends Error {
  public readonly code: string;
  public readonly details?: any;
  public readonly timestamp: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';

  constructor(
    message: string,
    code: string,
    details?: any,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message);
    this.name = 'McpError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.severity = severity;

    // Maintain proper stack trace for V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, McpError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      timestamp: this.timestamp,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Input validation errors
 */
export class ValidationError extends McpError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details, 'medium');
    this.name = 'ValidationError';
  }
}

export class SchemaValidationError extends ValidationError {
  constructor(message: string, schemaErrors?: any[]) {
    super(message, { schemaErrors });
    this.name = 'SchemaValidationError';
  }
}

export class InputValidationError extends ValidationError {
  constructor(field: string, expected: string, received?: any) {
    super(`Invalid input for field '${field}': expected ${expected}`, {
      field,
      expected,
      received,
    });
    this.name = 'InputValidationError';
  }
}

/**
 * Document processing errors
 */
export class DocumentError extends McpError {
  constructor(
    message: string,
    details?: any,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message, 'DOCUMENT_ERROR', details, severity);
    this.name = 'DocumentError';
  }
}

export class DocumentNotFoundError extends DocumentError {
  constructor(documentId?: string) {
    super(
      documentId ? `Document with ID '${documentId}' not found` : 'Document not found',
      { documentId },
      'medium'
    );
    this.name = 'DocumentNotFoundError';
  }
}

export class DocumentParseError extends DocumentError {
  constructor(message: string, parseDetails?: any) {
    super(`Failed to parse document: ${message}`, parseDetails, 'high');
    this.name = 'DocumentParseError';
  }
}

export class UnsupportedSchemaVersionError extends DocumentError {
  constructor(version: string, supportedVersions: string[]) {
    super(
      `Unsupported schema version '${version}'. Supported versions: ${supportedVersions.join(', ')}`,
      { version, supportedVersions },
      'high'
    );
    this.name = 'UnsupportedSchemaVersionError';
  }
}

/**
 * Tool-specific errors
 */
export class ToolError extends McpError {
  public readonly toolName: string;

  constructor(
    toolName: string,
    message: string,
    code: string,
    details?: any,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message, code, details, severity);
    this.name = 'ToolError';
    this.toolName = toolName;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      toolName: this.toolName,
    };
  }
}

export class AnalysisError extends ToolError {
  constructor(message: string, details?: any) {
    super('xats_analyze', message, 'ANALYSIS_ERROR', details);
    this.name = 'AnalysisError';
  }
}

export class TransformError extends ToolError {
  constructor(message: string, details?: any) {
    super('xats_transform', message, 'TRANSFORM_ERROR', details);
    this.name = 'TransformError';
  }
}

export class ExtractionError extends ToolError {
  constructor(message: string, details?: any) {
    super('xats_extract', message, 'EXTRACTION_ERROR', details);
    this.name = 'ExtractionError';
  }
}

export class CreationError extends ToolError {
  constructor(message: string, details?: any) {
    super('xats_create', message, 'CREATION_ERROR', details);
    this.name = 'CreationError';
  }
}

/**
 * Server and infrastructure errors
 */
export class ServerError extends McpError {
  constructor(message: string, details?: any) {
    super(message, 'SERVER_ERROR', details, 'high');
    this.name = 'ServerError';
  }
}

export class ConfigurationError extends ServerError {
  constructor(message: string, configDetails?: any) {
    super(`Configuration error: ${message}`, configDetails);
    this.name = 'ConfigurationError';
  }
}

export class TimeoutError extends ServerError {
  constructor(operation: string, timeoutMs: number) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, {
      operation,
      timeoutMs,
    });
    this.name = 'TimeoutError';
  }
}

/**
 * Resource and external dependency errors
 */
export class ResourceError extends McpError {
  constructor(message: string, resource: string, details?: any) {
    super(message, 'RESOURCE_ERROR', { resource, ...details }, 'medium');
    this.name = 'ResourceError';
  }
}

export class NetworkError extends ResourceError {
  constructor(message: string, url?: string) {
    super(`Network error: ${message}`, 'network', { url });
    this.name = 'NetworkError';
  }
}

export class FileSystemError extends ResourceError {
  constructor(message: string, path?: string, operation?: string) {
    super(`File system error: ${message}`, 'filesystem', { path, operation });
    this.name = 'FileSystemError';
  }
}

/**
 * Error handler utility functions
 */

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: Error, toolName?: string): any {
  const mcpError =
    error instanceof McpError
      ? error
      : new McpError(error.message || 'Unknown error', 'UNKNOWN_ERROR', {
          originalError: error.constructor.name,
        });

  return {
    success: false,
    error: mcpError.message,
    metadata: {
      toolName: toolName || 'unknown',
      timestamp: mcpError.timestamp,
      errorCode: mcpError.code,
      errorType: mcpError.name,
      severity: mcpError.severity,
      details: mcpError.details,
    },
  };
}

/**
 * Validate and normalize input for tools
 */
export function validateToolInput(input: any, requiredFields: string[], _toolName: string): void {
  if (!input || typeof input !== 'object') {
    throw new InputValidationError('input', 'object', typeof input);
  }

  for (const field of requiredFields) {
    if (!(field in input) || input[field] === undefined || input[field] === null) {
      throw new InputValidationError(field, 'required field', 'missing or null');
    }
  }
}

/**
 * Safely execute a tool function with error handling
 */
export async function safeExecuteTool<T>(
  toolName: string,
  operation: () => Promise<T>,
  config: McpServerConfig
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Log error if logging is configured
    if (config.logging?.enabled) {
      console.error(`[${toolName}] Error:`, error);
    }

    // Re-throw with additional context
    if (error instanceof McpError) {
      throw error;
    }

    throw new ToolError(
      toolName,
      error instanceof Error ? error.message : 'Unknown error occurred',
      'TOOL_EXECUTION_ERROR',
      {
        originalError: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      }
    );
  }
}

/**
 * Error severity levels and their handling
 */
export const ERROR_SEVERITY = {
  low: {
    level: 0,
    description: "Minor issues that don't prevent operation",
    action: 'Log and continue',
  },
  medium: {
    level: 1,
    description: 'Errors that affect functionality but can be recovered',
    action: 'Log, notify user, attempt recovery',
  },
  high: {
    level: 2,
    description: 'Serious errors that prevent normal operation',
    action: 'Log, notify user, fail gracefully',
  },
  critical: {
    level: 3,
    description: 'System-threatening errors',
    action: 'Log, alert administrators, stop operation',
  },
} as const;

/**
 * Get error handling strategy based on severity
 */
export function getErrorHandlingStrategy(severity: keyof typeof ERROR_SEVERITY) {
  return ERROR_SEVERITY[severity];
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: Error, context?: any): string {
  const timestamp = new Date().toISOString();
  const errorInfo =
    error instanceof McpError
      ? error.toJSON()
      : {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };

  return JSON.stringify(
    {
      timestamp,
      context,
      error: errorInfo,
    },
    null,
    2
  );
}

/**
 * Common error patterns and their standardized messages
 */
export const COMMON_ERRORS = {
  MISSING_DOCUMENT: 'Document is required but was not provided',
  INVALID_DOCUMENT_FORMAT: 'Document format is invalid or corrupted',
  UNSUPPORTED_SCHEMA_VERSION: 'Schema version is not supported',
  NETWORK_TIMEOUT: 'Network request timed out',
  PARSING_FAILED: 'Failed to parse document content',
  VALIDATION_FAILED: 'Document validation failed',
  TRANSFORMATION_FAILED: 'Document transformation failed',
  ANALYSIS_FAILED: 'Document analysis failed',
  EXTRACTION_FAILED: 'Content extraction failed',
  CREATION_FAILED: 'Document creation failed',
} as const;

/**
 * Create error with common pattern
 */
export function createCommonError(
  pattern: keyof typeof COMMON_ERRORS,
  details?: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): McpError {
  return new McpError(COMMON_ERRORS[pattern], pattern, details, severity);
}

// Export all error types for easy importing
export {
  McpError as BaseError,
  ValidationError as BaseValidationError,
  DocumentError as BaseDocumentError,
  ToolError as BaseToolError,
  ServerError as BaseServerError,
  ResourceError as BaseResourceError,
};
