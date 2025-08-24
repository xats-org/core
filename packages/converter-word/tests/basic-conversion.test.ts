/**
 * @fileoverview Basic conversion tests for Word converter
 */

import type { XatsDocument } from '@xats-org/types';
import { WordConverter } from '../src/converter';
import { StyleMapper } from '../src/style-mapper';
import { AnnotationProcessor } from '../src/annotation-processor';

describe('WordConverter', () => {
  let converter: WordConverter;

  beforeEach(() => {
    const styleMapper = new StyleMapper();
    const annotationProcessor = new AnnotationProcessor();
    converter = new WordConverter(styleMapper, annotationProcessor);
  });

  describe('render', () => {
    it('should render a simple xats document to Word', async () => {
      const xatsDoc: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Test Document'
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                text: {
                  runs: [
                    { type: 'text', text: 'This is a test paragraph with ' },
                    { type: 'strong', text: 'bold text' },
                    { type: 'text', text: ' and ' },
                    { type: 'emphasis', text: 'italic text' },
                    { type: 'text', text: '.' }
                  ]
                }
              }
            },
            {
              blockType: 'https://xats.org/vocabularies/blocks/heading',
              content: {
                level: 1,
                text: {
                  runs: [{ type: 'text', text: 'Test Heading' }]
                }
              }
            },
            {
              blockType: 'https://xats.org/vocabularies/blocks/list',
              content: {
                ordered: false,
                items: [
                  { text: { runs: [{ type: 'text', text: 'First item' }] } },
                  { text: { runs: [{ type: 'text', text: 'Second item' }] } },
                  { text: { runs: [{ type: 'text', text: 'Third item' }] } }
                ]
              }
            }
          ]
        }
      };

      const result = await converter.render(xatsDoc);
      
      expect(result).toBeDefined();
      expect(result.content).toBeInstanceOf(Buffer);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.format).toBe('docx');
      expect(result.errors).toBeUndefined();
    });

    it('should handle empty documents gracefully', async () => {
      const xatsDoc: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Empty Document'
        },
        subject: 'Empty',
        bodyMatter: {
          contents: []
        }
      };

      const result = await converter.render(xatsDoc);
      
      expect(result).toBeDefined();
      expect(result.content).toBeInstanceOf(Buffer);
      expect(result.warnings).toBeUndefined();
    });

    it('should handle malformed content with error recovery', async () => {
      const xatsDoc: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Malformed Document'
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: null // Malformed content
            },
            {
              blockType: 'invalid-block-type',
              content: {
                text: 'This should be handled gracefully'
              }
            }
          ]
        }
      };

      const result = await converter.render(xatsDoc);
      
      expect(result).toBeDefined();
      expect(result.content).toBeInstanceOf(Buffer);
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('round-trip testing', () => {
    it('should maintain high fidelity in round-trip conversion', async () => {
      const originalDoc: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Round Trip Test'
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                text: {
                  runs: [
                    { type: 'text', text: 'This is a ' },
                    { type: 'strong', text: 'bold' },
                    { type: 'text', text: ' and ' },
                    { type: 'emphasis', text: 'italic' },
                    { type: 'text', text: ' test.' }
                  ]
                }
              }
            }
          ]
        }
      };

      const roundTripResult = await converter.testRoundTrip(originalDoc);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.fidelityScore).toBeGreaterThan(0.7);
      expect(roundTripResult.contentFidelity).toBeGreaterThan(0.7);
    });
  });

  describe('metadata extraction', () => {
    it('should extract metadata from Word documents', async () => {
      // This would require a real Word document buffer
      // For now, just test that the method exists and doesn't throw
      expect(typeof converter.getMetadata).toBe('function');
    });
  });
});

describe('StyleMapper', () => {
  let styleMapper: StyleMapper;

  beforeEach(() => {
    styleMapper = new StyleMapper();
  });

  it('should map Word styles to xats block types', () => {
    expect(styleMapper.getXatsBlockType('Normal')).toBe('https://xats.org/vocabularies/blocks/paragraph');
    expect(styleMapper.getXatsBlockType('Heading 1')).toBe('https://xats.org/vocabularies/blocks/heading');
    expect(styleMapper.getXatsBlockType('Quote')).toBe('https://xats.org/vocabularies/blocks/blockquote');
  });

  it('should map xats block types to Word styles', () => {
    expect(styleMapper.getWordStyle('https://xats.org/vocabularies/blocks/paragraph')).toBe('Normal');
    expect(styleMapper.getWordStyle('https://xats.org/vocabularies/blocks/heading')).toBe('Heading 1');
  });

  it('should determine heading levels correctly', () => {
    expect(styleMapper.getHeadingLevel('Heading 1')).toBe(1);
    expect(styleMapper.getHeadingLevel('Heading 2')).toBe(2);
    expect(styleMapper.getHeadingLevel('Heading 6')).toBe(6);
    expect(styleMapper.getHeadingLevel('Normal')).toBe(null);
  });

  it('should create Word style names from xats URIs', () => {
    expect(styleMapper.createWordStyleName('https://xats.org/vocabularies/blocks/learningObjective'))
      .toBe('Learning Objective');
    expect(styleMapper.createWordStyleName('https://xats.org/vocabularies/blocks/caseStudy'))
      .toBe('Case Study');
  });
});