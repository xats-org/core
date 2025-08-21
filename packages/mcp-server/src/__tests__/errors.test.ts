/**
 * @xats-org/mcp-server - Error Handling Tests
 */

import { describe, it, expect } from 'vitest';

import {
  McpError,
  ValidationError,
  SchemaValidationError,
  InputValidationError,
  DocumentError,
  DocumentNotFoundError,
  DocumentParseError,
  UnsupportedSchemaVersionError,
  ToolError,
  AnalysisError,
  TransformError,
  ExtractionError,
  CreationError,
  ServerError,
  ConfigurationError,
  TimeoutError,
  ResourceError,
  NetworkError,
  FileSystemError,
  createErrorResponse,
  validateToolInput,
  safeExecuteTool,
  getErrorHandlingStrategy,
  formatErrorForLogging,
  createCommonError,
  COMMON_ERRORS,
  ERROR_SEVERITY,
} from '../errors.js';

describe('Error Classes', () => {
  describe('McpError', () => {
    it('should create base error with all properties', () => {
      const error = new McpError('Test error', 'TEST_CODE', { detail: 'info' }, 'high');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ detail: 'info' });
      expect(error.severity).toBe('high');
      expect(error.timestamp).toBeDefined();
      expect(error.name).toBe('McpError');
    });

    it('should default to medium severity', () => {
      const error = new McpError('Test', 'CODE');
      expect(error.severity).toBe('medium');
    });

    it('should serialize to JSON properly', () => {
      const error = new McpError('Test error', 'TEST_CODE', { extra: 'data' });
      const json = error.toJSON();

      expect(json).toHaveProperty('name', 'McpError');
      expect(json).toHaveProperty('message', 'Test error');
      expect(json).toHaveProperty('code', 'TEST_CODE');
      expect(json).toHaveProperty('severity', 'medium');
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('details', { extra: 'data' });
      expect(json).toHaveProperty('stack');
    });
  });

  describe('ValidationError hierarchy', () => {
    it('should create ValidationError', () => {
      const error = new ValidationError('Validation failed', { field: 'test' });

      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
      expect(error.details).toEqual({ field: 'test' });
    });

    it('should create SchemaValidationError', () => {
      const schemaErrors = [{ path: 'title', message: 'Required' }];
      const error = new SchemaValidationError('Schema validation failed', schemaErrors);

      expect(error.name).toBe('SchemaValidationError');
      expect(error.details).toEqual({ schemaErrors });
    });

    it('should create InputValidationError', () => {
      const error = new InputValidationError('email', 'string', 123);

      expect(error.name).toBe('InputValidationError');
      expect(error.message).toContain("Invalid input for field 'email'");
      expect(error.details.field).toBe('email');
      expect(error.details.expected).toBe('string');
      expect(error.details.received).toBe(123);
    });
  });

  describe('DocumentError hierarchy', () => {
    it('should create DocumentError', () => {
      const error = new DocumentError('Document processing failed');
      expect(error.name).toBe('DocumentError');
      expect(error.code).toBe('DOCUMENT_ERROR');
    });

    it('should create DocumentNotFoundError', () => {
      const error = new DocumentNotFoundError('doc-123');
      expect(error.name).toBe('DocumentNotFoundError');
      expect(error.message).toContain('doc-123');
      expect(error.details.documentId).toBe('doc-123');
    });

    it('should create DocumentParseError', () => {
      const error = new DocumentParseError('Invalid JSON', { line: 5 });
      expect(error.name).toBe('DocumentParseError');
      expect(error.message).toContain('Invalid JSON');
      expect(error.severity).toBe('high');
    });

    it('should create UnsupportedSchemaVersionError', () => {
      const error = new UnsupportedSchemaVersionError('0.5.0', ['0.1.0', '0.2.0', '0.3.0']);
      expect(error.name).toBe('UnsupportedSchemaVersionError');
      expect(error.message).toContain('0.5.0');
      expect(error.message).toContain('0.1.0, 0.2.0, 0.3.0');
    });
  });

  describe('ToolError hierarchy', () => {
    it('should create ToolError', () => {
      const error = new ToolError('test_tool', 'Tool failed', 'TOOL_ERROR');
      expect(error.name).toBe('ToolError');
      expect(error.toolName).toBe('test_tool');
      expect(error.toJSON().toolName).toBe('test_tool');
    });

    it('should create AnalysisError', () => {
      const error = new AnalysisError('Analysis failed');
      expect(error.name).toBe('AnalysisError');
      expect(error.toolName).toBe('xats_analyze');
    });

    it('should create TransformError', () => {
      const error = new TransformError('Transform failed');
      expect(error.name).toBe('TransformError');
      expect(error.toolName).toBe('xats_transform');
    });

    it('should create ExtractionError', () => {
      const error = new ExtractionError('Extraction failed');
      expect(error.name).toBe('ExtractionError');
      expect(error.toolName).toBe('xats_extract');
    });

    it('should create CreationError', () => {
      const error = new CreationError('Creation failed');
      expect(error.name).toBe('CreationError');
      expect(error.toolName).toBe('xats_create');
    });
  });

  describe('ServerError hierarchy', () => {
    it('should create ServerError', () => {
      const error = new ServerError('Server failed');
      expect(error.name).toBe('ServerError');
      expect(error.severity).toBe('high');
    });

    it('should create ConfigurationError', () => {
      const error = new ConfigurationError('Invalid config', { key: 'value' });
      expect(error.name).toBe('ConfigurationError');
      expect(error.message).toContain('Invalid config');
    });

    it('should create TimeoutError', () => {
      const error = new TimeoutError('validation', 5000);
      expect(error.name).toBe('TimeoutError');
      expect(error.message).toContain('validation');
      expect(error.message).toContain('5000ms');
    });
  });

  describe('ResourceError hierarchy', () => {
    it('should create ResourceError', () => {
      const error = new ResourceError('Resource failed', 'database');
      expect(error.name).toBe('ResourceError');
      expect(error.details.resource).toBe('database');
    });

    it('should create NetworkError', () => {
      const error = new NetworkError('Connection failed', 'https://api.example.com');
      expect(error.name).toBe('NetworkError');
      expect(error.details.url).toBe('https://api.example.com');
    });

    it('should create FileSystemError', () => {
      const error = new FileSystemError('File not found', '/tmp/test.json', 'read');
      expect(error.name).toBe('FileSystemError');
      expect(error.details.path).toBe('/tmp/test.json');
      expect(error.details.operation).toBe('read');
    });
  });
});

