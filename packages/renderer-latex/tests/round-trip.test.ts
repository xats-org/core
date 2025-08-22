/**
 * LaTeX Round-trip Tests
 * 
 * Tests bidirectional conversion fidelity
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LaTeXRenderer } from '../src/renderer.js';
import type { XatsDocument } from '@xats-org/types';

describe('LaTeX Round-trip Tests', () => {
  let renderer: LaTeXRenderer;

  beforeEach(() => {
    renderer = new LaTeXRenderer();
  });

  describe('Basic Round-trip', () => {
    it('should preserve simple document structure', async () => {
      const originalDocument: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Round-trip Test Document',
          author: 'Test Author',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [{
            unitType: 'lesson',
            title: {
              runs: [{ runType: 'text', text: 'Introduction' }],
            },
            contents: [{
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [{ runType: 'text', text: 'This is a test paragraph for round-trip conversion.' }],
              },
            }],
          }],
        },
      };

      const roundTripResult = await renderer.testRoundTrip(originalDocument, {
        fidelityThreshold: 0.90,
      });

      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.fidelityScore).toBeGreaterThan(0.90);
      
      // Check that key properties are preserved
      expect(roundTripResult.roundTrip.bibliographicEntry.title).toBe(originalDocument.bibliographicEntry.title);
      expect(roundTripResult.roundTrip.subject).toBe(originalDocument.subject);
    });

    it('should preserve text formatting', async () => {
      const originalDocument: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Formatting Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [{
            unitType: 'lesson',
            title: {
              runs: [{ runType: 'text', text: 'Formatting Test' }],
            },
            contents: [{
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [
                  { runType: 'text', text: 'This text has ' },
                  { runType: 'emphasis', runs: [{ runType: 'text', text: 'emphasis' }] },
                  { runType: 'text', text: ' and ' },
                  { runType: 'strong', runs: [{ runType: 'text', text: 'strong' }] },
                  { runType: 'text', text: ' formatting.' },
                ],
              },
            }],
          }],
        },
      };

      const roundTripResult = await renderer.testRoundTrip(originalDocument, {
        fidelityThreshold: 0.85,
      });

      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.fidelityScore).toBeGreaterThan(0.85);
    });

    it('should preserve math content', async () => {
      const originalDocument: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Math Test',
        },
        subject: 'Mathematics',
        bodyMatter: {
          contents: [{
            unitType: 'lesson',
            title: {
              runs: [{ runType: 'text', text: 'Math Test' }],
            },
            contents: [
              {
                blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                content: {
                  runs: [{ runType: 'text', text: 'Einstein\'s famous equation:' }],
                },
              },
              {
                blockType: 'https://xats.org/vocabularies/blocks/mathBlock',
                content: 'E = mc^2',
                id: 'eq:einstein',
                renderingHints: [{ hintType: 'numbered', value: true }],
              },
            ],
          }],
        },
      };

      const roundTripResult = await renderer.testRoundTrip(originalDocument, {
        fidelityThreshold: 0.90,
      });

      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.fidelityScore).toBeGreaterThan(0.90);
    });

    it('should preserve citations', async () => {
      const originalDocument: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Citation Test',
        },
        subject: 'Research',
        bodyMatter: {
          contents: [{
            unitType: 'lesson',
            title: {
              runs: [{ runType: 'text', text: 'Citation Test' }],
            },
            contents: [{
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [
                  { runType: 'text', text: 'As demonstrated by ' },
                  { runType: 'citation', citationKey: 'smith2023' },
                  { runType: 'text', text: ' and ' },
                  { runType: 'citation', citationKey: 'doe2024' },
                  { runType: 'text', text: ', this approach is effective.' },
                ],
              },
            }],
          }],
        },
      };

      const roundTripResult = await renderer.testRoundTrip(originalDocument, {
        fidelityThreshold: 0.85,
      });

      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.fidelityScore).toBeGreaterThan(0.85);
    });
  });

  describe('Complex Document Round-trip', () => {
    it('should handle hierarchical structure', async () => {
      const complexDocument: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Complex Document Structure',
          author: ['First Author', 'Second Author'],
        },
        subject: 'Computer Science',
        frontMatter: {
          contents: [{
            blockType: 'https://xats.org/vocabularies/placeholders/tableOfContents',
          }],
        },
        bodyMatter: {
          contents: [
            {
              chapterType: 'main',
              title: { runs: [{ runType: 'text', text: 'Introduction' }] },
              label: 'ch:intro',
              contents: [
                {
                  sectionType: 'primary',
                  title: { runs: [{ runType: 'text', text: 'Overview' }] },
                  label: 'sec:overview',
                  contents: [{
                    blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                    content: {
                      runs: [
                        { runType: 'text', text: 'This chapter provides an overview. See ' },
                        { runType: 'reference', targetId: 'ch:methods' },
                        { runType: 'text', text: ' for details.' },
                      ],
                    },
                  }],
                },
              ],
            },
            {
              chapterType: 'main',
              title: { runs: [{ runType: 'text', text: 'Methods' }] },
              label: 'ch:methods',
              contents: [{
                blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                content: {
                  runs: [{ runType: 'text', text: 'Methods are described here.' }],
                },
              }],
            },
          ],
        },
        backMatter: {
          contents: [{
            blockType: 'https://xats.org/vocabularies/placeholders/bibliography',
          }],
        },
      };

      const roundTripResult = await renderer.testRoundTrip(complexDocument, {
        fidelityThreshold: 0.80,
        semanticComparison: true,
      });

      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.fidelityScore).toBeGreaterThan(0.80);
    });
  });

  describe('Performance and Metrics', () => {
    it('should complete round-trip within reasonable time', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Performance Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [{
            unitType: 'lesson',
            title: {
              runs: [{ runType: 'text', text: 'Performance Test' }],
            },
            contents: Array.from({ length: 50 }, (_, i) => ({
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [{ runType: 'text', text: `This is paragraph ${i + 1} for performance testing.` }],
              },
            })),
          }],
        },
      };

      const startTime = Date.now();
      const roundTripResult = await renderer.testRoundTrip(document);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds max
      expect(roundTripResult.metrics.totalTime).toBeLessThan(10000);
      expect(roundTripResult.metrics.renderTime).toBeGreaterThan(0);
      expect(roundTripResult.metrics.parseTime).toBeGreaterThan(0);
    });

    it('should provide detailed difference analysis', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Difference Analysis Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [{
            unitType: 'lesson',
            title: {
              runs: [{ runType: 'text', text: 'Test Unit' }],
            },
            contents: [{
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [{ runType: 'text', text: 'Test content for difference analysis.' }],
              },
            }],
          }],
        },
      };

      const roundTripResult = await renderer.testRoundTrip(document);

      expect(roundTripResult.differences).toBeDefined();
      expect(Array.isArray(roundTripResult.differences)).toBe(true);
      
      // Should have minimal differences for simple content
      const criticalDifferences = roundTripResult.differences.filter(d => d.impact === 'critical');
      expect(criticalDifferences).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty document', async () => {
      const emptyDocument: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Empty Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const roundTripResult = await renderer.testRoundTrip(emptyDocument);

      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.fidelityScore).toBeGreaterThan(0.95);
    });

    it('should handle documents with special characters', async () => {
      const specialCharsDocument: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Special Characters: $, &, %, #, ^, _, {, }, ~, \\',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [{
            unitType: 'lesson',
            title: {
              runs: [{ runType: 'text', text: 'Special Characters' }],
            },
            contents: [{
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [{ runType: 'text', text: 'Special chars: $ & % # ^ _ { } ~ \\' }],
              },
            }],
          }],
        },
      };

      const roundTripResult = await renderer.testRoundTrip(specialCharsDocument, {
        fidelityThreshold: 0.90,
      });

      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.fidelityScore).toBeGreaterThan(0.90);
    });
  });
});