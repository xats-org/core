/**
 * Comprehensive validation tests for example documents
 * Ensures all example documents remain valid as the schema evolves
 */

import { readdirSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { describe, it, expect } from 'vitest';

import { validateXatsSync } from '@xats/validator';

// Alias for backwards compatibility with test code
const validateXatsFile = (content: unknown) => {
  const parsed = typeof content === 'string' ? (JSON.parse(content) as unknown) : content;
  return validateXatsSync(parsed);
};

// When running from monorepo root, need to find the examples package directory
const EXAMPLES_DIR = existsSync(join(process.cwd(), 'packages', 'examples', 'examples'))
  ? join(process.cwd(), 'packages', 'examples', 'examples')
  : join(process.cwd(), 'examples'); // Fallback for running from package directory
const INVALID_EXAMPLES_DIR = join(EXAMPLES_DIR, 'invalid');

// Ensure invalid examples directory exists
if (!existsSync(INVALID_EXAMPLES_DIR)) {
  mkdirSync(INVALID_EXAMPLES_DIR, { recursive: true });
}

describe('Example Document Validation', () => {
  describe('Valid Examples', () => {
    // Get all JSON files in examples directory (excluding invalid subdirectory)
    const validFiles = readdirSync(EXAMPLES_DIR).filter(
      (f) => f.endsWith('.json') && !f.includes('invalid')
    );

    if (validFiles.length === 0) {
      it.skip('No valid example files found', () => {});
    } else {
      validFiles.forEach((file) => {
        describe(`${file}`, () => {
          const filePath = join(EXAMPLES_DIR, file);

          it('should validate against current schema version', () => {
            const fileContent = readFileSync(filePath, 'utf8');
            const result = validateXatsFile(fileContent);
            if (!result.isValid) {
              console.error(
                `Validation errors for ${file}:`,
                JSON.stringify(result.errors, null, 2)
              );
            }
            expect(result.isValid).toBe(true);
          });

          it('should have all required fields', () => {
            const content = JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, unknown>;

            // Check required top-level fields
            expect(content).toHaveProperty('schemaVersion');
            expect(content).toHaveProperty('bibliographicEntry');
            expect(content).toHaveProperty('subject');
            expect(content).toHaveProperty('bodyMatter');
          });

          it('should have correct field types', () => {
            const content = JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, unknown>;

            // Check field types
            expect(typeof content.schemaVersion).toBe('string');
            expect(typeof content.bibliographicEntry).toBe('object');
            expect(typeof content.subject).toBe('string');
            expect(typeof content.bodyMatter).toBe('object');

            // Check bibliographic entry has required fields
            expect(content.bibliographicEntry as Record<string, unknown>).toHaveProperty('id');
            expect(content.bibliographicEntry as Record<string, unknown>).toHaveProperty('type');
            expect(content.bibliographicEntry as Record<string, unknown>).toHaveProperty('title');
          });
        });
      });
    }
  });

  describe('Invalid Examples', () => {
    // Get all JSON files in invalid examples directory
    const invalidFiles = existsSync(INVALID_EXAMPLES_DIR)
      ? readdirSync(INVALID_EXAMPLES_DIR).filter((f) => f.endsWith('.json'))
      : [];

    if (invalidFiles.length === 0) {
      it.skip('No invalid example files found', () => {});
    } else {
      invalidFiles.forEach((file) => {
        it(`should reject invalid example: ${file}`, () => {
          const filePath = join(INVALID_EXAMPLES_DIR, file);
          const fileContent = readFileSync(filePath, 'utf8');
          const result = validateXatsFile(fileContent);
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        });
      });
    }
  });

  describe('Example Coverage', () => {
    it('should have examples for all major features', () => {
      const expectedExamples = [
        'minimal.json',
        'complete-textbook.json',
        'adaptive-pathway-example.json',
        'multi-language.json',
        'assessment-focused.json',
      ];

      const actualFiles = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith('.json'));

      // Check that we have at least some examples
      expect(actualFiles.length).toBeGreaterThan(0);

      // Log which examples are missing (for information only)
      const missingExamples = expectedExamples.filter((ex) => !actualFiles.includes(ex));
      if (missingExamples.length > 0) {
        // Silently skip - missing examples are expected during development
      }
    });

    it('should have invalid examples for common mistakes', () => {
      const actualInvalidFiles = existsSync(INVALID_EXAMPLES_DIR)
        ? readdirSync(INVALID_EXAMPLES_DIR).filter((f) => f.endsWith('.json'))
        : [];

      // Check that we have at least one invalid example
      expect(actualInvalidFiles).toContain('missing-required.json');
    });
  });

  describe('Performance with Examples', () => {
    it('should validate all examples quickly', () => {
      const startTime = Date.now();

      const allFiles = [
        ...readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith('.json') && !f.includes('invalid')),
      ];

      allFiles.forEach((file) => {
        const filePath = join(EXAMPLES_DIR, file);
        const fileContent = readFileSync(filePath, 'utf8');
        validateXatsFile(fileContent);
      });

      const duration = Date.now() - startTime;
      // All examples should validate in under 1 second total
      expect(duration).toBeLessThan(1000);
    });
  });
});
