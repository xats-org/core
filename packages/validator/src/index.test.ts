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
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: []
            }
          ],
        },
      };

      const result = validator.validateSync(doc);
      if (!result.isValid) {
        console.log('Validation errors:', JSON.stringify(result.errors, null, 2));
      }
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject document with missing required fields', () => {
      const doc = {
        schemaVersion: '0.1.0',
        // Missing required fields
      };

      const result = validator.validateSync(doc);
      expect(result.isValid).toBe(false);
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
        subject: 'Test Subject',
        bodyMatter: {
          contents: [],
        },
      };

      const result = validator.validateSync(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('999.999.999');
    });
  });

  // getSchema method not exposed in current implementation
});
