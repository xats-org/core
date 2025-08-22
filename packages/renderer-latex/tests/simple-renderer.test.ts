/**
 * Simple LaTeX Renderer Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { SimpleLaTeXRenderer } from '../src/simple-renderer.js';

import type { XatsDocument } from '@xats-org/types';

describe('SimpleLaTeXRenderer', () => {
  let renderer: SimpleLaTeXRenderer;

  beforeEach(() => {
    renderer = new SimpleLaTeXRenderer();
  });

  describe('Basic Rendering', () => {
    it('should render a simple document', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('\\documentclass{article}');
      expect(result.content).toContain('\\title{Test Document}');
      expect(result.content).toContain('\\begin{document}');
      expect(result.content).toContain('\\end{document}');
      expect(result.metadata?.format).toBe('latex');
    });

    it('should handle different document classes', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.render(document, { documentClass: 'book' });

      expect(result.content).toContain('\\documentclass{book}');
    });

    it('should include standard packages', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('\\usepackage[utf8]{inputenc}');
      expect(result.content).toContain('\\usepackage[T1]{fontenc}');
      expect(result.content).toContain('\\usepackage{amsmath}');
      expect(result.content).toContain('\\usepackage{graphicx}');
    });

    it('should handle author information', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
          author: 'Test Author',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('\\author{Test Author}');
    });

    it('should escape special LaTeX characters', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test & Title with $pecial characters',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('\\title{Test \\& Title with \\$pecial characters}');
    });
  });

  describe('Basic Parsing', () => {
    it('should parse a simple LaTeX document', async () => {
      const latexContent = `
\\documentclass{article}
\\title{Parsed Document}
\\author{Test Author}

\\begin{document}
\\maketitle
Test content
\\end{document}
      `.trim();

      const result = await renderer.parse(latexContent);

      expect(result.document.bibliographicEntry.title).toBe('Parsed Document');
      expect(result.document.schemaVersion).toBe('0.3.0');
      expect(result.metadata?.sourceFormat).toBe('latex');
      expect(result.metadata?.fidelityScore).toBeGreaterThan(0);
    });

    it('should handle missing title gracefully', async () => {
      const latexContent = `
\\documentclass{article}
\\begin{document}
Content without title
\\end{document}
      `.trim();

      const result = await renderer.parse(latexContent);

      expect(result.document.bibliographicEntry.title).toBe('Parsed Document');
      expect(result.errors).toHaveLength(0);
    });

    it('should handle parsing errors', async () => {
      const invalidLatex = 'invalid content';

      const result = await renderer.parse(invalidLatex);

      expect(result.errors).toBeDefined();
      expect(result.metadata?.fidelityScore).toBe(0);
    });
  });

  describe('Round-trip Testing', () => {
    it('should perform basic round-trip conversion', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Round-trip Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.testRoundTrip(document);

      expect(result.success).toBe(true);
      expect(result.fidelityScore).toBeGreaterThan(0.5);
      expect(result.original).toEqual(document);
      expect(result.roundTrip.bibliographicEntry.title).toBe('Round-trip Test');
    });

    it('should detect differences in round-trip', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Original Title',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.99, // High threshold to trigger failure
      });

      expect(result.differences).toBeDefined();
      expect(result.metrics.renderTime).toBeGreaterThan(0);
      expect(result.metrics.parseTime).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    it('should validate correct LaTeX', async () => {
      const validLatex = `
\\documentclass{article}
\\begin{document}
Content
\\end{document}
      `.trim();

      const result = await renderer.validate(validLatex);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing document class', async () => {
      const invalidLatex = `
\\begin{document}
Content
\\end{document}
      `.trim();

      const result = await renderer.validate(invalidLatex);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_DOCUMENT_CLASS')).toBe(true);
    });

    it('should detect missing document environment', async () => {
      const invalidLatex = `
\\documentclass{article}
Content without document environment
      `.trim();

      const result = await renderer.validate(invalidLatex);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_BEGIN_DOCUMENT')).toBe(true);
      expect(result.errors.some((e) => e.code === 'MISSING_END_DOCUMENT')).toBe(true);
    });
  });

  describe('Metadata Extraction', () => {
    it('should extract document metadata', async () => {
      const latexContent = `
\\documentclass[12pt]{report}
\\title{Test Document}
\\begin{document}
Content
\\end{document}
      `.trim();

      const metadata = await renderer.getMetadata(latexContent);

      expect(metadata.format).toBe('latex');
      expect(metadata.documentClass).toBe('report');
    });

    it('should default to article class', async () => {
      const latexContent = 'Simple content without document class';

      const metadata = await renderer.getMetadata(latexContent);

      expect(metadata.documentClass).toBe('article');
    });
  });

  describe('WCAG Compliance', () => {
    it('should indicate LaTeX is not directly accessible', async () => {
      const result = await renderer.testCompliance('content', 'AA');

      expect(result.compliant).toBe(false);
      expect(result.level).toBe('AA');
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toContain('not directly accessible');
    });

    it('should provide accessibility audit', async () => {
      const audit = await renderer.auditAccessibility('content');

      expect(audit.compliant).toBe(false);
      expect(audit.overallScore).toBe(0);
      expect(audit.testedAt).toBeInstanceOf(Date);
    });
  });

  describe('Format Properties', () => {
    it('should have correct format identifier', () => {
      expect(renderer.format).toBe('latex');
    });

    it('should indicate no direct WCAG compliance', () => {
      expect(renderer.wcagLevel).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle rendering errors gracefully', async () => {
      const invalidDocument = {} as XatsDocument;

      const result = await renderer.render(invalidDocument);

      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.content).toBe('');
    });

    it('should handle round-trip errors gracefully', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      // Force an error by mocking render to throw
      const originalRender = renderer.render;
      renderer.render = async () => {
        throw new Error('Test error');
      };

      const result = await renderer.testRoundTrip(document);

      expect(result.success).toBe(false);
      expect(result.fidelityScore).toBe(0);
      expect(result.differences[0].impact).toBe('critical');

      // Restore original method
      renderer.render = originalRender;
    });
  });
});
