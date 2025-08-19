/**
 * Security Validation Tests for File Modularity
 * 
 * Tests to ensure that FileReference validation properly prevents
 * security vulnerabilities and maintains safe file access patterns.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { join, resolve } from 'path';
import { FileModularityValidator } from '../src/file-modularity-validator.js';
import { writeFileSync, mkdirSync } from 'fs';

const FIXTURES_DIR = resolve(__dirname, 'fixtures/file-modularity');
const SECURITY_TEST_DIR = join(FIXTURES_DIR, 'security-tests');

describe('File Modularity Security Validation', () => {
  let validator: FileModularityValidator;

  beforeEach(() => {
    validator = new FileModularityValidator();
    
    // Create security test directory
    try {
      mkdirSync(SECURITY_TEST_DIR, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }
  });

  describe('Path Traversal Prevention', () => {
    it('should reject simple parent directory traversal', async () => {
      const maliciousDoc = createDocumentWithRef('../../../etc/passwd.json');
      const docPath = join(SECURITY_TEST_DIR, 'parent-traversal-simple.json');
      writeFileSync(docPath, JSON.stringify(maliciousDoc, null, 2));

      const result = await validator.validate(docPath);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('parent directory traversal') ||
        error.message.includes('outside of document root') ||
        error.message.includes('must match pattern')
      )).toBe(true);
    });

    it('should reject complex parent directory traversal', async () => {
      const maliciousDoc = createDocumentWithRef('./subdir/../../../sensitive-file.json');
      const docPath = join(SECURITY_TEST_DIR, 'parent-traversal-complex.json');
      writeFileSync(docPath, JSON.stringify(maliciousDoc, null, 2));

      const result = await validator.validate(docPath);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('parent directory traversal') ||
        error.message.includes('outside of document root') ||
        error.message.includes('must match pattern')
      )).toBe(true);
    });

    it('should reject encoded parent directory traversal', async () => {
      // Test various encoded forms
      const encodedPaths = [
        './..%2f..%2fetc%2fpasswd.json',
        './..\\..\\windows\\system32\\config.json',
        './%2e%2e/%2e%2e/sensitive.json'
      ];

      for (const path of encodedPaths) {
        const maliciousDoc = createDocumentWithRef(path);
        const docPath = join(SECURITY_TEST_DIR, `encoded-traversal-${encodedPaths.indexOf(path)}.json`);
        writeFileSync(docPath, JSON.stringify(maliciousDoc, null, 2));

        const result = await validator.validate(docPath);
        expect(result.isValid).toBe(false);
      }
    });
  });

  describe('Absolute Path Prevention', () => {
    it('should reject Unix absolute paths', async () => {
      const maliciousPaths = [
        '/etc/passwd.json',
        '/home/user/secret.json',
        '/var/log/system.json'
      ];

      for (const path of maliciousPaths) {
        const maliciousDoc = createDocumentWithRef(path);
        const docPath = join(SECURITY_TEST_DIR, `unix-absolute-${maliciousPaths.indexOf(path)}.json`);
        writeFileSync(docPath, JSON.stringify(maliciousDoc, null, 2));

        const result = await validator.validate(docPath);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => 
          error.message.includes('absolute path') ||
          error.message.includes('must match pattern')
        )).toBe(true);
      }
    });

    it('should reject Windows absolute paths', async () => {
      const maliciousPaths = [
        'C:\\Windows\\System32\\config.json',
        'D:\\sensitive\\data.json',
        '\\\\network\\share\\file.json'
      ];

      for (const path of maliciousPaths) {
        const maliciousDoc = createDocumentWithRef(path);
        const docPath = join(SECURITY_TEST_DIR, `windows-absolute-${maliciousPaths.indexOf(path)}.json`);
        writeFileSync(docPath, JSON.stringify(maliciousDoc, null, 2));

        const result = await validator.validate(docPath);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => 
          error.message.includes('absolute path') ||
          error.message.includes('FileReference $ref must match pattern') ||
          error.message.includes('must match pattern')
        )).toBe(true);
      }
    });
  });

  describe('File Extension Validation', () => {
    it('should reject non-JSON file extensions by default', async () => {
      const invalidExtensions = [
        './malicious-script.js',
        './config.xml',
        './data.txt',
        './executable.exe'
      ];

      for (const path of invalidExtensions) {
        const maliciousDoc = createDocumentWithRef(path);
        const docPath = join(SECURITY_TEST_DIR, `invalid-extension-${invalidExtensions.indexOf(path)}.json`);
        writeFileSync(docPath, JSON.stringify(maliciousDoc, null, 2));

        const result = await validator.validate(docPath);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => 
          error.message.includes('File extension not allowed') ||
          error.message.includes('FileReference $ref must match pattern') ||
          error.message.includes('must match pattern')
        )).toBe(true);
      }
    });

    it('should respect custom allowed file extensions', async () => {
      const customValidator = new FileModularityValidator({
        allowedFileExtensions: ['.json', '.xml']
      });

      // Should allow .xml with custom config
      const xmlDoc = createDocumentWithRef('./valid-file.xml');
      const xmlPath = join(SECURITY_TEST_DIR, 'custom-extension-xml.json');
      writeFileSync(xmlPath, JSON.stringify(xmlDoc, null, 2));

      const result = await customValidator.validate(xmlPath);
      
      // Will fail because file doesn't exist, but should pass extension check
      expect(result.errors.every(error => 
        !error.message.includes('File extension not allowed')
      )).toBe(true);
    });
  });

  describe('File Size Limits', () => {
    it('should respect maxFileSize configuration', async () => {
      const smallValidator = new FileModularityValidator({
        maxFileSize: 100 // Very small limit
      });

      // Create a large file
      const largeContent = {
        id: 'large-content',
        language: 'en',
        title: 'Large File',
        content: Array(1000).fill({
          id: 'large-paragraph',
          language: 'en',
          blockType: 'https://xats.org/core/blocks/paragraph',
          content: {
            text: {
              runs: [
                {
                  type: 'text',
                  text: 'This is a very large file with lots of repeated content to exceed size limits.'
                }
              ]
            }
          }
        })
      };

      const largePath = join(SECURITY_TEST_DIR, 'large-file.json');
      writeFileSync(largePath, JSON.stringify(largeContent, null, 2));

      const docWithRef = createDocumentWithRef('./large-file.json');
      const docPath = join(SECURITY_TEST_DIR, 'doc-with-large-ref.json');
      writeFileSync(docPath, JSON.stringify(docWithRef, null, 2));

      const result = await smallValidator.validate(docPath);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('File too large')
      )).toBe(true);
    });
  });

  describe('Reference Depth Limits', () => {
    it('should respect maxDepth configuration', async () => {
      const shallowValidator = new FileModularityValidator({
        maxDepth: 2
      });

      // Create a deep reference chain
      const chain = createDeepReferenceChain(5); // Deeper than limit
      const result = await shallowValidator.validate(chain.mainPath);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('Maximum reference depth exceeded')
      )).toBe(true);
    });
  });

  describe('Malformed FileReference Handling', () => {
    it('should handle malformed JSON in referenced files', async () => {
      // Create a file with malformed JSON
      const malformedPath = join(SECURITY_TEST_DIR, 'malformed.json');
      writeFileSync(malformedPath, '{ "invalid": json content }'); // Invalid JSON

      const docWithRef = createDocumentWithRef('./malformed.json');
      const docPath = join(SECURITY_TEST_DIR, 'doc-with-malformed-ref.json');
      writeFileSync(docPath, JSON.stringify(docWithRef, null, 2));

      const result = await validator.validate(docPath);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('JSON parse error')
      )).toBe(true);
    });

    it('should handle FileReference with malformed $ref patterns', async () => {
      const malformedRefs = [
        { $ref: 'no-dot-slash.json' }, // Missing ./
        { $ref: './no-extension' }, // Missing .json
        { $ref: '' }, // Empty ref
        { $ref: './' }, // Directory only
        { $ref: './.' }, // Invalid path
      ];

      for (const ref of malformedRefs) {
        const doc = {
          schemaVersion: '0.3.0',
          id: 'malformed-ref-test',
          language: 'en',
          bibliographicEntry: {
            id: 'test-book',
            type: 'book',
            title: 'Test',
            author: [{ family: 'Test', given: 'Author' }],
            issued: { 'date-parts': [[2023]] },
            publisher: 'Test'
          },
          subject: 'Testing',
          bodyMatter: {
            contents: [ref]
          }
        };

        const docPath = join(SECURITY_TEST_DIR, `malformed-ref-${malformedRefs.indexOf(ref)}.json`);
        writeFileSync(docPath, JSON.stringify(doc, null, 2));

        const result = await validator.validate(docPath);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => 
          error.message.includes('FileReference $ref must match pattern') ||
          error.message.includes('does not exist') ||
          error.message.includes('must match pattern')
        )).toBe(true);
      }
    });
  });

  describe('Symlink and Junction Handling', () => {
    it('should handle symbolic links safely', async () => {
      // Note: This test would require creating actual symlinks
      // For now, we test the path resolution logic
      const suspiciousPath = './symlink-to-outside.json';
      const doc = createDocumentWithRef(suspiciousPath);
      const docPath = join(SECURITY_TEST_DIR, 'symlink-test.json');
      writeFileSync(docPath, JSON.stringify(doc, null, 2));

      const result = await validator.validate(docPath);
      
      // Will fail because file doesn't exist, which is expected
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.message.includes('does not exist')
      )).toBe(true);
    });
  });

  // Helper functions
  function createDocumentWithRef(ref: string) {
    return {
      schemaVersion: '0.3.0',
      id: 'security-test',
      language: 'en',
      bibliographicEntry: {
        id: 'security-book',
        type: 'book',
        title: 'Security Test',
        author: [{ family: 'Test', given: 'Author' }],
        issued: { 'date-parts': [[2023]] },
        publisher: 'Test Press'
      },
      subject: 'Security Testing',
      bodyMatter: {
        contents: [
          {
            $ref: ref
          }
        ]
      }
    };
  }

  function createDeepReferenceChain(depth: number): { mainPath: string } {
    const chainDir = join(SECURITY_TEST_DIR, `chain-${depth}`);
    
    try {
      mkdirSync(chainDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    // Create the main document
    const mainContent = {
      schemaVersion: '0.3.0',
      id: 'chain-main',
      language: 'en',
      bibliographicEntry: {
        id: 'chain-book',
        type: 'book',
        title: `Reference Chain Test (${depth} levels)`,
        author: [{ family: 'Test', given: 'Author' }],
        issued: { 'date-parts': [[2023]] },
        publisher: 'Test Press'
      },
      subject: 'Chain Testing',
      bodyMatter: {
        contents: [
          {
            $ref: './level-1.json'
          }
        ]
      }
    };
    
    const mainPath = join(chainDir, 'main.json');
    writeFileSync(mainPath, JSON.stringify(mainContent, null, 2));
    
    // Create chain levels
    for (let level = 1; level <= depth; level++) {
      const levelPath = join(chainDir, `level-${level}.json`);
      
      const levelContent = {
        id: `level-${level}`,
        language: 'en',
        title: `Level ${level}`,
        sections: level < depth ? [
          {
            $ref: `./level-${level + 1}.json`
          }
        ] : [
          {
            id: 'final-section',
            language: 'en',
            title: 'Final Section',
            content: [
              {
                id: 'final-paragraph',
                language: 'en',
                blockType: 'https://xats.org/core/blocks/paragraph',
                content: {
                  text: {
                    runs: [
                      {
                        type: 'text',
                        text: `Final level at depth ${depth}.`
                      }
                    ]
                  }
                }
              }
            ]
          }
        ]
      };
      
      writeFileSync(levelPath, JSON.stringify(levelContent, null, 2));
    }
    
    return { mainPath };
  }
});