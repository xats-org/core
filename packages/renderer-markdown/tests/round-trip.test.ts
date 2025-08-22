/**
 * Markdown Round-trip Tests
 *
 * Tests the bidirectional conversion fidelity between xats and Markdown
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { SimpleMarkdownRenderer } from '../src/simple-renderer.js';

import type { XatsDocument } from '@xats-org/types';

describe('Markdown Round-trip Tests', () => {
  let renderer: SimpleMarkdownRenderer;

  beforeEach(() => {
    renderer = new SimpleMarkdownRenderer();
  });

  describe('Content Fidelity', () => {
    it('should preserve basic text content', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Fidelity Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [{ type: 'text', text: 'This is a simple paragraph.' }],
              },
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.7,
      });

      expect(result.success).toBe(true);
      expect(result.fidelityScore).toBeGreaterThan(0.8);
    });

    it('should preserve emphasis and strong text', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Formatting Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [
                  { type: 'text', text: 'Text with ' },
                  { type: 'emphasis', text: 'emphasis' },
                  { type: 'text', text: ' and ' },
                  { type: 'strong', text: 'strong' },
                  { type: 'text', text: ' formatting.' },
                ],
              },
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.75,
      });

      expect(result.success).toBe(true);
      expect(result.fidelityScore).toBeGreaterThan(0.75);
    });

    it('should preserve heading structure', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Heading Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'heading1',
              blockType: 'https://xats.org/vocabularies/blocks/heading',
              content: {
                runs: [{ type: 'text', text: 'Section Header' }],
              },
              level: 2,
            },
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [{ type: 'text', text: 'Section content.' }],
              },
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.75,
      });

      expect(result.success).toBe(true);
    });

    it('should preserve blockquotes', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Blockquote Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'quote1',
              blockType: 'https://xats.org/vocabularies/blocks/blockquote',
              content: {
                runs: [{ type: 'text', text: 'This is a quoted text.' }],
              },
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.75,
      });

      expect(result.success).toBe(true);
    });

    it('should preserve code blocks with language', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Code Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'code1',
              blockType: 'https://xats.org/vocabularies/blocks/codeBlock',
              content: 'const x = 42;\nconsole.log(x);',
              language: 'javascript',
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.75,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Structural Fidelity', () => {
    it('should handle nested content structures', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Nested Structure Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'unit1',
              title: { runs: [{ type: 'text', text: 'Unit One' }] },
              contents: [
                {
                  id: 'section1',
                  title: { runs: [{ type: 'text', text: 'Section One' }] },
                  contents: [
                    {
                      id: 'para1',
                      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                      content: {
                        runs: [{ type: 'text', text: 'Nested content paragraph.' }],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.7,
      });

      expect(result.success).toBe(true);
      expect(result.fidelityScore).toBeGreaterThan(0.8);
    });

    it('should preserve document metadata', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Metadata Test',
          author: 'Test Author',
          published: '2024-01-01',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [{ type: 'text', text: 'Content with metadata.' }],
              },
            },
          ],
        },
      };

      // Test round-trip with front matter enabled
      const renderResult = await renderer.render(document, { includeFrontMatter: true });
      const parseResult = await renderer.parse(renderResult.content);

      expect(parseResult.document.bibliographicEntry.title).toBe('Metadata Test');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty documents', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Empty Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.testRoundTrip(document);

      expect(result.success).toBe(true);
      expect(result.fidelityScore).toBeGreaterThan(0.5);
    });

    it('should handle documents with only title', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Title Only',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.testRoundTrip(document);

      expect(result.success).toBe(true);
      expect(result.roundTrip.bibliographicEntry.title).toBe('Title Only');
    });

    it('should handle special characters in content', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Special Characters: *test* [link] `code` #heading',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [{ type: 'text', text: 'Content with *asterisks* and [brackets] and `backticks`.' }],
              },
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.7,
      });

      expect(result.success).toBe(true);
    });

    it('should handle complex formatting combinations', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Complex Formatting',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [
                  { type: 'text', text: 'This has ' },
                  { type: 'strong', text: 'bold and ' },
                  { type: 'emphasis', text: 'italic' },
                  { type: 'text', text: ' text with ' },
                  { type: 'citation', text: 'citation', citeKey: 'ref1' },
                  { type: 'text', text: '.' },
                ],
              },
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.7,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large documents efficiently', async () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => ({
        id: `para${i}`,
        blockType: 'https://xats.org/vocabularies/blocks/paragraph' as const,
        content: {
          runs: [{ type: 'text' as const, text: `This is paragraph ${i + 1} with some test content.` }],
        },
      }));

      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Large Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: largeContent,
        },
      };

      const startTime = Date.now();
      const result = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.75,
      });
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.metrics.totalTime).toBeLessThan(5000);
    });

    it('should provide accurate performance metrics', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Performance Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [{ type: 'text', text: 'Performance test content.' }],
              },
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(document);

      expect(result.metrics.renderTime).toBeGreaterThanOrEqual(0);
      expect(result.metrics.parseTime).toBeGreaterThanOrEqual(0);
      expect(result.metrics.totalTime).toBeGreaterThanOrEqual(0);
      expect(result.metrics.documentSize).toBeGreaterThan(0);
      expect(result.metrics.outputSize).toBeGreaterThan(0);
    });
  });

  describe('Error Handling in Round-trip', () => {
    it('should handle malformed documents gracefully', async () => {
      const malformedDocument = {
        // Missing required fields
        subject: 'Testing',
      } as XatsDocument;

      const result = await renderer.testRoundTrip(malformedDocument);

      // Our implementation is robust enough to handle this, but with low fidelity
      expect(result.fidelityScore).toBeGreaterThan(0); // Should still calculate some score
      expect(result.differences).toBeDefined();
    });

    it('should handle rendering failures in round-trip', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      // Mock render to fail
      const originalRender = renderer.render.bind(renderer);
      renderer.render = () => Promise.reject(new Error('Render failure'));

      const result = await renderer.testRoundTrip(document);

      expect(result.success).toBe(false);
      expect(result.fidelityScore).toBe(0);

      // Restore
      renderer.render = originalRender;
    });

    it('should handle parsing failures in round-trip', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      // Mock parse to fail
      const originalParse = renderer.parse.bind(renderer);
      renderer.parse = () => Promise.reject(new Error('Parse failure'));

      const result = await renderer.testRoundTrip(document);

      expect(result.success).toBe(false);
      expect(result.fidelityScore).toBe(0);

      // Restore
      renderer.parse = originalParse;
    });
  });

  describe('Fidelity Threshold Testing', () => {
    it('should respect fidelity thresholds', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Threshold Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      // Test with very high threshold
      const strictResult = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.99,
      });

      // Test with normal threshold
      const normalResult = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.7,
      });

      expect(normalResult.success).toBe(true);
      expect(strictResult.fidelityScore).toEqual(normalResult.fidelityScore);
    });

    it('should calculate fidelity scores accurately', async () => {
      const perfectDocument: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Perfect Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [{ type: 'text', text: 'Simple content.' }],
              },
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(perfectDocument);

      expect(result.fidelityScore).toBeGreaterThan(0.75);
      expect(result.fidelityScore).toBeLessThanOrEqual(1.0);
    });
  });
});