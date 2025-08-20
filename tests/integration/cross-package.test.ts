/**
 * Cross-Package Integration Tests
 * Tests the integration between different packages in the monorepo
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile } from 'fs/promises';
import {
  createTestContext,
  createTestDocument,
  getMinimalDocument,
  getComplexDocument,
  runCommand,
  TestContext
} from './setup';

describe('Cross-Package Integration', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestContext();
  });

  afterEach(async () => {
    await ctx.cleanup();
  });

  describe('CLI → Validator → Schema Integration', () => {
    it('should validate a document through the CLI', async () => {
      const docPath = join(ctx.tempDir, 'test.json');
      await createTestDocument(docPath);

      const { stdout, stderr, exitCode } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'validate', docPath],
        { cwd: process.cwd() }
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain('valid');
      expect(stderr).toBe('');
    });

    it('should report validation errors for invalid documents', async () => {
      const docPath = join(ctx.tempDir, 'invalid.json');
      const invalidDoc = getMinimalDocument();
      delete (invalidDoc as any).schemaVersion; // Make it invalid
      await createTestDocument(docPath, invalidDoc);

      const { stdout, stderr, exitCode } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'validate', docPath],
        { cwd: process.cwd() }
      );

      expect(exitCode).not.toBe(0);
      expect(stdout + stderr).toContain('error');
    });
  });

  describe('CLI → Renderer Integration', () => {
    it('should render a document to HTML', async () => {
      const docPath = join(ctx.tempDir, 'test.json');
      const outputPath = join(ctx.tempDir, 'output.html');
      await createTestDocument(docPath, getComplexDocument());

      const { exitCode } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'render', docPath, '--output', outputPath, '--format', 'html'],
        { cwd: process.cwd() }
      );

      expect(exitCode).toBe(0);
      
      const html = await readFile(outputPath, 'utf-8');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Introduction to Testing');
      expect(html).toContain('Getting Started');
    });

    it('should render a document to Markdown', async () => {
      const docPath = join(ctx.tempDir, 'test.json');
      const outputPath = join(ctx.tempDir, 'output.md');
      await createTestDocument(docPath, getComplexDocument());

      const { exitCode } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'render', docPath, '--output', outputPath, '--format', 'markdown'],
        { cwd: process.cwd() }
      );

      expect(exitCode).toBe(0);
      
      const markdown = await readFile(outputPath, 'utf-8');
      expect(markdown).toContain('# Introduction to Testing');
      expect(markdown).toContain('## Getting Started');
      expect(markdown).toContain('```typescript');
    });

    it('should render a document to plain text', async () => {
      const docPath = join(ctx.tempDir, 'test.json');
      const outputPath = join(ctx.tempDir, 'output.txt');
      await createTestDocument(docPath);

      const { exitCode } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'render', docPath, '--output', outputPath, '--format', 'text'],
        { cwd: process.cwd() }
      );

      expect(exitCode).toBe(0);
      
      const text = await readFile(outputPath, 'utf-8');
      expect(text).toContain('Introduction');
      expect(text).toContain('test paragraph');
    });
  });

  describe('Examples → Validator Integration', () => {
    it('should validate all example documents', async () => {
      const { exitCode, stdout } = await runCommand(
        'pnpm',
        ['--filter', '@xats/examples', 'run', 'validate:all'],
        { cwd: process.cwd() }
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain('All examples validated successfully');
    });
  });

  describe('Utils → All Packages Integration', () => {
    it('should use utils functions across packages', async () => {
      // Test that utils are properly imported and used in other packages
      const { exitCode } = await runCommand(
        'pnpm',
        ['run', 'typecheck'],
        { cwd: process.cwd() }
      );

      expect(exitCode).toBe(0);
    });
  });

  describe('Types → TypeScript Integration', () => {
    it('should provide proper type definitions', async () => {
      const testFile = join(ctx.tempDir, 'test-types.ts');
      const content = `
        import type { XatsDocument, ContentBlock, SemanticText } from '@xats/types';
        
        const doc: XatsDocument = {
          schemaVersion: "0.3.0",
          bibliographicEntry: {
            id: "test",
            title: "Test",
            type: "book"
          },
          subject: {
            name: "Test",
            description: "Test"
          },
          bodyMatter: {
            contents: []
          }
        };
        
        const block: ContentBlock = {
          blockType: "https://xats.org/core/blocks/paragraph",
          content: {
            runs: [{ text: "Test" }]
          }
        };
        
        const text: SemanticText = {
          runs: [{ text: "Test" }]
        };
      `;
      
      await createTestDocument(testFile, content);
      
      const { exitCode, stderr } = await runCommand(
        'npx',
        ['tsc', '--noEmit', testFile],
        { cwd: ctx.tempDir }
      );

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');
    });
  });

  describe('Build Pipeline Integration', () => {
    it('should build all packages in correct order', async () => {
      const { exitCode, stdout } = await runCommand(
        'pnpm',
        ['run', 'build'],
        { cwd: process.cwd() }
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain('build');
    });

    it('should handle circular dependencies correctly', async () => {
      // Turborepo should detect and handle any circular dependencies
      const { exitCode } = await runCommand(
        'pnpm',
        ['run', 'build', '--dry-run'],
        { cwd: process.cwd() }
      );

      expect(exitCode).toBe(0);
    });
  });

  describe('Monorepo Workspace Integration', () => {
    it('should resolve workspace dependencies', async () => {
      const { exitCode, stdout } = await runCommand(
        'pnpm',
        ['ls', '--depth', '0'],
        { cwd: join(process.cwd(), 'packages/cli') }
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain('@xats/types');
      expect(stdout).toContain('@xats/validator');
      expect(stdout).toContain('workspace:');
    });

    it('should run scripts across all packages', async () => {
      const { exitCode } = await runCommand(
        'pnpm',
        ['--recursive', 'run', 'typecheck'],
        { cwd: process.cwd() }
      );

      expect(exitCode).toBe(0);
    });
  });
});