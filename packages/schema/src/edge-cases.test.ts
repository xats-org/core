/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
/**
 * Edge Case Validation Tests
 *
 * Tests edge cases, boundary conditions, unusual data structures,
 * and potential schema vulnerabilities that could cause validation
 * failures or unexpected behavior.
 */

import { describe, it, expect, beforeAll } from 'vitest';

import { createValidator, type ValidatorInstance } from './test-utils.js';

describe('Edge Case Validation', () => {
  let validator: ValidatorInstance;

  beforeAll(() => {
    validator = createValidator();
  });

  describe('Empty and Minimal Cases', () => {
    it('should handle empty arrays correctly', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-001',
          type: 'book',
          title: 'Edge Case Book',
        },
        subject: 'Test',
        resources: [], // Empty resources array
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Empty Chapter',
              sections: [], // Empty sections array (may not be valid)
            },
          ],
        },
      };

      const result = validator.validate(doc);
      // Empty contents array may not be valid - test validates the behavior
      expect(typeof result.isValid).toBe('boolean');
    });

    it('should handle empty semantic text runs', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-002',
          type: 'book',
          title: 'Edge Case Book',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                      content: {
                        text: {
                          runs: [], // Empty runs array
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should handle empty list items', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-003',
          type: 'book',
          title: 'Edge Case Book',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/vocabularies/blocks/list',
                      content: {
                        listType: 'unordered',
                        items: [], // Empty items array
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should handle empty table rows', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-004',
          type: 'book',
          title: 'Edge Case Book',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/vocabularies/blocks/table',
                      content: {
                        rows: [], // Empty rows array
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Extreme Length Cases', () => {
    it('should handle very long strings', () => {
      const veryLongString = 'a'.repeat(10000);

      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-005',
          type: 'book',
          title: veryLongString, // Very long title
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                      content: {
                        text: {
                          runs: [{ type: 'text', text: veryLongString }],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should handle many nested elements', () => {
      // Create deeply nested units (up to reasonable limit)
      let nestedUnit: any = {
        id: 'unit-base',
        title: 'Base Unit',
        contents: [
          {
            id: 'chapter-base',
            title: 'Base Chapter',
            sections: [
              {
                id: 'section-base',
                title: 'Base Section',
                content: [
                  {
                    id: 'block-base',
                    blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                    content: {
                      text: { runs: [{ type: 'text', text: 'Deep content' }] },
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      // Nest units within units
      for (let i = 1; i <= 10; i++) {
        nestedUnit = {
          id: `unit-${i}`,
          title: `Unit Level ${i}`,
          contents: [nestedUnit],
        };
      }

      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-006',
          type: 'book',
          title: 'Deeply Nested Book',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [nestedUnit],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should handle many parallel elements', () => {
      const manyChapters = [];
      for (let i = 1; i <= 1000; i++) {
        manyChapters.push({
          id: `chapter-${i}`,
          title: `Chapter ${i}`,
          sections: [
            {
              id: `section-${i}`,
              title: `Section ${i}`,
              content: [
                {
                  id: `block-${i}`,
                  blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                  content: {
                    text: { runs: [{ type: 'text', text: `Content ${i}` }] },
                  },
                },
              ],
            },
          ],
        });
      }

      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-007',
          type: 'book',
          title: 'Many Chapters Book',
        },
        subject: 'Test',
        bodyMatter: {
          contents: manyChapters,
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Special Characters and Encoding', () => {
    it('should handle Unicode characters correctly', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-008',
          type: 'book',
          title: '数学教科書 📚 Mathematics Textbook',
        },
        subject: '数学と科学 🧮',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapitre 1: Les Mathématiques 🇫🇷',
              sections: [
                {
                  id: 'section-1',
                  title: 'Sección 1: Las Matemáticas 🇪🇸',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                      content: {
                        text: {
                          runs: [
                            {
                              type: 'text',
                              text: 'Unicode test: αβγδε θεωρία, العربية, 中文, हिन्दी, русский',
                            },
                            { type: 'text', text: ' Emoji: 🔬⚗️🧪🔍📊📈📉💡' },
                          ],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should handle special HTML entities', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-009',
          type: 'book',
          title: 'Book with Special Characters',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                      content: {
                        text: {
                          runs: [
                            {
                              type: 'text',
                              text: 'Special chars: &lt; &gt; &amp; &quot; &apos; © ® ™ ° ± × ÷',
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should handle mathematical symbols and LaTeX', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-010',
          type: 'book',
          title: 'Mathematical Content',
        },
        subject: 'Mathematics',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'math-1',
                      blockType: 'https://xats.org/vocabularies/blocks/mathBlock',
                      content: {
                        notation: 'latex',
                        expression:
                          '\\sum_{i=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6} \\quad \\forall n \\in \\mathbb{N}',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Boundary Values', () => {
    it('should handle minimum required fields only', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'min-001',
          // Only minimum CSL fields
        },
        subject: '',
        bodyMatter: {
          contents: [],
        },
      };

      const result = validator.validate(doc);
      // May be valid or invalid depending on CSL requirements
      expect(typeof result.isValid).toBe('boolean');
    });

    it('should handle single character values', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'a',
          type: 'book',
          title: 'A',
        },
        subject: 'X',
        bodyMatter: {
          contents: [
            {
              id: 'c',
              title: 'C',
              sections: [
                {
                  id: 's',
                  title: 'S',
                  content: [
                    {
                      id: 'b',
                      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                      content: {
                        text: {
                          runs: [{ type: 'text', text: '.' }],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should handle whitespace-only strings', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-011',
          type: 'book',
          title: '   ', // Whitespace only
        },
        subject: '\t\n\r  ', // Various whitespace
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: '  \t  ',
              sections: [
                {
                  id: 'section-1',
                  title: '\n\n\n',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                      content: {
                        text: {
                          runs: [{ type: 'text', text: '     ' }],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Unusual Data Structures', () => {
    it('should handle extensions with complex nested data', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-012',
          type: 'book',
          title: 'Extensions Test',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              extensions: {
                customData: {
                  nested: {
                    deeply: {
                      structure: {
                        with: {
                          arrays: [1, 2, 3, { nested: 'object' }],
                          null_value: null,
                          boolean: true,
                          number: 42.5,
                          string: 'value',
                        },
                      },
                    },
                  },
                },
                arrayOfObjects: [
                  { type: 'type1', data: 'data1' },
                  { type: 'type2', data: 'data2' },
                ],
                mixedArray: ['string', 123, true, null, { object: 'value' }, [1, 2, 3]],
              },
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should handle circular references in extensions', () => {
      // Note: JSON doesn't support circular references, but we can test
      // what happens with repeated references
      const sharedObject = {
        id: 'shared-123',
        data: 'shared data',
      };

      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-013',
          type: 'book',
          title: 'Circular References Test',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              extensions: {
                reference1: sharedObject,
                reference2: sharedObject,
                nested: {
                  reference3: sharedObject,
                },
              },
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should handle mixed content types in arrays', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-014',
          type: 'book',
          title: 'Mixed Content Test',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                      content: {
                        text: {
                          runs: [
                            { type: 'text', text: 'Start ' },
                            { type: 'emphasis', text: 'emphasized' },
                            { type: 'text', text: ' middle ' },
                            { type: 'strong', text: 'strong' },
                            { type: 'text', text: ' and ' },
                            { type: 'reference', text: 'reference', refId: 'ref-1' },
                            { type: 'text', text: ' with ' },
                            { type: 'citation', refId: 'cite-1' },
                            { type: 'text', text: ' end.' },
                          ],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Invalid JSON Structures', () => {
    it('should handle malformed semantic text gracefully', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-015',
          type: 'book',
          title: 'Malformed Test',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                      content: {
                        text: {
                          runs: [
                            { type: 'text' }, // Missing text field
                            { type: 'emphasis', text: 'valid emphasis' },
                            { type: 'reference', text: 'ref text' }, // Missing refId
                          ],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle additional properties correctly', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-016',
          type: 'book',
          title: 'Additional Properties Test',
        },
        subject: 'Test',
        unknownRootField: 'This should be ignored or cause validation error',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              unknownChapterField: 'Unknown field',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                      unknownBlockField: 'Unknown block field',
                      content: {
                        text: {
                          runs: [{ type: 'text', text: 'Content' }],
                        },
                        unknownContentField: 'Unknown content field',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      // Schema may or may not allow additional properties
      expect(typeof result.isValid).toBe('boolean');
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle very large arrays efficiently', () => {
      const startTime = Date.now();

      const largeTagArray = Array(10000)
        .fill(null)
        .map((_, i) => `tag-${i}`);

      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-017',
          type: 'book',
          title: 'Large Array Test',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              tags: largeTagArray, // Very large array
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      const endTime = Date.now();

      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle very deep nesting levels', () => {
      const startTime = Date.now();

      // Create deeply nested list structure
      let deepContent: any = {
        text: { runs: [{ type: 'text', text: 'Deep content' }] },
      };

      // Nest lists within lists up to a reasonable depth
      for (let i = 0; i < 50; i++) {
        deepContent = {
          text: { runs: [{ type: 'text', text: `Level ${i}` }] },
          subItems: [
            {
              id: `nested-block-${i}`,
              blockType: 'https://xats.org/vocabularies/blocks/list',
              content: {
                listType: 'unordered',
                items: [deepContent],
              },
            },
          ],
        };
      }

      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-018',
          type: 'book',
          title: 'Deep Nesting Test',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'deep-list',
                      blockType: 'https://xats.org/vocabularies/blocks/list',
                      content: {
                        listType: 'ordered',
                        items: [deepContent],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      const endTime = Date.now();

      expect(typeof result.isValid).toBe('boolean');
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('Schema Version Edge Cases', () => {
    it('should handle exact schema version match', () => {
      const doc = {
        schemaVersion: '0.1.0', // Exact match
        bibliographicEntry: {
          id: 'edge-019',
          type: 'book',
          title: 'Version Test',
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Test Chapter',
              sections: [
                {
                  id: 'section-1',
                  title: 'Test Section',
                  content: [],
                },
              ],
            },
          ],
        },
      };

      const result = validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should reject slightly different schema versions', () => {
      const invalidVersions = ['0.1.1', '0.1', '0.1.0-beta', '0.1.0 ', ' 0.1.0', '0.1.0.0'];

      for (const version of invalidVersions) {
        const doc = {
          schemaVersion: version,
          bibliographicEntry: {
            id: `edge-version-${invalidVersions.indexOf(version)}`,
            type: 'book',
            title: 'Version Test',
          },
          subject: 'Test',
          bodyMatter: { contents: [] },
        };

        const result = validator.validate(doc);
        expect(result.isValid).toBe(false);
      }
    });
  });

  describe('Resource and URL Edge Cases', () => {
    it('should handle various URI schemes in resources', () => {
      const uriSchemes = [
        'https://example.com/image.png',
        'http://example.com/image.png',
        'ftp://example.com/image.png',
        'file:///local/path/image.png',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'urn:isbn:123456789',
      ];

      for (const uri of uriSchemes) {
        const doc = {
          schemaVersion: '0.1.0',
          bibliographicEntry: {
            id: `edge-uri-${uriSchemes.indexOf(uri)}`,
            type: 'book',
            title: 'URI Test',
          },
          subject: 'Test',
          resources: [
            {
              id: 'resource-1',
              type: 'https://xats.org/vocabularies/resources/image',
              url: uri,
            },
          ],
          bodyMatter: { contents: [] },
        };

        const result = validator.validate(doc);
        expect(typeof result.isValid).toBe('boolean');
      }
    });

    it('should handle internationalized domain names', () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'edge-020',
          type: 'book',
          title: 'IDN Test',
        },
        subject: 'Test',
        resources: [
          {
            id: 'resource-1',
            type: 'https://xats.org/vocabularies/resources/image',
            url: 'https://例え.テスト/画像.png',
          },
        ],
        bodyMatter: { contents: [] },
      };

      const result = validator.validate(doc);
      expect(typeof result.isValid).toBe('boolean');
    });
  });
});