describe('Utility Functions', () => {
  describe('createErrorResponse', () => {
    it('should create response from McpError', () => {
      const error = new McpError('Test error', 'TEST_CODE', { extra: 'data' }, 'high');
      const response = createErrorResponse(error, 'test_tool');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Test error');
      expect(response.metadata.toolName).toBe('test_tool');
      expect(response.metadata.errorCode).toBe('TEST_CODE');
      expect(response.metadata.severity).toBe('high');
    });

    it('should create response from regular Error', () => {
      const error = new Error('Regular error');
      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Regular error');
      expect(response.metadata.errorCode).toBe('UNKNOWN_ERROR');
      expect(response.metadata.errorType).toBe('McpError');
    });
  });

  describe('validateToolInput', () => {
    it('should pass valid input', () => {
      const input = { document: {}, schemaVersion: '0.3.0' };
      expect(() => validateToolInput(input, ['document'], 'test_tool')).not.toThrow();
    });

    it('should reject null input', () => {
      expect(() => validateToolInput(null, ['document'], 'test_tool')).toThrow(
        InputValidationError
      );
    });

    it('should reject non-object input', () => {
      expect(() => validateToolInput('string', ['document'], 'test_tool')).toThrow(
        InputValidationError
      );
    });

    it('should reject missing required fields', () => {
      const input = { schemaVersion: '0.3.0' };
      expect(() => validateToolInput(input, ['document'], 'test_tool')).toThrow(
        InputValidationError
      );
    });

    it('should reject null required fields', () => {
      const input = { document: null };
      expect(() => validateToolInput(input, ['document'], 'test_tool')).toThrow(
        InputValidationError
      );
    });
  });

  describe('safeExecuteTool', () => {
    const mockConfig = {
      name: 'test-server',
      version: '1.0.0',
      description: 'Test',
      logging: { enabled: false },
    };

    it('should execute tool successfully', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await safeExecuteTool('test_tool', operation, mockConfig);
      expect(result).toBe('success');
    });

    it('should re-throw McpError', async () => {
      const error = new McpError('Test error', 'TEST_CODE');
      const operation = vi.fn().mockRejectedValue(error);

      await expect(safeExecuteTool('test_tool', operation, mockConfig)).rejects.toThrow(McpError);
    });

    it('should wrap regular errors in ToolError', async () => {
      const error = new Error('Regular error');
      const operation = vi.fn().mockRejectedValue(error);

      await expect(safeExecuteTool('test_tool', operation, mockConfig)).rejects.toThrow(ToolError);
    });
  });

  describe('getErrorHandlingStrategy', () => {
    it('should return strategy for each severity level', () => {
      const lowStrategy = getErrorHandlingStrategy('low');
      expect(lowStrategy.level).toBe(0);
      expect(lowStrategy.action).toContain('continue');

      const criticalStrategy = getErrorHandlingStrategy('critical');
      expect(criticalStrategy.level).toBe(3);
      expect(criticalStrategy.action).toContain('stop operation');
    });
  });

  describe('formatErrorForLogging', () => {
    it('should format McpError for logging', () => {
      const error = new McpError('Test error', 'TEST_CODE');
      const formatted = formatErrorForLogging(error, { toolName: 'test' });
      const parsed = JSON.parse(formatted);

      expect(parsed.timestamp).toBeDefined();
      expect(parsed.context.toolName).toBe('test');
      expect(parsed.error.name).toBe('McpError');
      expect(parsed.error.code).toBe('TEST_CODE');
    });

    it('should format regular Error for logging', () => {
      const error = new Error('Regular error');
      const formatted = formatErrorForLogging(error);
      const parsed = JSON.parse(formatted);

      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('Regular error');
    });
  });

  describe('createCommonError', () => {
    it('should create error with common pattern', () => {
      const error = createCommonError('MISSING_DOCUMENT', { extra: 'data' }, 'high');

      expect(error.message).toBe(COMMON_ERRORS.MISSING_DOCUMENT);
      expect(error.code).toBe('MISSING_DOCUMENT');
      expect(error.details).toEqual({ extra: 'data' });
      expect(error.severity).toBe('high');
    });
  });
});

describe('Constants', () => {
  describe('ERROR_SEVERITY', () => {
    it('should define all severity levels', () => {
      expect(ERROR_SEVERITY.low).toBeDefined();
      expect(ERROR_SEVERITY.medium).toBeDefined();
      expect(ERROR_SEVERITY.high).toBeDefined();
      expect(ERROR_SEVERITY.critical).toBeDefined();

      expect(ERROR_SEVERITY.low.level).toBe(0);
      expect(ERROR_SEVERITY.critical.level).toBe(3);
    });
  });

  describe('COMMON_ERRORS', () => {
    it('should define common error messages', () => {
      expect(COMMON_ERRORS.MISSING_DOCUMENT).toBeDefined();
      expect(COMMON_ERRORS.VALIDATION_FAILED).toBeDefined();
      expect(COMMON_ERRORS.PARSING_FAILED).toBeDefined();

      // Should be strings
      Object.values(COMMON_ERRORS).forEach((message) => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });
});
