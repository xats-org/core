/**
 * LaTeX Renderer Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { LaTeXRenderer } from '../src/index.js';

import type { XatsDocument } from '@xats-org/types';

describe('LaTeXRenderer', () => {
  let renderer: LaTeXRenderer;

  beforeEach(() => {
    renderer = new LaTeXRenderer();
  });

  describe('Basic Rendering', () => {
    it('should render a simple document', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
          author: 'Test Author',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              unitType: 'lesson',
              title: {
                runs: [{ runType: 'text', text: 'Introduction' }],
              },
              contents: [
                {
                  blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                  content: {
                    runs: [{ runType: 'text', text: 'This is a test paragraph.' }],
                  },
                },
              ],
            },
          ],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('\\documentclass{article}');
      expect(result.content).toContain('\\title{Test Document}');
      expect(result.content).toContain('\\author{Test Author}');
      expect(result.content).toContain('\\begin{document}');
      expect(result.content).toContain('\\end{document}');
      expect(result.content).toContain('This is a test paragraph.');
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
      expect(result.content).toContain('\\usepackage{hyperref}');
    });
  });

  describe('Content Block Rendering', () => {
    it('should render paragraph blocks', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              unitType: 'lesson',
              title: {
                runs: [{ runType: 'text', text: 'Test Unit' }],
              },
              contents: [
                {
                  blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                  content: {
                    runs: [
                      { runType: 'text', text: 'This is ' },
                      { runType: 'emphasis', runs: [{ runType: 'text', text: 'emphasized' }] },
                      { runType: 'text', text: ' text.' },
                    ],
                  },
                },
              ],
            },
          ],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('This is \\emph{emphasized} text.');
    });

    it('should render math blocks', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Math Test',
        },
        subject: 'Mathematics',
        bodyMatter: {
          contents: [
            {
              unitType: 'lesson',
              title: {
                runs: [{ runType: 'text', text: 'Math Test' }],
              },
              contents: [
                {
                  blockType: 'https://xats.org/vocabularies/blocks/mathBlock',
                  content: 'E = mc^2',
                  id: 'equation:einstein',
                  renderingHints: [{ hintType: 'numbered', value: true }],
                },
              ],
            },
          ],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('\\begin{equation}');
      expect(result.content).toContain('E = mc^2');
      expect(result.content).toContain('\\label{equation:einstein}');
      expect(result.content).toContain('\\end{equation}');
    });

    it('should render citations', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Citation Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              unitType: 'lesson',
              title: {
                runs: [{ runType: 'text', text: 'Citation Test' }],
              },
              contents: [
                {
                  blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                  content: {
                    runs: [
                      { runType: 'text', text: 'As stated in ' },
                      { runType: 'citation', citationKey: 'smith2023' },
                      { runType: 'text', text: ', this is important.' },
                    ],
                  },
                },
              ],
            },
          ],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('As stated in \\cite{smith2023}, this is important.');
    });
  });

  describe('LaTeX Escaping', () => {
    it('should escape special LaTeX characters', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Special Characters: $, &, %, #, ^, _, {, }, ~, \\',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              unitType: 'lesson',
              title: {
                runs: [{ runType: 'text', text: 'Special Characters Test' }],
              },
              contents: [
                {
                  blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                  content: {
                    runs: [
                      {
                        runType: 'text',
                        text: 'Cost: $50 & 25% tax #1 item^2 file_name {group} ~home \\path',
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('\\$');
      expect(result.content).toContain('\\&');
      expect(result.content).toContain('\\%');
      expect(result.content).toContain('\\#');
      expect(result.content).toContain('\\_');
      expect(result.content).toContain('\\{');
      expect(result.content).toContain('\\}');
    });
  });

  describe('Options Handling', () => {
    it('should include natbib when requested', async () => {
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

      const result = await renderer.render(document, { useNatbib: true });

      expect(result.content).toContain('\\usepackage{natbib}');
    });

    it('should include biblatex when requested', async () => {
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

      const result = await renderer.render(document, {
        useBiblatex: true,
        citationStyle: 'apa',
      });

      expect(result.content).toContain('\\usepackage[style=apa]{biblatex}');
    });

    it('should handle custom packages', async () => {
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

      const result = await renderer.render(document, {
        packages: [
          { name: 'tikz', required: true },
          { name: 'algorithm2e', options: ['ruled', 'vlined'] },
        ],
      });

      expect(result.content).toContain('\\usepackage{tikz}');
      expect(result.content).toContain('\\usepackage[ruled,vlined]{algorithm2e}');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid documents gracefully', async () => {
      const invalidDocument = {} as XatsDocument;

      const result = await renderer.render(invalidDocument);

      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.content).toBe('');
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
});
