import { describe, it, expect, beforeAll } from 'vitest';
import { XatsValidator } from './index';

describe('XatsValidator', () => {
  let validator: XatsValidator;

  beforeAll(() => {
    validator = new XatsValidator();
  });

  describe('validate', () => {
    it('should validate a minimal valid document', () => {
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

      const result = validator.validate(doc);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject document with missing required fields', () => {
      const doc = {
        schemaVersion: '0.1.0',
        // Missing required fields
      };

      const result = validator.validate(doc);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject document with invalid schema version', () => {
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

      const result = validator.validate(doc);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unsupported schema version: 999.999.999');
    });
  });

  describe('getSchema', () => {
    it('should return schema for supported version', () => {
      const schema = validator.getSchema('0.1.0');
      expect(schema).toBeDefined();
      expect(schema?.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    });

    it('should return undefined for unsupported version', () => {
      const schema = validator.getSchema('999.999.999');
      expect(schema).toBeUndefined();
    });
  });
});