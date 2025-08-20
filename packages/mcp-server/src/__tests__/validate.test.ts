/**
 * @xats/mcp-server - Validate Tool Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { validateTool, validateToolSync, validateBatchTool, getValidationSummary } from '../tools/validate.js';
import type { ValidateInput, McpServerConfig } from '../types.js';

// Mock validator
vi.mock('@xats/validator', () => ({
  createValidator: vi.fn(() => ({
    validate: vi.fn(),
    validateSync: vi.fn(),
  })),
}));

describe('validateTool', () => {
  const mockConfig: McpServerConfig = {
    name: 'test-server',
    version: '0.4.0',
    description: 'Test server',
    defaultSchemaVersion: '0.3.0',
    validation: {
      strict: true,
      allErrors: true,
    },
  };

  const validDocument = {
    schemaVersion: '0.3.0',
    id: 'test-doc',
    bibliographicEntry: {
      type: 'book',
      title: 'Test Document',
    },
    subject: 'Test',
    bodyMatter: {
      id: 'body',
      contents: [],
    },
  };

  describe('validateTool', () => {
    it('should validate a valid document', async () => {
      const { createValidator } = await import('@xats/validator');
      const mockValidator = {
        validate: vi.fn().mockResolvedValue({
          isValid: true,
          errors: [],
          schemaVersion: '0.3.0',
        }),
      };
      (createValidator as any).mockReturnValue(mockValidator);

      const input: ValidateInput = {
        document: validDocument,
        strict: true,
      };

      const result = await validateTool(input, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data?.isValid).toBe(true);
      expect(result.data?.errors).toEqual([]);
      expect(result.metadata?.toolName).toBe('xats_validate');
      expect(result.metadata?.schemaVersion).toBe('0.3.0');
    });

    it('should handle validation errors', async () => {
      const { createValidator } = await import('@xats/validator');
      const mockValidator = {
        validate: vi.fn().mockResolvedValue({
          isValid: false,
          errors: [
            {
              path: 'title',
              message: 'Missing required field',
              keyword: 'required',
            },
          ],
          schemaVersion: '0.3.0',
        }),
      };
      (createValidator as any).mockReturnValue(mockValidator);

      const input: ValidateInput = {
        document: { invalid: 'document' },
      };

      const result = await validateTool(input, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data?.isValid).toBe(false);
      expect(result.data?.errors).toHaveLength(1);
      expect(result.data?.errors?.[0]?.message).toBe('Missing required field');
    });

    it('should handle missing document', async () => {
      const input: ValidateInput = {
        document: undefined as any,
      };

      const result = await validateTool(input, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Document is required');
    });

    it('should handle validator exceptions', async () => {
      const { createValidator } = await import('@xats/validator');
      const mockValidator = {
        validate: vi.fn().mockRejectedValue(new Error('Schema compilation failed')),
      };
      (createValidator as any).mockReturnValue(mockValidator);

      const input: ValidateInput = {
        document: validDocument,
      };

      const result = await validateTool(input, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Schema compilation failed');
    });
  });

  describe('validateToolSync', () => {
    it('should validate synchronously', async () => {
      const { createValidator } = await import('@xats/validator');
      const mockValidator = {
        validateSync: vi.fn().mockReturnValue({
          isValid: true,
          errors: [],
          schemaVersion: '0.3.0',
        }),
      };
      (createValidator as any).mockReturnValue(mockValidator);

      const input: ValidateInput = {
        document: validDocument,
      };

      const result = validateToolSync(input, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data?.isValid).toBe(true);
      expect(result.metadata?.toolName).toBe('xats_validate_sync');
    });
  });

  describe('validateBatchTool', () => {
    it('should validate multiple documents', async () => {
      const { createValidator } = await import('@xats/validator');
      const mockValidator = {
        validate: vi.fn()
          .mockResolvedValueOnce({
            isValid: true,
            errors: [],
            schemaVersion: '0.3.0',
          })
          .mockResolvedValueOnce({
            isValid: false,
            errors: [{ path: 'test', message: 'Error' }],
            schemaVersion: '0.3.0',
          }),
      };
      (createValidator as any).mockReturnValue(mockValidator);

      const inputs: ValidateInput[] = [
        { document: validDocument },
        { document: { invalid: 'doc' } },
      ];

      const results = await validateBatchTool(inputs, mockConfig);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].data?.isValid).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[1].data?.isValid).toBe(false);
    });
  });

  describe('getValidationSummary', () => {
    it('should summarize validation results', () => {
      const results = [
        {
          success: true,
          data: { isValid: true, errors: [] },
        },
        {
          success: true,
          data: {
            isValid: false,
            errors: [
              { keyword: 'required', message: 'Missing field' },
              { keyword: 'type', message: 'Wrong type' },
            ],
          },
        },
        {
          success: true,
          data: {
            isValid: false,
            errors: [
              { keyword: 'required', message: 'Another missing field' },
            ],
          },
        },
      ];

      const summary = getValidationSummary(results as any);

      expect(summary.total).toBe(3);
      expect(summary.valid).toBe(1);
      expect(summary.invalid).toBe(2);
      expect(summary.errorSummary.required).toBe(2);
      expect(summary.errorSummary.type).toBe(1);
    });
  });
});