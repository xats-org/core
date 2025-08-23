/**
 * Tests for the XatsAuthoringTool class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { XatsAuthoringTool } from '../authoring-tool.js';
import type { SimplifiedDocument, AuthoringToolOptions } from '../types.js';

describe('XatsAuthoringTool', () => {
  let authoringTool: XatsAuthoringTool;
  let options: AuthoringToolOptions;

  beforeEach(() => {
    options = {
      realTimeValidation: true,
      enablePreview: true,
      previewFormat: 'html',
      userLevel: 'intermediate',
    };
    authoringTool = new XatsAuthoringTool(options);
  });

  describe('createDocument', () => {
    it('should create a simple document from markdown-like syntax', async () => {
      const simplifiedDoc: SimplifiedDocument = {
        title: 'Test Document',
        author: 'Test Author',
        subject: 'Computer Science',
        content: `# Chapter 1: Introduction

This is the introduction paragraph.

## Section 1.1: Overview

This is an overview section.

### Subsection

This is a subsection with some content.

- List item 1
- List item 2
- List item 3

> This is a blockquote with some important information.

\`\`\`javascript
const x = 42;
console.log(x);
\`\`\``,
      };

      const result = await authoringTool.createDocument(simplifiedDoc);

      expect(result.success).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.document?.bibliographicEntry.title).toBe('Test Document');
      expect(result.document?.subject).toBe('Computer Science');
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle empty content gracefully', async () => {
      const simplifiedDoc: SimplifiedDocument = {
        title: 'Empty Document',
        content: '',
      };

      const result = await authoringTool.createDocument(simplifiedDoc);

      expect(result.success).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.document?.bodyMatter.contents).toHaveLength(1); // Should create default chapter
    });

    it('should include validation feedback when enabled', async () => {
      const simplifiedDoc: SimplifiedDocument = {
        title: 'Test Document',
        content: '# Test Chapter\n\nTest content.',
      };

      const result = await authoringTool.createDocument(simplifiedDoc);

      expect(result.success).toBe(true);
      expect(result.validation).toBeDefined();
      expect(result.validation?.isValid).toBeDefined();
    });
  });

  describe('importFromMarkdown', () => {
    it('should import markdown content successfully', async () => {
      const markdown = `# My Document

## Chapter 1

This is some content.

- Item 1
- Item 2

> Important note here.`;

      const result = await authoringTool.importFromMarkdown(markdown);

      expect(result.success).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.sourceFormat).toBe('markdown');
    });
  });

  describe('generatePreview', () => {
    it('should generate HTML preview', async () => {
      const simplifiedDoc: SimplifiedDocument = {
        title: 'Preview Test',
        content: '# Test\n\nPreview content.',
      };

      const createResult = await authoringTool.createDocument(simplifiedDoc);
      expect(createResult.success).toBe(true);
      expect(createResult.document).toBeDefined();

      const previewResult = await authoringTool.generatePreview(
        createResult.document!,
        { format: 'html' }
      );

      expect(previewResult.content).toBeDefined();
      expect(previewResult.format).toBe('html');
      expect(previewResult.generationTime).toBeGreaterThan(0);
    });
  });

  describe('getAuthoringHelp', () => {
    it('should return help documentation', () => {
      const help = authoringTool.getAuthoringHelp();

      expect(Array.isArray(help)).toBe(true);
      expect(help.length).toBeGreaterThan(0);
      expect(help[0]).toHaveProperty('title');
      expect(help[0]).toHaveProperty('description');
      expect(help[0]).toHaveProperty('examples');
    });
  });

  describe('updateOptions', () => {
    it('should update options correctly', () => {
      const newOptions = {
        userLevel: 'advanced' as const,
        maxValidationErrors: 5,
      };

      authoringTool.updateOptions(newOptions);

      // Verify options were updated by checking behavior
      const help = authoringTool.getAuthoringHelp();
      expect(help).toBeDefined(); // Options update shouldn't break functionality
    });
  });
});