import { describe, it, expect, beforeAll } from 'vitest';

import { XatsValidator } from './index';

describe('XatsValidator', () => {
  let validator: XatsValidator;

  beforeAll(() => {
    validator = new XatsValidator();
  });

  describe('validate', () => {
    it('should validate a minimal valid document', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-doc',
          title: 'Test Document',
          type: 'book',
        },
        subject: {
          uri: 'https://xats.org/subjects/test',
        },
        bodyMatter: {
          contents: [],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject document with missing required fields', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        // Missing required fields
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject document with invalid schema version', async () => {
      const doc = {
        schemaVersion: '999.999.999',
        bibliographicEntry: {
          id: 'test-doc',
          title: 'Test Document',
          type: 'book',
        },
        subject: {
          uri: 'https://xats.org/subjects/test',
        },
        bodyMatter: {
          contents: [],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('999.999.999');
    });
  });

  // getSchema method not exposed in current implementation
});
