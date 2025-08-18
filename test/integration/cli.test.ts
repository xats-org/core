/**
 * Integration tests for xats-validate CLI tool
 * These tests verify the CLI works correctly when installed globally
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync, spawn } from 'child_process';
import { resolve, join } from 'path';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';

const PROJECT_ROOT = resolve(process.cwd());
const CLI_PATH = resolve(PROJECT_ROOT, 'bin/validate.js');
const EXAMPLES_DIR = resolve(PROJECT_ROOT, 'examples');

/**
 * Execute CLI command and return result
 */
function execCLI(command: string, options: { cwd?: string } = {}): {
  stdout: string;
  stderr: string;
  exitCode: number;
} {
  try {
    const stdout = execSync(command, {
      ...options,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.status || 1
    };
  }
}

/**
 * Run CLI command asynchronously
 */
function runCLIAsync(args: string[], options: { cwd?: string } = {}): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  return new Promise((resolve) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      ...options,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (exitCode) => {
      resolve({
        stdout,
        stderr,
        exitCode: exitCode || 0
      });
    });

    child.on('error', (error) => {
      resolve({
        stdout,
        stderr: error.message,
        exitCode: 1
      });
    });
  });
}

describe('CLI Integration Tests', () => {
  let tempDir: string;

  beforeAll(() => {
    // Create temporary directory for test files
    tempDir = mkdtempSync(join(tmpdir(), 'xats-test-'));
  });

  afterAll(() => {
    // Clean up temporary directory
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Global Installation', () => {
    it('should work with npm link simulation', async () => {
      // Simulate global installation by running CLI directly
      const result = await runCLIAsync(['--version']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should be executable from any directory', async () => {
      const result = await runCLIAsync(['--help'], { cwd: tempDir });
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('xats-validate');
    });
  });

  describe('Document Validation', () => {
    it('should validate correct xats documents', async () => {
      const validDoc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-integration',
          type: 'book',
          title: 'Integration Test',
          author: [{ family: 'Test', given: 'Integration' }],
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
                  text: { runs: [{ type: 'text', text: 'Test content' }] }
                }
              }]
            }]
          }]
        }
      };

      const testFile = join(tempDir, 'valid-test.json');
      writeFileSync(testFile, JSON.stringify(validDoc, null, 2));

      const result = await runCLIAsync([testFile]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✓ Document is valid');
    });

    it('should reject incorrect documents with proper exit codes', async () => {
      const invalidDoc = {
        schemaVersion: '0.1.0',
        // Missing required fields
      };

      const testFile = join(tempDir, 'invalid-test.json');
      writeFileSync(testFile, JSON.stringify(invalidDoc, null, 2));

      const result = await runCLIAsync([testFile]);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('✗ Document validation failed');
    });

    it('should validate documents with different schema versions', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'version-test',
          type: 'book',
          title: 'Version Test',
          author: [{ family: 'Version', given: 'Test' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Version Testing',
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
                  text: { runs: [{ type: 'text', text: 'Content' }] }
                }
              }]
            }]
          }]
        }
      };

      const testFile = join(tempDir, 'version-test.json');
      writeFileSync(testFile, JSON.stringify(doc, null, 2));

      const result = await runCLIAsync([testFile, '--schema-version', '0.1.0']);
      expect(result.exitCode).toBe(0);
    });

    it('should handle missing files gracefully', async () => {
      const result = await runCLIAsync([join(tempDir, 'non-existent.json')]);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('✗ Document validation failed');
    });
  });

  describe('CLI Options', () => {
    let testFile: string;

    beforeAll(() => {
      const validDoc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'options-test',
          type: 'book',
          title: 'Options Test',
          author: [{ family: 'Options', given: 'Test' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Options',
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
                  text: { runs: [{ type: 'text', text: 'Content' }] }
                }
              }]
            }]
          }]
        }
      };
      testFile = join(tempDir, 'options-test.json');
      writeFileSync(testFile, JSON.stringify(validDoc, null, 2));
    });

    it('--help displays usage information', async () => {
      const result = await runCLIAsync(['--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('xats-validate');
      expect(result.stdout).toContain('Options:');
    });

    it('--version shows correct version', async () => {
      const result = await runCLIAsync(['--version']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('--json outputs JSON format', async () => {
      const result = await runCLIAsync([testFile, '--json']);
      expect(result.exitCode).toBe(0);
      
      const json = JSON.parse(result.stdout);
      expect(json).toHaveProperty('isValid');
      expect(json).toHaveProperty('errors');
      expect(json.isValid).toBe(true);
    });

    it('--quiet suppresses non-error output', async () => {
      const result = await runCLIAsync([testFile, '--quiet']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).not.toContain('Validating:');
      expect(result.stdout).toContain('✓ Document is valid');
    });

    it('--schema-version uses specific version', async () => {
      const result = await runCLIAsync([testFile, '--schema-version', '0.1.0']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✓ Document is valid');
    });
  });

  describe('Commands', () => {
    it('validate <file> validates single file', async () => {
      const testFile = join(tempDir, 'single-file.json');
      writeFileSync(testFile, JSON.stringify({
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'single',
          type: 'book',
          title: 'Single',
          author: [{ family: 'Single', given: 'File' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Single File',
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
                  text: { runs: [{ type: 'text', text: 'Content' }] }
                }
              }]
            }]
          }]
        }
      }, null, 2));

      const result = await runCLIAsync([testFile]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✓ Document is valid');
    });

    it('validate <directory> validates all files in directory', async () => {
      const testDir = join(tempDir, 'test-dir');
      execSync(`mkdir -p ${testDir}`);

      // Create multiple test files
      for (let i = 1; i <= 3; i++) {
        const doc = {
          schemaVersion: '0.1.0',
          bibliographicEntry: {
            id: `test-${i}`,
            type: 'book',
            title: `Test ${i}`,
            author: [{ family: 'Test', given: `${i}` }],
            issued: { 'date-parts': [[2024]] }
          },
          subject: `Subject ${i}`,
          bodyMatter: {
            contents: [{
              id: `ch${i}`,
              label: '1',
              title: 'Chapter 1',
              sections: [{
                id: `s${i}`,
                label: '1.1',
                title: 'Section 1',
                content: [{
                  id: `p${i}`,
                  blockType: 'https://xats.org/core/blocks/paragraph',
                  content: {
                    text: { runs: [{ type: 'text', text: `Content ${i}` }] }
                  }
                }]
              }]
            }]
          }
        };
        writeFileSync(join(testDir, `test-${i}.json`), JSON.stringify(doc, null, 2));
      }

      const result = await runCLIAsync([testDir]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✓');
    });

    it('versions lists available schema versions', async () => {
      const result = await runCLIAsync(['versions']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Available schema versions');
      expect(result.stdout).toContain('0.1.0');
    });

    it('schema displays schema information', async () => {
      const result = await runCLIAsync(['schema']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Schema version: 0.1.0');
      expect(result.stdout).toContain('https://xats.org/schemas');
    });
  });

  describe('Error Handling', () => {
    it('handles missing file argument', async () => {
      const result = await runCLIAsync([]);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('error: missing required argument');
    });

    it('handles invalid JSON file', async () => {
      const testFile = join(tempDir, 'invalid-json.json');
      writeFileSync(testFile, '{ invalid json }');

      const result = await runCLIAsync([testFile]);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('✗ Document validation failed');
    });

    it('handles network errors gracefully', async () => {
      // Test with a schema version that would require network access
      const testFile = join(tempDir, 'network-test.json');
      writeFileSync(testFile, JSON.stringify({
        schemaVersion: '999.999.999',
        bibliographicEntry: {
          id: 'network',
          type: 'book',
          title: 'Network Test',
          author: [{ family: 'Network', given: 'Test' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Network',
        bodyMatter: { contents: [] }
      }, null, 2));

      const result = await runCLIAsync([testFile]);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('✗ Document validation failed');
    });

    it('handles invalid schema version', async () => {
      const testFile = join(tempDir, 'version-error.json');
      writeFileSync(testFile, JSON.stringify({
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'version',
          type: 'book',
          title: 'Version',
          author: [{ family: 'Version', given: 'Error' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Version Error',
        bodyMatter: { contents: [] }
      }, null, 2));

      const result = await runCLIAsync([testFile, '--schema-version', 'invalid']);
      expect(result.exitCode).toBe(1);
    });
  });

  describe('Performance', () => {
    it('validates large document in reasonable time', async () => {
      // Create a large document
      const largeDoc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'large-doc',
          type: 'book',
          title: 'Large Document',
          author: [{ family: 'Large', given: 'Document' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Performance Testing',
        bodyMatter: {
          contents: Array.from({ length: 100 }, (_, i) => ({
            id: `chapter-${i}`,
            label: `${i + 1}`,
            title: `Chapter ${i + 1}`,
            sections: Array.from({ length: 10 }, (_, j) => ({
              id: `section-${i}-${j}`,
              label: `${i + 1}.${j + 1}`,
              title: `Section ${j + 1}`,
              content: Array.from({ length: 5 }, (_, k) => ({
                id: `block-${i}-${j}-${k}`,
                blockType: 'https://xats.org/core/blocks/paragraph',
                content: {
                  text: { 
                    runs: [{ 
                      type: 'text', 
                      text: `Content for chapter ${i + 1}, section ${j + 1}, paragraph ${k + 1}` 
                    }] 
                  }
                }
              }))
            }))
          }))
        }
      };

      const testFile = join(tempDir, 'large-doc.json');
      writeFileSync(testFile, JSON.stringify(largeDoc, null, 2));

      const startTime = Date.now();
      const result = await runCLIAsync([testFile]);
      const endTime = Date.now();

      expect(result.exitCode).toBe(0);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('validates multiple files efficiently', async () => {
      const multiDir = join(tempDir, 'multi-files');
      execSync(`mkdir -p ${multiDir}`);

      // Create 10 test files
      for (let i = 1; i <= 10; i++) {
        const doc = {
          schemaVersion: '0.1.0',
          bibliographicEntry: {
            id: `multi-${i}`,
            type: 'book',
            title: `Document ${i}`,
            author: [{ family: 'Multi', given: `${i}` }],
            issued: { 'date-parts': [[2024]] }
          },
          subject: `Subject ${i}`,
          bodyMatter: {
            contents: [{
              id: `ch${i}`,
              label: '1',
              title: 'Chapter 1',
              sections: [{
                id: `s${i}`,
                label: '1.1',
                title: 'Section 1',
                content: [{
                  id: `p${i}`,
                  blockType: 'https://xats.org/core/blocks/paragraph',
                  content: {
                    text: { runs: [{ type: 'text', text: `Content ${i}` }] }
                  }
                }]
              }]
            }]
          }
        };
        writeFileSync(join(multiDir, `doc-${i}.json`), JSON.stringify(doc, null, 2));
      }

      const startTime = Date.now();
      const result = await runCLIAsync([multiDir]);
      const endTime = Date.now();

      expect(result.exitCode).toBe(0);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('maintains reasonable memory usage', async () => {
      // This test would ideally measure memory usage, but for simplicity
      // we'll just ensure it completes without errors
      const memTestFile = join(tempDir, 'memory-test.json');
      
      // Create a document with many references to test memory handling
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'memory-test',
          type: 'book',
          title: 'Memory Test',
          author: [{ family: 'Memory', given: 'Test' }],
          issued: { 'date-parts': [[2024]] }
        },
        subject: 'Memory Testing',
        bodyMatter: {
          contents: Array.from({ length: 50 }, (_, i) => ({
            id: `ch-${i}`,
            label: `${i}`,
            title: `Chapter ${i}`,
            sections: [{
              id: `s-${i}`,
              label: `${i}.1`,
              title: 'Section',
              content: [{
                id: `p-${i}`,
                blockType: 'https://xats.org/core/blocks/paragraph',
                content: {
                  text: { 
                    runs: Array.from({ length: 100 }, (_, j) => ({
                      type: 'text' as const,
                      text: `Word ${j} `
                    }))
                  }
                }
              }]
            }]
          }))
        }
      };

      writeFileSync(memTestFile, JSON.stringify(doc, null, 2));
      
      const result = await runCLIAsync([memTestFile]);
      expect(result.exitCode).toBe(0);
    });
  });
});