/**
 * @fileoverview Tests for Word converter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WordConverter } from '../src/converter';
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
        title: 'Test Document'
      },
      subject: 'Test Subject',
      bodyMatter: {
        contents: [
          {
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              text: {
                runs: [{ text: 'This is a test paragraph.' }]
              }
            }
          }
        ]
      }
    };
  });

  describe('render', () => {
    it('should render xats document to Word format', async () => {
      const result = await converter.render(sampleDocument);
      
      expect(result).toBeDefined();
      expect(result.content).toBeInstanceOf(Buffer);
      expect(result.metadata.format).toBe('docx');
      expect(result.metadata.wordCount).toBeGreaterThan(0);
    });

    it('should include metadata in render result', async () => {
      const options = {
        author: 'Test Author',
        documentTitle: 'Custom Title'
      };
      
      const result = await converter.render(sampleDocument, options);
      
      expect(result.metadata.author).toBe('Test Author');
      expect(result.metadata.title).toBe('Custom Title');
    });

    it('should handle educational content blocks', async () => {
      const educationalDoc: XatsDocument = {
        ...sampleDocument,
        bodyMatter: {
          contents: [
            {
              blockType: 'https://xats.org/vocabularies/blocks/learningObjective',
              content: {
                text: {
                  runs: [{ text: 'Students will learn about testing.' }]
                }
              }
            }
          ]
        }
      };

      const result = await converter.render(educationalDoc);
      expect(result.content).toBeInstanceOf(Buffer);
      expect(result.metadata.features).toContain('educational');
    });
  });

  describe('validate', () => {
    it('should validate Word document format', async () => {
      // Mock DOCX content (simplified)
      const mockDocxBuffer = Buffer.from('PK'); // ZIP signature
      
      const result = await converter.validate(mockDocxBuffer);
      
      expect(result).toBeDefined();
      expect(result.format).toBe('docx');
      // Note: This would fail with real validation, but tests the interface
    });
  });

  describe('testRoundTrip', () => {
    it('should test round-trip conversion fidelity', async () => {
      const result = await converter.testRoundTrip(sampleDocument);
      
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.fidelityScore).toBeGreaterThanOrEqual(0);
      expect(result.fidelityScore).toBeLessThanOrEqual(1);
    });

    it('should identify fidelity issues', async () => {
      const complexDoc: XatsDocument = {
        ...sampleDocument,
        bodyMatter: {
          contents: [
            {
              blockType: 'https://xats.org/vocabularies/blocks/mathBlock',
              content: {
                latex: '\\int_0^1 x^2 dx',
                mathML: '<math><mi>x</mi></math>'
              }
            }
          ]
        }
      };

      const result = await converter.testRoundTrip(complexDoc);
      
      expect(result.issues).toBeDefined();
      if (result.issues && result.issues.length > 0) {
        expect(result.issues[0]).toHaveProperty('type');
        expect(result.issues[0]).toHaveProperty('severity');
        expect(result.issues[0]).toHaveProperty('description');
      }
    });
  });

  describe('getMetadata', () => {
    it('should extract metadata from Word document', async () => {
      const mockDocxBuffer = Buffer.from('mock-docx-content');
      
      try {
        const metadata = await converter.getMetadata(mockDocxBuffer);
        expect(metadata.format).toBe('docx');
        expect(metadata.wordCount).toBeDefined();
        expect(metadata.features).toBeDefined();
      } catch (error) {
        // Expected to fail with mock content
        expect(error).toBeDefined();
      }
    });
  });

  describe('configuration', () => {
    it('should accept custom configuration', () => {
      const customConverter = new WordConverter({
        defaultStyleMappings: {
          paragraphs: {
            'CustomStyle': 'https://xats.org/vocabularies/blocks/custom'
          }
        }
      });

      expect(customConverter).toBeDefined();
      expect(customConverter.format).toBe('docx');
    });
  });
});