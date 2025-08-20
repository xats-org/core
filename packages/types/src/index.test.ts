import { describe, it, expect } from 'vitest';
import type { XatsDocument, XatsVersion } from './index';

describe('@xats/types', () => {
  describe('XatsVersion', () => {
    it('should accept valid version string', () => {
      const version: XatsVersion = '0.1.0';
      expect(version).toBe('0.1.0');
    });
  });

  describe('XatsDocument', () => {
    it('should have required properties', () => {
      const doc: XatsDocument = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {},
        subject: {},
        bodyMatter: {},
      };

      expect(doc).toHaveProperty('schemaVersion');
      expect(doc).toHaveProperty('bibliographicEntry');
      expect(doc).toHaveProperty('subject');
      expect(doc).toHaveProperty('bodyMatter');
    });

    it('should allow optional properties', () => {
      const doc: XatsDocument = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {},
        subject: {},
        bodyMatter: {},
        frontMatter: {},
        backMatter: {},
      };

      expect(doc).toHaveProperty('frontMatter');
      expect(doc).toHaveProperty('backMatter');
    });
  });
});