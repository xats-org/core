import { describe, it, expect } from 'vitest';
import { loadSchema, getSchemaVersion, validateAgainstSchema } from './index';

describe('@xats/schema', () => {
  describe('loadSchema', () => {
    it('should load schema for version 0.1.0', () => {
      const schema = loadSchema('0.1.0');
      expect(schema).toBeDefined();
      expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
      expect(schema.$id).toBe('https://xats.org/schemas/0.1.0/xats.json');
    });

    it('should return null for unsupported version', () => {
      const schema = loadSchema('999.999.999');
      expect(schema).toBeNull();
    });
  });

  describe('getSchemaVersion', () => {
    it('should extract version from valid schema ID', () => {
      const version = getSchemaVersion('https://xats.org/schemas/0.1.0/xats.json');
      expect(version).toBe('0.1.0');
    });

    it('should return null for invalid schema ID', () => {
      const version = getSchemaVersion('https://example.com/schema.json');
      expect(version).toBeNull();
    });
  });

  describe('validateAgainstSchema', () => {
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

      const result = validateAgainstSchema(doc, '0.1.0');
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should invalidate document with missing required fields', () => {
      const doc = {
        schemaVersion: '0.1.0',
      };

      const result = validateAgainstSchema(doc, '0.1.0');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle unsupported schema version', () => {
      const doc = {
        schemaVersion: '999.999.999',
      };

      const result = validateAgainstSchema(doc, '999.999.999');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Schema version 999.999.999 not found');
    });
  });
});