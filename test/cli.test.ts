/**
 * Tests for the CLI validator
 */

import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import { resolve } from 'path';

const CLI_PATH = resolve(process.cwd(), 'bin/validate.js');
const FIXTURES_DIR = resolve(process.cwd(), 'test/fixtures');

/**
 * Helper function to run CLI command and capture output
 */
function runCLI(args: string[]): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve) => {
    const child = spawn('node', [CLI_PATH, ...args], {
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
        exitCode: exitCode || 0,
        stdout,
        stderr
      });
    });

    child.on('error', (error) => {
      resolve({
        exitCode: 1,
        stdout,
        stderr: error.message
      });
    });
  });
}

describe('CLI Validator', () => {
  describe('--help', () => {
    it('should display help information', async () => {
      const result = await runCLI(['--help']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('xats-validate');
      expect(result.stdout).toContain('Validate xats documents');
    });
  });

  describe('--version', () => {
    it('should display version information', async () => {
      const result = await runCLI(['--version']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/); // Semantic version pattern
    });
  });

  describe('validate command', () => {
    it('should validate a valid document', async () => {
      const validFile = resolve(FIXTURES_DIR, 'valid-minimal.json');
      const result = await runCLI([validFile]);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✓ Document is valid');
    });

    it('should reject an invalid document', async () => {
      const invalidFile = resolve(FIXTURES_DIR, 'invalid-missing-required.json');
      const result = await runCLI([invalidFile]);
      
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('✗ Document validation failed');
      expect(result.stdout).toContain('Validation Errors:');
    });

    it('should handle non-existent file', async () => {
      const nonExistentFile = resolve(FIXTURES_DIR, 'does-not-exist.json');
      const result = await runCLI([nonExistentFile]);
      
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('✗ Document validation failed');
    });

    it('should handle invalid JSON', async () => {
      const invalidJsonFile = resolve(FIXTURES_DIR, 'invalid-json.json');
      const result = await runCLI([invalidJsonFile]);
      
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('✗ Document validation failed');
    });
  });

  describe('options', () => {
    it('should respect --quiet flag', async () => {
      const validFile = resolve(FIXTURES_DIR, 'valid-minimal.json');
      const result = await runCLI([validFile, '--quiet']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).not.toContain('Validating:');
      expect(result.stdout).toContain('✓ Document is valid');
    });

    it('should output JSON when --json flag is used', async () => {
      const validFile = resolve(FIXTURES_DIR, 'valid-minimal.json');
      const result = await runCLI([validFile, '--json']);
      
      expect(result.exitCode).toBe(0);
      
      // Should be valid JSON
      expect(() => JSON.parse(result.stdout)).not.toThrow();
      
      const output = JSON.parse(result.stdout);
      expect(output).toHaveProperty('isValid');
      expect(output).toHaveProperty('errors');
      expect(output.isValid).toBe(true);
    });

    it('should use specific schema version when provided', async () => {
      const validFile = resolve(FIXTURES_DIR, 'valid-minimal.json');
      const result = await runCLI([validFile, '--schema-version', '0.1.0']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✓ Document is valid');
    });

    it('should handle invalid schema version', async () => {
      const validFile = resolve(FIXTURES_DIR, 'valid-minimal.json');
      const result = await runCLI([validFile, '--schema-version', 'invalid-version']);
      
      expect(result.exitCode).toBe(1);
    });
  });

  describe('versions command', () => {
    it('should list available schema versions', async () => {
      const result = await runCLI(['versions']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Available schema versions');
      expect(result.stdout).toContain('0.1.0');
    });
  });

  describe('schema command', () => {
    it('should show schema information', async () => {
      const result = await runCLI(['schema']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Schema version: 0.1.0');
      expect(result.stdout).toContain('https://xats.org/schemas/0.1.0/schema.json');
    });

    it('should show schema information for specific version', async () => {
      const result = await runCLI(['schema', '0.1.0']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Schema version: 0.1.0');
    });
  });

  describe('error handling', () => {
    it('should show error for missing file argument', async () => {
      const result = await runCLI([]);
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('error: missing required argument');
    });

    it('should show error for invalid option', async () => {
      const result = await runCLI(['--invalid-option']);
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('error: unknown option');
    });
  });
});