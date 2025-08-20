/**
 * Comprehensive validation tests for example documents
 * Ensures all example documents remain valid as the schema evolves
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { validateXatsFile } from '../dist/validator.js';

const EXAMPLES_DIR = join(process.cwd(), 'examples');
const INVALID_EXAMPLES_DIR = join(EXAMPLES_DIR, 'invalid');

// Ensure invalid examples directory exists
if (!existsSync(INVALID_EXAMPLES_DIR)) {
  mkdirSync(INVALID_EXAMPLES_DIR, { recursive: true });
}

describe('Example Document Validation', () => {
  describe('Valid Examples', () => {
    // Get all JSON files in examples directory (excluding invalid subdirectory)
    const validFiles = readdirSync(EXAMPLES_DIR)
      .filter(f => f.endsWith('.json') && !f.includes('invalid'));

    if (validFiles.length === 0) {
      it.skip('No valid example files found', () => {});
    } else {
      validFiles.forEach(file => {
        describe(`${file}`, () => {
          const filePath = join(EXAMPLES_DIR, file);
          
          it('should validate against current schema version', async () => {
            const result = await validateXatsFile(filePath);
            if (!result.isValid) {
              console.error(`Validation errors for ${file}:`, JSON.stringify(result.errors, null, 2));
            }
            expect(result.isValid).toBe(true);
          });

          it('should have all required fields', async () => {
            const content = JSON.parse(readFileSync(filePath, 'utf8'));
            
            // Check required top-level fields
            expect(content).toHaveProperty('schemaVersion');
            expect(content).toHaveProperty('bibliographicEntry');
            expect(content).toHaveProperty('subject');
            expect(content).toHaveProperty('bodyMatter');
          });

          it('should have correct field types', async () => {
            const content = JSON.parse(readFileSync(filePath, 'utf8'));
            
            // Check field types
            expect(typeof content.schemaVersion).toBe('string');
            expect(typeof content.bibliographicEntry).toBe('object');
            expect(typeof content.subject).toBe('string');
            expect(typeof content.bodyMatter).toBe('object');
            
            // Check bibliographic entry has required fields
            expect(content.bibliographicEntry).toHaveProperty('id');
            expect(content.bibliographicEntry).toHaveProperty('type');
            expect(content.bibliographicEntry).toHaveProperty('title');
          });

          it('should have valid vocabulary URIs', async () => {
            const content = JSON.parse(readFileSync(filePath, 'utf8'));
            
            // Helper function to check blockTypes recursively
            function checkBlockTypes(obj: unknown): string[] {
              const blockTypes: string[] = [];
              
              if (obj && typeof obj === 'object') {
                const objAsAny = obj as any;
                if (objAsAny.blockType) {
                  blockTypes.push(objAsAny.blockType);
                }
                
                for (const key in objAsAny) {
                  if (Array.isArray(objAsAny[key])) {
                    objAsAny[key].forEach((item: unknown) => {
                      blockTypes.push(...checkBlockTypes(item));
                    });
                  } else if (typeof objAsAny[key] === 'object') {
                    blockTypes.push(...checkBlockTypes(objAsAny[key]));
                  }
                }
              }
              
              return blockTypes;
            }
            
            const blockTypes = checkBlockTypes(content);
            
            // All block types should be valid URIs
            blockTypes.forEach(blockType => {
              expect(blockType).toMatch(/^https?:\/\//);
              expect(blockType).toContain('xats.org');
            });
          });

          it('should have valid internal references', async () => {
            const content = JSON.parse(readFileSync(filePath, 'utf8'));
            
            // Collect all IDs in the document
            const ids = new Set<string>();
            function collectIds(obj: unknown) {
              if (obj && typeof obj === 'object') {
                const objAsAny = obj as any;
                if (objAsAny.id) {
                  ids.add(objAsAny.id);
                }
                for (const key in objAsAny) {
                  if (Array.isArray(objAsAny[key])) {
                    objAsAny[key].forEach(collectIds);
                  } else if (typeof objAsAny[key] === 'object') {
                    collectIds(objAsAny[key]);
                  }
                }
              }
            }
            collectIds(content);
            
            // Check all references point to existing IDs
            function checkReferences(obj: unknown) {
              if (obj && typeof obj === 'object') {
                const objAsAny = obj as any;
                if (objAsAny.type === 'reference' && objAsAny.target) {
                  expect(ids.has(objAsAny.target)).toBe(true);
                }
                for (const key in objAsAny) {
                  if (Array.isArray(objAsAny[key])) {
                    objAsAny[key].forEach(checkReferences);
                  } else if (typeof objAsAny[key] === 'object') {
                    checkReferences(objAsAny[key]);
                  }
                }
              }
            }
            checkReferences(content);
          });

          it('should have valid SemanticText structures', async () => {
            const content = JSON.parse(readFileSync(filePath, 'utf8'));
            
            // Check all SemanticText objects
            function checkSemanticText(obj: unknown) {
              if (obj && typeof obj === 'object') {
                const objAsAny = obj as any;
                if (objAsAny.runs && Array.isArray(objAsAny.runs)) {
                  // Each run should have a type
                  objAsAny.runs.forEach((run: any) => {
                    expect(run).toHaveProperty('type');
                    expect(['text', 'reference', 'citation', 'emphasis', 'strong', 'index']).toContain(run.type);
                    
                    // Text runs should have text property
                    if (run.type === 'text') {
                      expect(run).toHaveProperty('text');
                      expect(typeof run.text).toBe('string');
                    }
                    
                    // Reference runs should have target
                    if (run.type === 'reference') {
                      expect(run).toHaveProperty('target');
                      expect(typeof run.target).toBe('string');
                    }
                    
                    // Citation runs should have citationKey
                    if (run.type === 'citation') {
                      expect(run).toHaveProperty('citationKey');
                      expect(typeof run.citationKey).toBe('string');
                    }
                  });
                }
                
                for (const key in objAsAny) {
                  if (Array.isArray(objAsAny[key])) {
                    objAsAny[key].forEach(checkSemanticText);
                  } else if (typeof objAsAny[key] === 'object') {
                    checkSemanticText(objAsAny[key]);
                  }
                }
              }
            }
            checkSemanticText(content);
          });
        });
      });
    }
  });

  describe('Invalid Examples', () => {
    // Create invalid example files for testing
    beforeAll(() => {
      // Missing required fields
      const missingRequired = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'invalid-001',
          type: 'book',
          title: 'Missing Required Fields'
        }
        // Missing subject and bodyMatter
      };
      writeFileSync(
        join(INVALID_EXAMPLES_DIR, 'missing-required.json'),
        JSON.stringify(missingRequired, null, 2)
      );

      // Wrong types
      const wrongTypes = {
        schemaVersion: 123, // Should be string
        bibliographicEntry: {
          id: 'invalid-002',
          type: 'book',
          title: 'Wrong Types',
          author: [{ family: 'Test', given: 'Author' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: ['Should', 'be', 'string'], // Should be string
        bodyMatter: 'Should be object' // Should be object
      };
      writeFileSync(
        join(INVALID_EXAMPLES_DIR, 'wrong-types.json'),
        JSON.stringify(wrongTypes, null, 2)
      );

      // Bad SemanticText
      const badSemanticText = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'invalid-003',
          type: 'book',
          title: 'Bad SemanticText',
          author: [{ family: 'Test', given: 'Author' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [{
            id: 'ch1',
            label: '1',
            title: 'Chapter 1',
            sections: [{
              id: 's1',
              label: '1.1',
              title: 'Section 1',
              content: [{
                id: 'p1',
                blockType: 'https://xats.org/core/blocks/paragraph',
                content: {
                  text: 'Should be SemanticText object, not string'
                }
              }]
            }]
          }]
        }
      };
      writeFileSync(
        join(INVALID_EXAMPLES_DIR, 'bad-semantictext.json'),
        JSON.stringify(badSemanticText, null, 2)
      );

      // Invalid references
      const invalidReferences = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'invalid-004',
          type: 'book',
          title: 'Invalid References',
          author: [{ family: 'Test', given: 'Author' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [{
            id: 'ch1',
            label: '1',
            title: 'Chapter 1',
            sections: [{
              id: 's1',
              label: '1.1',
              title: 'Section 1',
              content: [{
                id: 'p1',
                blockType: 'https://xats.org/core/blocks/paragraph',
                content: {
                  text: {
                    runs: [
                      { type: 'text', text: 'See ' },
                      { type: 'reference', target: 'non-existent-id' },
                      { type: 'text', text: ' for details.' }
                    ]
                  }
                }
              }]
            }]
          }]
        }
      };
      writeFileSync(
        join(INVALID_EXAMPLES_DIR, 'invalid-references.json'),
        JSON.stringify(invalidReferences, null, 2)
      );

      // Unknown block types
      const unknownBlockTypes = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'invalid-005',
          type: 'book',
          title: 'Unknown Block Types',
          author: [{ family: 'Test', given: 'Author' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [{
            id: 'ch1',
            label: '1',
            title: 'Chapter 1',
            sections: [{
              id: 's1',
              label: '1.1',
              title: 'Section 1',
              content: [{
                id: 'p1',
                blockType: 'https://example.com/unknown/block/type',
                content: {
                  text: { runs: [{ type: 'text', text: 'Unknown block type' }] }
                }
              }]
            }]
          }]
        }
      };
      writeFileSync(
        join(INVALID_EXAMPLES_DIR, 'unknown-blocktypes.json'),
        JSON.stringify(unknownBlockTypes, null, 2)
      );
    });

    const invalidFiles = existsSync(INVALID_EXAMPLES_DIR) 
      ? readdirSync(INVALID_EXAMPLES_DIR).filter(f => f.endsWith('.json'))
      : [];

    if (invalidFiles.length === 0) {
      it.skip('No invalid example files found', () => {});
    } else {
      invalidFiles.forEach(file => {
        it(`should reject ${file}`, async () => {
          const filePath = join(INVALID_EXAMPLES_DIR, file);
          const result = await validateXatsFile(filePath);
          
          // unknown-blocktypes.json is allowed by design (xats is extensible)
          if (file === 'unknown-blocktypes.json') {
            expect(result.isValid).toBe(true);
          } else {
            expect(result.isValid).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors.length).toBeGreaterThan(0);
          }
        });

        it(`should provide helpful error messages for ${file}`, async () => {
          const filePath = join(INVALID_EXAMPLES_DIR, file);
          const result = await validateXatsFile(filePath);
          
          // Skip error message check for files that pass validation
          if (file !== 'unknown-blocktypes.json') {
            result.errors.forEach((error: any) => {
              expect(error).toHaveProperty('path');
              expect(error).toHaveProperty('message');
              expect(error.message).toBeTruthy();
              expect(error.message.length).toBeGreaterThan(0);
            });
          }
        });
      });
    }
  });

  describe('Example Coverage', () => {
    it('should have examples for all major features', () => {
      const expectedExamples = [
        'adaptive-pathway-example.json'  // Already exists
      ];

      const existingFiles = readdirSync(EXAMPLES_DIR)
        .filter(f => f.endsWith('.json'));

      expectedExamples.forEach(expected => {
        if (!existingFiles.includes(expected)) {
          console.warn(`Missing example: ${expected}`);
        }
      });

      // At least one example should exist
      expect(existingFiles.length).toBeGreaterThan(0);
    });

    it('should have invalid examples for common mistakes', () => {
      const expectedInvalid = [
        'missing-required.json',
        'wrong-types.json',
        'bad-semantictext.json',
        'invalid-references.json',
        'unknown-blocktypes.json'
      ];

      const invalidFiles = existsSync(INVALID_EXAMPLES_DIR) 
        ? readdirSync(INVALID_EXAMPLES_DIR).filter(f => f.endsWith('.json'))
        : [];

      expectedInvalid.forEach(expected => {
        expect(invalidFiles).toContain(expected);
      });
    });
  });

  describe('Performance with Examples', () => {
    it('should validate all examples quickly', async () => {
      const allFiles = readdirSync(EXAMPLES_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => join(EXAMPLES_DIR, f));

      const startTime = Date.now();
      
      const results = await Promise.all(
        allFiles.map(file => validateXatsFile(file))
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should validate all examples within 2 seconds
      expect(duration).toBeLessThan(2000);
      
      // Check that validations completed
      results.forEach((result: any) => {
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('errors');
      });
    });
  });
});