/**
 * Tests for the xats validator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { resolve } from 'path';
import { 
  XatsValidator, 
  createValidator, 
  validateXats, 
  validateXatsFile
} from '../dist/validator.js';

describe('XatsValidator', () => {
  let validator: XatsValidator;

  beforeEach(() => {
    validator = new XatsValidator();
  });

  describe('constructor', () => {
    it('should create validator with default options', () => {
      expect(validator).toBeInstanceOf(XatsValidator);
    });

    it('should create validator with custom options', () => {
      const customValidator = new XatsValidator({
        strict: false,
        allErrors: false,
        schemaVersion: '0.1.0'
      });
      expect(customValidator).toBeInstanceOf(XatsValidator);
    });
  });

  describe('validate', () => {
    it('should validate a valid minimal document', async () => {
      const validDoc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-001',
          type: 'book',
          title: 'Test Book',
          author: [{ family: 'Smith', given: 'John' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              label: '1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  label: '1.1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/core/blocks/paragraph',
                      content: {
                        text: {
                          runs: [{ type: 'text', text: 'Test content' }]
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      };

      const result = await validator.validate(validDoc);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.schemaVersion).toBe('0.1.0');
    });

    it('should reject document missing required fields', async () => {
      const invalidDoc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-002',
          type: 'book',
          title: 'Test Book'
        }
        // Missing subject and bodyMatter
      };

      const result = await validator.validate(invalidDoc);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const errorMessages = result.errors.map((e: any) => e.message);
      expect(errorMessages.some((msg: any) => msg.includes('subject'))).toBe(true);
      expect(errorMessages.some((msg: any) => msg.includes('bodyMatter'))).toBe(true);
    });

    it('should reject document with invalid schema version', async () => {
      const invalidDoc = {
        schemaVersion: '999.0.0',
        bibliographicEntry: {
          id: 'test-003',
          type: 'book',
          title: 'Test Book',
          author: [{ family: 'Smith', given: 'John' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Test Subject',
        bodyMatter: { contents: [] }
      };

      const result = await validator.validate(invalidDoc);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => 
        e.message.includes('Failed to load schema version 999.0.0') ||
        e.message.includes('no such file')
      )).toBe(true);
    });

    it('should handle null and undefined input', async () => {
      const nullResult = await validator.validate(null);
      expect(nullResult.isValid).toBe(false);

      const undefinedResult = await validator.validate(undefined);
      expect(undefinedResult.isValid).toBe(false);
    });

    it('should handle non-object input', async () => {
      const stringResult = await validator.validate('not an object');
      expect(stringResult.isValid).toBe(false);

      const numberResult = await validator.validate(42);
      expect(numberResult.isValid).toBe(false);

      const arrayResult = await validator.validate([]);
      expect(arrayResult.isValid).toBe(false);
    });
  });

  describe('validateFile', () => {
    const fixturesDir = resolve(process.cwd(), 'test/fixtures');

    it('should validate a valid file', async () => {
      const filePath = resolve(fixturesDir, 'valid-minimal.json');
      const result = await validator.validateFile(filePath);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle file with validation errors', async () => {
      const filePath = resolve(fixturesDir, 'invalid-missing-required.json');
      const result = await validator.validateFile(filePath);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle invalid JSON file', async () => {
      const filePath = resolve(fixturesDir, 'invalid-json.json');
      const result = await validator.validateFile(filePath);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => 
        e.message.includes('parse') || e.message.includes('JSON')
      )).toBe(true);
    });

    it('should handle non-existent file', async () => {
      const filePath = resolve(fixturesDir, 'non-existent.json');
      const result = await validator.validateFile(filePath);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => 
        e.message.includes('ENOENT') || e.message.includes('no such file')
      )).toBe(true);
    });
  });

  describe('getAvailableVersions', () => {
    it('should return available schema versions', () => {
      const versions = validator.getAvailableVersions();
      expect(versions).toContain('0.1.0');
      expect(Array.isArray(versions)).toBe(true);
    });
  });
});

describe('createValidator', () => {
  it('should create a new validator instance', () => {
    const validator = createValidator();
    expect(validator).toBeInstanceOf(XatsValidator);
  });

  it('should pass options to validator', () => {
    const validator = createValidator({ strict: false });
    expect(validator).toBeInstanceOf(XatsValidator);
  });
});

describe('validateXats', () => {
  it('should validate document using convenience function', async () => {
    const validDoc = {
      schemaVersion: '0.1.0',
      bibliographicEntry: {
        id: 'test-func',
        type: 'book',
        title: 'Function Test',
        author: [{ family: 'Function', given: 'Test' }],
        issued: { 'date-parts': [[2024]] }
      },
      subject: 'Testing',
      bodyMatter: {
        contents: [
          {
            id: 'chapter-func',
            label: '1',
            title: 'Test',
            sections: [
              {
                id: 'section-func',
                label: '1.1',
                title: 'Test',
                content: [
                  {
                    id: 'block-func',
                    blockType: 'https://xats.org/core/blocks/paragraph',
                    content: {
                      text: { runs: [{ type: 'text', text: 'Test' }] }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    };

    const result = await validateXats(validDoc);
    expect(result.isValid).toBe(true);
  });
});

describe('validateXatsFile', () => {
  it('should validate file using convenience function', async () => {
    const filePath = resolve(process.cwd(), 'test/fixtures/valid-minimal.json');
    const result = await validateXatsFile(filePath);
    expect(result.isValid).toBe(true);
  });
});

describe('Error handling', () => {
  it('should provide detailed error information', async () => {
    const invalidDoc = {
      schemaVersion: '0.1.0',
      // Missing all required fields
    };

    const result = await validateXats(invalidDoc);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    
    result.errors.forEach((error: any) => {
      expect(error).toHaveProperty('path');
      expect(error).toHaveProperty('message');
      expect(typeof error.path).toBe('string');
      expect(typeof error.message).toBe('string');
    });
  });

  it('should handle schema loading errors gracefully', async () => {
    const validator = new XatsValidator();
    
    // Try to validate with a non-existent schema version
    const result = await validator.validate({}, { schemaVersion: 'non-existent' });
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e: any) => 
      e.message.includes('Failed to load schema')
    )).toBe(true);
  });
});

describe('Performance', () => {
  it('should validate multiple documents efficiently', async () => {
    const validator = createValidator();
    const validDoc = {
      schemaVersion: '0.1.0',
      bibliographicEntry: {
        id: 'perf-test',
        type: 'book',
        title: 'Performance Test',
        author: [{ family: 'Perf', given: 'Test' }],
        issued: { 'date-parts': [[2024]] }
      },
      subject: 'Performance',
      bodyMatter: {
        contents: [
          {
            id: 'chapter-perf',
            label: '1',
            title: 'Performance',
            sections: [
              {
                id: 'section-perf',
                label: '1.1',
                title: 'Test',
                content: [
                  {
                    id: 'block-perf',
                    blockType: 'https://xats.org/core/blocks/paragraph',
                    content: {
                      text: { runs: [{ type: 'text', text: 'Performance test content' }] }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    };

    const startTime = Date.now();
    
    // Validate the same document multiple times
    const promises = Array(10).fill(null).map(() => validator.validate(validDoc));
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // All validations should succeed
    results.forEach((result: any) => {
      expect(result.isValid).toBe(true);
    });
    
    // Should complete relatively quickly (adjust threshold as needed)
    expect(totalTime).toBeLessThan(5000); // 5 seconds for 10 validations
  });
});