/**
 * Tests for Word Converter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WordConverter } from '../word-converter.js';
import type { XatsDocument } from '@xats-org/types';

describe('WordConverter', () => {
  let converter: WordConverter;
  let sampleDocument: XatsDocument;

  beforeEach(() => {
    converter = new WordConverter();
    sampleDocument = {
      schemaVersion: '0.5.0',
      bibliographicEntry: {
        type: 'book',
        title: 'Test Document',
        author: [{ literal: 'Test Author' }],
      },
      subject: 'Testing',
      bodyMatter: {
        contents: [
          {
            id: 'chapter-1',
            label: '1',
            title: {
              runs: [{ type: 'text', text: 'Introduction' }],
            },
            contents: [
              {
                id: 'block-1',
                blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                content: {
                  text: {
                    runs: [{ type: 'text', text: 'This is a test paragraph.' }],
                  },
                },
              },
            ],
          },
        ],
      },
    };
  });

  describe('render', () => {
    it('should render xats document to Word format', async () => {
      const result = await converter.render(sampleDocument);

      expect(result.content).toBeTruthy();
      expect(result.metadata.format).toBe('docx');
      expect(result.metadata.renderTime).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle empty document', async () => {
      const emptyDoc: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Empty Document',
        },
        subject: 'Empty',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await converter.render(emptyDoc);

      expect(result.content).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });

    it('should apply custom options', async () => {
      const options = {
        author: 'Custom Author',
        documentTitle: 'Custom Title',
        typography: {
          defaultFont: 'Times New Roman',
          fontSize: 24,
        },
      };

      const result = await converter.render(sampleDocument, options);

      expect(result.content).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('parse', () => {
    it('should handle invalid base64 content', async () => {
      const result = await converter.parse('invalid-base64');

      expect(result.document).toBeDefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].type).toBe('malformed-content');
    });

    it('should create empty document on parse failure', async () => {
      const result = await converter.parse('invalid-content');

      expect(result.document.schemaVersion).toBe('0.5.0');
      expect(result.document.bodyMatter.contents).toHaveLength(0);
      expect(result.metadata.fidelityScore).toBe(0);
    });
  });

  describe('validate', () => {
    it('should reject invalid base64 content', async () => {
      const result = await converter.validate('invalid-base64');

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_DOCX');
    });

    it('should reject non-DOCX content', async () => {
      // Create a valid base64 string that's not a DOCX file
      const invalidDocx = Buffer.from('not a docx file').toString('base64');
      const result = await converter.validate(invalidDocx);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('testRoundTrip', () => {
    it('should perform basic round-trip test', async () => {
      const result = await converter.testRoundTrip(sampleDocument);

      expect(result.success).toBeDefined();
      expect(result.fidelityScore).toBeGreaterThanOrEqual(0);
      expect(result.fidelityScore).toBeLessThanOrEqual(1);
      expect(result.contentFidelity).toBeGreaterThanOrEqual(0);
      expect(result.formattingFidelity).toBeGreaterThanOrEqual(0);
      expect(result.structureFidelity).toBeGreaterThanOrEqual(0);
      expect(result.metrics.renderTime).toBeGreaterThan(0);
    });

    it('should identify fidelity issues', async () => {
      const result = await converter.testRoundTrip(sampleDocument);

      expect(result.issues).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('should handle round-trip failure gracefully', async () => {
      // Test with a document that might cause conversion issues
      const problematicDoc: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Problematic Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'block-1',
              blockType: 'https://xats.org/vocabularies/blocks/unknown-type',
              content: {
                someProperty: 'value',
              },
            } as any,
          ],
        },
      };

      const result = await converter.testRoundTrip(problematicDoc);

      expect(result.success).toBeDefined();
      expect(result.fidelityScore).toBeGreaterThanOrEqual(0);
      expect(result.metrics).toBeDefined();
    });
  });

  describe('getMetadata', () => {
    it('should handle invalid content gracefully', async () => {
      const result = await converter.getMetadata('invalid-content');

      expect(result.format).toBe('docx');
      expect(result.customProperties).toBeDefined();
      expect(result.customProperties?.error).toBeTruthy();
    });
  });

  describe('format property', () => {
    it('should have correct format identifier', () => {
      expect(converter.format).toBe('docx');
    });

    it('should have null WCAG level', () => {
      expect(converter.wcagLevel).toBeNull();
    });
  });
});

// Integration tests
describe('WordConverter Integration', () => {
  let converter: WordConverter;

  beforeEach(() => {
    converter = new WordConverter();
  });

  it('should handle complex document structure', async () => {
    const complexDocument: XatsDocument = {
      schemaVersion: '0.5.0',
      bibliographicEntry: {
        type: 'book',
        title: 'Complex Academic Textbook',
        author: [{ literal: 'Dr. Academic Author' }],
        publisher: 'Academic Press',
        issued: { 'date-parts': [[2024]] },
      },
      subject: 'Mathematics',
      frontMatter: {
        preface: [
          {
            id: 'preface-1',
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              text: {
                runs: [
                  { type: 'text', text: 'This textbook provides a comprehensive introduction to ' },
                  { type: 'emphasis', text: 'advanced mathematics' },
                  { type: 'text', text: ' for undergraduate students.' },
                ],
              },
            },
          },
        ],
      },
      bodyMatter: {
        contents: [
          {
            id: 'unit-1',
            label: '1',
            title: {
              runs: [{ type: 'text', text: 'Foundations' }],
            },
            contents: [
              {
                id: 'chapter-1',
                label: '1',
                title: {
                  runs: [{ type: 'text', text: 'Basic Concepts' }],
                },
                learningObjectives: [
                  {
                    id: 'lo-1',
                    description: {
                      runs: [{ type: 'text', text: 'Understand fundamental mathematical concepts' }],
                    },
                  },
                ],
                contents: [
                  {
                    id: 'section-1-1',
                    label: '1.1',
                    title: {
                      runs: [{ type: 'text', text: 'Introduction to Sets' }],
                    },
                    contents: [
                      {
                        id: 'para-1',
                        blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                        content: {
                          text: {
                            runs: [
                              { type: 'text', text: 'A ' },
                              { type: 'strong', text: 'set' },
                              { type: 'text', text: ' is a collection of distinct objects.' },
                            ],
                          },
                        },
                      },
                      {
                        id: 'math-1',
                        blockType: 'https://xats.org/vocabularies/blocks/mathBlock',
                        content: {
                          math: 'A = \\{1, 2, 3, 4, 5\\}',
                          displayMode: true,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      backMatter: {
        glossary: [
          {
            id: 'glossary-1',
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              text: {
                runs: [
                  { type: 'strong', text: 'Set: ' },
                  { type: 'text', text: 'A collection of distinct mathematical objects.' },
                ],
              },
            },
          },
        ],
      },
    };

    const result = await converter.render(complexDocument, {
      productionMode: true,
      includeTableOfContents: true,
      includeBibliography: true,
      typography: {
        defaultFont: 'Times New Roman',
        fontSize: 24,
        headingFonts: {
          1: { font: 'Times New Roman', size: 36, bold: true, color: '000080' },
          2: { font: 'Times New Roman', size: 30, bold: true, color: '000080' },
          3: { font: 'Times New Roman', size: 26, bold: true, color: '000080' },
        },
      },
    });

    expect(result.content).toBeTruthy();
    expect(result.errors).toHaveLength(0);
    expect(result.metadata.wordCount).toBeGreaterThan(0);
  });
});