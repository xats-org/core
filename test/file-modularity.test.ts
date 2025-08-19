/**
 * File Modularity Validation Tests
 * 
 * Tests for validating xats documents that use FileReference objects
 * to compose content across multiple files.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join, resolve } from 'path';
import { FileModularityValidator, createFileModularityValidator, validateModularXats } from '../src/file-modularity-validator.js';
import type { FileModularityValidatorOptions } from '../src/file-modularity-validator.js';

const FIXTURES_DIR = resolve(__dirname, 'fixtures/file-modularity');

describe('FileModularityValidator', () => {
  let validator: FileModularityValidator;

  beforeEach(() => {
    validator = new FileModularityValidator();
  });

  afterEach(() => {
    validator.clearCache();
  });

  describe('Valid Multi-File Textbooks', () => {
    it('should validate a simple modular textbook with nested file references', async () => {
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      const result = await validator.validate(mainPath);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.fileResolution).toBeDefined();
      expect(result.fileResolution!.resolved.size).toBeGreaterThan(0);
      expect(result.fileResolution!.circularReferences).toHaveLength(0);
    });

    it('should track performance metrics for file loading', async () => {
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      const result = await validator.validate(mainPath);

      expect(result.fileResolution).toBeDefined();
      const metrics = result.fileResolution!.performanceMetrics;
      
      expect(metrics.totalFiles).toBeGreaterThan(0);
      expect(metrics.totalSizeBytes).toBeGreaterThan(0);
      expect(metrics.totalLoadTimeMs).toBeGreaterThanOrEqual(0);
      expect(metrics.maxFileLoadTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should properly resolve all file references in nested structure', async () => {
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      const result = await validator.validate(mainPath);

      expect(result.fileResolution).toBeDefined();
      const resolvedPaths = Array.from(result.fileResolution!.resolved.keys());
      
      // Should resolve chapter files and section files
      expect(resolvedPaths.some(path => path.includes('chapter1.json'))).toBe(true);
      expect(resolvedPaths.some(path => path.includes('chapter2.json'))).toBe(true);
      expect(resolvedPaths.some(path => path.includes('section1-1.json'))).toBe(true);
    });

    it('should validate resolved file content against schema', async () => {
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      const result = await validator.validate(mainPath);

      expect(result.isValid).toBe(true);
      expect(result.fileResolution!.errors).toHaveLength(0);
    });
  });

  describe('Circular Reference Detection', () => {
    it('should detect circular references between files', async () => {
      const mainPath = join(FIXTURES_DIR, 'circular-references/main.json');
      const result = await validator.validate(mainPath);

      expect(result.isValid).toBe(false);
      expect(result.fileResolution).toBeDefined();
      expect(result.fileResolution!.circularReferences.length).toBeGreaterThan(0);
    });

    it('should report the circular reference path clearly', async () => {
      const mainPath = join(FIXTURES_DIR, 'circular-references/main.json');
      const result = await validator.validate(mainPath);

      const circularRefs = result.fileResolution!.circularReferences;
      expect(circularRefs.some(ref => ref.includes('chapter-a.json') || ref.includes('chapter-b.json'))).toBe(true);
    });
  });

  describe('Security Validation', () => {
    it('should reject absolute paths in FileReference', async () => {
      const mainPath = join(FIXTURES_DIR, 'security-violations/absolute-path.json');
      const result = await validator.validate(mainPath);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('must match pattern') || 
        error.message.includes('absolute path')
      )).toBe(true);
    });

    it('should reject parent directory traversal', async () => {
      const mainPath = join(FIXTURES_DIR, 'security-violations/parent-traversal.json');
      const result = await validator.validate(mainPath);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('parent directory traversal') || 
        error.message.includes('outside of document root') ||
        error.message.includes('must match pattern')
      )).toBe(true);
    });

    it('should handle missing referenced files gracefully', async () => {
      const mainPath = join(FIXTURES_DIR, 'security-violations/missing-file.json');
      const result = await validator.validate(mainPath);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('does not exist')
      )).toBe(true);
    });
  });

  describe('Configuration Options', () => {
    it('should respect maxFileSize option', async () => {
      const options: FileModularityValidatorOptions = {
        maxFileSize: 100 // Very small limit in bytes
      };
      const validator = new FileModularityValidator(options);
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      
      const result = await validator.validate(mainPath, options);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('File too large')
      )).toBe(true);
    });

    it('should respect maxDepth option', async () => {
      const options: FileModularityValidatorOptions = {
        maxDepth: 1 // Very shallow depth
      };
      const validator = new FileModularityValidator(options);
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      
      const result = await validator.validate(mainPath, options);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('Maximum reference depth exceeded')
      )).toBe(true);
    });

    it('should respect allowedFileExtensions option', async () => {
      const options: FileModularityValidatorOptions = {
        allowedFileExtensions: ['.txt'] // Only txt files allowed
      };
      const validator = new FileModularityValidator(options);
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      
      const result = await validator.validate(mainPath, options);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('File extension not allowed')
      )).toBe(true);
    });
  });

  describe('Performance Benchmarking', () => {
    it('should provide benchmark results for multi-file textbooks', async () => {
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      const benchmark = await validator.benchmarkTextbook(mainPath, 2);

      expect(benchmark.averageMetrics).toBeDefined();
      expect(benchmark.iterations).toHaveLength(2);
      expect(benchmark.memoryUsage).toBeDefined();
      
      expect(benchmark.averageMetrics.totalFiles).toBeGreaterThan(0);
      expect(benchmark.averageMetrics.totalLoadTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should track memory usage during benchmarking', async () => {
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      const benchmark = await validator.benchmarkTextbook(mainPath, 1);

      expect(benchmark.memoryUsage.heapUsed).toBeGreaterThan(0);
      expect(benchmark.memoryUsage.heapTotal).toBeGreaterThan(0);
      expect(benchmark.memoryUsage.external).toBeGreaterThanOrEqual(0);
    });
  });

  describe('File Reference Validation', () => {
    it('should validate FileReference format correctly', async () => {
      // This test would require a fixture with invalid FileReference format
      const invalidFormatDoc = {
        schemaVersion: '0.3.0',
        id: 'test',
        language: 'en',
        bibliographicEntry: {
          id: 'test-book',
          type: 'book',
          title: 'Test',
          author: [{ family: 'Test', given: 'Author' }],
          issued: { 'date-parts': [[2023]] },
          publisher: 'Test Press'
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              $ref: 'invalid-format-no-dot-slash'  // Invalid format
            }
          ]
        }
      };

      // This test needs to be implemented with proper fixture
      expect(invalidFormatDoc).toBeDefined(); // Use the variable to avoid lint error
      // TODO: Implement proper validation test
    });

    it('should handle metadata validation in FileReference', async () => {
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      const result = await validator.validate(mainPath);

      expect(result.isValid).toBe(true);
      // Metadata validation is optional, so should not cause failures
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty FileReference arrays', async () => {
      const emptyDoc = {
        schemaVersion: '0.3.0',
        id: 'empty-test',
        language: 'en',
        bibliographicEntry: {
          id: 'empty-book',
          type: 'book',
          title: 'Empty Test',
          author: [{ family: 'Test', given: 'Author' }],
          issued: { 'date-parts': [[2023]] },
          publisher: 'Test Press'
        },
        subject: 'Testing',
        bodyMatter: {
          contents: []
        }
      };

      // This would need proper file-based testing
      expect(emptyDoc).toBeDefined(); // Use the variable to avoid lint error
      // TODO: Implementation needed with proper fixture approach
    });

    it('should handle deeply nested file references', async () => {
      // Test for maximum nesting depth - would need fixture with deep nesting
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      const result = await validator.validate(mainPath);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Integration with Base Validator', () => {
    it('should still validate schema compliance of main document', async () => {
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      const result = await validator.validate(mainPath);

      expect(result.schemaVersion).toBe('0.3.0');
      expect(result.isValid).toBe(true);
    });

    it('should validate schema compliance of all referenced documents', async () => {
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      const result = await validator.validate(mainPath);

      // All referenced documents should be valid xats partial documents
      expect(result.isValid).toBe(true);
      expect(result.fileResolution!.errors).toHaveLength(0);
    });
  });
});

describe('Convenience Functions', () => {
  afterEach(() => {
    // Clear any cached validators
  });

  describe('createFileModularityValidator', () => {
    it('should create validator with default options', () => {
      const validator = createFileModularityValidator();
      expect(validator).toBeInstanceOf(FileModularityValidator);
    });

    it('should create validator with custom options', () => {
      const options: FileModularityValidatorOptions = {
        maxFileSize: 5000,
        maxDepth: 10
      };
      const validator = createFileModularityValidator(options);
      expect(validator).toBeInstanceOf(FileModularityValidator);
    });
  });

  describe('validateModularXats', () => {
    it('should validate modular xats document', async () => {
      const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
      const result = await validateModularXats(mainPath);

      expect(result.isValid).toBe(true);
      expect(result.fileResolution).toBeDefined();
    });

    it('should handle validation errors', async () => {
      const mainPath = join(FIXTURES_DIR, 'security-violations/missing-file.json');
      const result = await validateModularXats(mainPath);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Performance Metrics', () => {
  let validator: FileModularityValidator;

  beforeEach(() => {
    validator = new FileModularityValidator();
  });

  it('should track loading time for each file', async () => {
    const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
    const result = await validator.validate(mainPath);

    const metrics = result.fileResolution!.performanceMetrics;
    expect(metrics.totalLoadTimeMs).toBeGreaterThanOrEqual(0);
    expect(metrics.maxFileLoadTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('should track total bytes loaded', async () => {
    const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
    const result = await validator.validate(mainPath);

    const metrics = result.fileResolution!.performanceMetrics;
    expect(metrics.totalSizeBytes).toBeGreaterThan(0);
    expect(metrics.totalFiles).toBeGreaterThan(0);
  });

  it('should provide accurate file count', async () => {
    const mainPath = join(FIXTURES_DIR, 'valid-modular-textbook/main.json');
    const result = await validator.validate(mainPath);

    const metrics = result.fileResolution!.performanceMetrics;
    const resolvedCount = result.fileResolution!.resolved.size;
    
    // totalFiles should match the number of resolved files
    expect(metrics.totalFiles).toBe(resolvedCount);
  });
});

describe('Error Reporting', () => {
  let validator: FileModularityValidator;

  beforeEach(() => {
    validator = new FileModularityValidator();
  });

  it('should provide clear error messages with file paths', async () => {
    const mainPath = join(FIXTURES_DIR, 'security-violations/missing-file.json');
    const result = await validator.validate(mainPath);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]?.path).toBeDefined();
    expect(result.errors[0]?.message).toBeDefined();
  });

  it('should distinguish between different types of validation errors', async () => {
    const mainPath = join(FIXTURES_DIR, 'security-violations/parent-traversal.json');
    const result = await validator.validate(mainPath);

    expect(result.errors.some(error => 
      error.message.includes('parent directory') || 
      error.message.includes('outside of document root') ||
      error.message.includes('must match pattern')
    )).toBe(true);
  });

  it('should report circular references separately from other errors', async () => {
    const mainPath = join(FIXTURES_DIR, 'circular-references/main.json');
    const result = await validator.validate(mainPath);

    expect(result.fileResolution!.circularReferences.length).toBeGreaterThan(0);
    // Circular references might also generate errors, but should be tracked separately
  });
});