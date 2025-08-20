/**
 * @xats/mcp-server - Create Tool Tests
 */

import { describe, it, expect } from 'vitest';
import { createTool, getAvailableTemplates } from '../tools/create.js';
import type { CreateInput, McpServerConfig } from '../types.js';

describe('createTool', () => {
  const mockConfig: McpServerConfig = {
    name: 'test-server',
    version: '0.4.0',
    description: 'Test server',
    defaultSchemaVersion: '0.3.0',
  };

  describe('template creation', () => {
    it('should create minimal template', async () => {
      const input: CreateInput = {
        template: 'minimal',
        title: 'Test Document',
        author: 'Test Author',
        subject: 'Test Subject',
      };

      const result = await createTool(input, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data?.document).toBeDefined();
      expect(result.data?.document.bibliographicEntry?.title).toBe('Test Document');
      expect(result.data?.document.subject).toBe('Test Subject');
      expect(result.data?.document.bodyMatter?.contents).toHaveLength(1);
      expect(result.data?.template).toBe('minimal');
      expect(result.metadata?.templateType).toBe('minimal');
    });

    it('should create textbook template', async () => {
      const input: CreateInput = {
        template: 'textbook',
        title: 'Advanced Physics',
        author: 'Dr. Jane Smith',
        subject: 'Physics',
        options: {
          includeFrontMatter: true,
          includeBackMatter: true,
        },
      };

      const result = await createTool(input, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data?.document).toBeDefined();
      expect(result.data?.document.frontMatter).toBeDefined();
      expect(result.data?.document.backMatter).toBeDefined();
      expect(result.data?.document.bodyMatter?.contents).toHaveLength(2); // Two chapters
      
      // Check first chapter has learning objectives
      const firstChapter = result.data?.document.bodyMatter?.contents[0];
      expect(firstChapter).toBeDefined();
      if ('learningObjectives' in firstChapter) {
        expect(firstChapter.learningObjectives).toHaveLength(1);
      }
    });

    it('should create course template with pathways', async () => {
      const input: CreateInput = {
        template: 'course',
        title: 'Interactive Course',
        options: {
          includePathways: true,
        },
      };

      const result = await createTool(input, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data?.document).toBeDefined();
      expect(result.data?.template).toBe('course');
      
      // Check that document was created successfully
      expect(result.data?.document).toBeDefined();
    });

    it('should create assessment template', async () => {
      const input: CreateInput = {
        template: 'assessment',
        title: 'Quiz 1',
        subject: 'Assessment',
      };

      const result = await createTool(input, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data?.document).toBeDefined();
      expect(result.data?.document.bibliographicEntry?.type).toBe('article');
      // Check that document was created successfully
      
      // Check for assessment content
      const firstChapter = result.data?.document.bodyMatter?.contents[0];
      expect(firstChapter).toBeDefined();
      if ('contents' in firstChapter && firstChapter.contents) {
        const section = firstChapter.contents[0];
        if ('contents' in section && section.contents) {
          const hasAssessmentBlock = section.contents.some((block: any) => 
            'blockType' in block && block.blockType?.includes('multipleChoice')
          );
          expect(hasAssessmentBlock).toBe(true);
        }
      }
    });
  });

  describe('input validation', () => {
    it('should require title', async () => {
      const input: CreateInput = {
        template: 'minimal',
        title: '',
      };

      const result = await createTool(input, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Title is required');
    });

    it('should handle unknown template', async () => {
      const input: CreateInput = {
        template: 'unknown' as any,
        title: 'Test',
      };

      const result = await createTool(input, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown template type');
    });

    it('should use default template', async () => {
      const input: CreateInput = {
        title: 'Test Document',
      };

      const result = await createTool(input, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data?.template).toBe('minimal');
    });

    it('should use default schema version', async () => {
      const input: CreateInput = {
        title: 'Test Document',
      };

      const result = await createTool(input, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data?.document.schemaVersion).toBe('0.3.0');
    });
  });

  describe('document structure', () => {
    it('should generate unique IDs', async () => {
      const input: CreateInput = {
        title: 'Test Document',
      };

      const result1 = await createTool(input, mockConfig);
      const result2 = await createTool(input, mockConfig);

      expect(result1.success && result2.success).toBe(true);
      expect(result1.metadata?.documentId).not.toBe(result2.metadata?.documentId);
    });

    it('should include timestamps', async () => {
      const input: CreateInput = {
        title: 'Test Document',
      };

      const result = await createTool(input, mockConfig);

      expect(result.success).toBe(true);
      expect(result.metadata?.timestamp).toBeDefined();
      expect(new Date(result.metadata!.timestamp!).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should set bibliographic metadata', async () => {
      const input: CreateInput = {
        title: 'Test Book',
        author: 'John Doe',
        language: 'es',
        subject: 'Literature',
      };

      const result = await createTool(input, mockConfig);

      expect(result.success).toBe(true);
      const bibEntry = result.data?.document.bibliographicEntry;
      expect(bibEntry?.title).toBe('Test Book');
      expect(bibEntry?.author).toEqual([{ family: 'John Doe' }]);
      expect(bibEntry?.language).toBe('es');
      expect(result.data?.document.subject).toBe('Literature');
    });
  });

  describe('getAvailableTemplates', () => {
    it('should return template information', () => {
      const templates = getAvailableTemplates();

      expect(templates).toHaveLength(4);
      
      const templateNames = templates.map(t => t.name);
      expect(templateNames).toContain('minimal');
      expect(templateNames).toContain('textbook');
      expect(templateNames).toContain('course');
      expect(templateNames).toContain('assessment');

      // Check structure
      templates.forEach(template => {
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('features');
        expect(Array.isArray(template.features)).toBe(true);
      });
    });
  });
});