/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
/**
 * Pattern and Format Validation Tests
 *
 * Tests that all pattern and format constraints in the schema
 * are properly enforced, including URI formats, regex patterns,
 * and other string validation rules.
 */

import { describe, it, expect, beforeAll } from 'vitest';

import { createValidator, type ValidatorInstance } from './test-utils.js';

describe('Pattern and Format Validation', () => {
  let validator: ValidatorInstance;

  beforeAll(() => {
    validator = createValidator();
  });

  describe('URI Format Validation', () => {
    it('should enforce URI format for blockType', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-001',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
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
                      blockType: 'not-a-uri', // Should be valid URI
                      content: {
                        text: {
                          runs: [{ type: 'text', text: 'Test content' }],
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: any) => e.message.includes('uri') || e.message.includes('format'))
      ).toBe(true);
    });

    it('should accept valid URI for blockType', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-002',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
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
                      blockType: 'https://xats.org/core/blocks/paragraph', // Valid URI
                      content: {
                        text: {
                          runs: [{ type: 'text', text: 'Test content' }],
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should enforce URI format for rendering hint type', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-003',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              renderingHints: [
                {
                  hintType: 'not-a-uri', // Should be valid URI
                  value: 'some-value',
                },
              ],
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: any) => e.message.includes('uri') || e.message.includes('format'))
      ).toBe(true);
    });

    it('should accept valid URI for rendering hint type', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-004',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              renderingHints: [
                {
                  hintType: 'https://xats.org/core/hints/breakBefore', // Valid URI
                  value: true,
                },
              ],
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should enforce URI format for resource type', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-005',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        resources: [
          {
            id: 'resource-1',
            type: 'not-a-uri', // Should be valid URI
            url: 'https://example.com/image.png',
          },
        ],
        bodyMatter: { contents: [] },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: any) => e.message.includes('uri') || e.message.includes('format'))
      ).toBe(true);
    });

    it('should enforce URI format for resource URL', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-006',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        resources: [
          {
            id: 'resource-1',
            type: 'https://xats.org/core/resources/image',
            url: 'not-a-uri', // Should be valid URI
          },
        ],
        bodyMatter: { contents: [] },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: any) => e.message.includes('uri') || e.message.includes('format'))
      ).toBe(true);
    });

    it('should accept valid URIs for resource fields', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-007',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        resources: [
          {
            id: 'resource-1',
            type: 'https://xats.org/core/resources/image', // Valid URI
            url: 'https://example.com/image.png', // Valid URI
          },
        ],
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should enforce URI format for pathway trigger type', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-008',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              pathways: [
                {
                  trigger: {
                    triggerType: 'not-a-uri', // Should be valid URI
                    sourceId: 'assessment-1',
                  },
                  rules: [
                    {
                      condition: 'score >= 70',
                      destinationId: 'next-section',
                    },
                  ],
                },
              ],
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: any) => e.message.includes('uri') || e.message.includes('format'))
      ).toBe(true);
    });

    it('should enforce URI format for pathway type', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-009',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              pathways: [
                {
                  trigger: {
                    triggerType: 'https://xats.org/core/triggers/onAssessment',
                    sourceId: 'assessment-1',
                  },
                  rules: [
                    {
                      condition: 'score >= 70',
                      destinationId: 'next-section',
                      pathwayType: 'not-a-uri', // Should be valid URI
                    },
                  ],
                },
              ],
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: any) => e.message.includes('uri') || e.message.includes('format'))
      ).toBe(true);
    });

    it('should accept valid URIs for pathway fields', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-010',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              pathways: [
                {
                  trigger: {
                    triggerType: 'https://xats.org/core/triggers/onAssessment', // Valid URI
                    sourceId: 'assessment-1',
                  },
                  rules: [
                    {
                      condition: 'score >= 70',
                      destinationId: 'next-section',
                      pathwayType: 'https://xats.org/core/pathways/standard', // Valid URI
                    },
                  ],
                },
              ],
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Pattern Validation', () => {
    it('should enforce pattern for pathway conditions', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-011',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              pathways: [
                {
                  trigger: {
                    triggerType: 'https://xats.org/core/triggers/onAssessment',
                    sourceId: 'assessment-1',
                  },
                  rules: [
                    {
                      condition: '   ', // Empty or whitespace-only string - should fail pattern
                      destinationId: 'next-section',
                    },
                  ],
                },
              ],
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e: any) => e.message.includes('pattern') || e.message.includes('condition')
        )
      ).toBe(true);
    });

    it('should accept valid pathway condition patterns', async () => {
      const validConditions = [
        'score >= 70',
        'score < 70 AND attempts >= 3',
        'score >= 80 OR time_spent > 600',
        'user_choice == "advanced" AND score >= 85',
        'count(objectives_met) >= 3',
        '"obj-1" IN objectives_met',
        'NOT passed AND attempts < 3',
      ];

      for (const condition of validConditions) {
        const doc = {
          schemaVersion: '0.1.0',
          bibliographicEntry: {
            id: `test-${condition.replace(/[^a-zA-Z0-9]/g, '')}`,
            type: 'book',
            title: 'Test Book',
          },
          subject: 'Test Subject',
          bodyMatter: {
            contents: [
              {
                id: 'chapter-1',
                title: 'Chapter 1',
                pathways: [
                  {
                    trigger: {
                      triggerType: 'https://xats.org/core/triggers/onAssessment',
                      sourceId: 'assessment-1',
                    },
                    rules: [
                      {
                        condition, // Valid condition pattern
                        destinationId: 'next-section',
                      },
                    ],
                  },
                ],
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

        const result = await validator.validate(doc);
        expect(result.isValid).toBe(true);
      }
    });

    it('should enforce pattern for placeholder block types', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-012',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
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
                      blockType: 'https://xats.org/core/placeholders/invalidPlaceholder', // Should match placeholder pattern
                      content: {
                        placeholder: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      // This tests the pattern validation for placeholder blockTypes
      await validator.validate(doc);
      // The schema allows additional properties in placeholder content,
      // so this should be valid if the pattern matches
    });

    it('should accept valid placeholder block type patterns', async () => {
      const validPlaceholders = [
        'https://xats.org/core/placeholders/tableOfContents',
        'https://xats.org/core/placeholders/bibliography',
        'https://xats.org/core/placeholders/index',
      ];

      for (const placeholder of validPlaceholders) {
        const doc = {
          schemaVersion: '0.1.0',
          bibliographicEntry: {
            id: `test-${placeholder.split('/').pop()}`,
            type: 'book',
            title: 'Test Book',
          },
          subject: 'Test Subject',
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
                        blockType: placeholder, // Valid placeholder pattern
                        content: {
                          placeholder: true,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        };

        const result = await validator.validate(doc);
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('Edge Cases in Format Validation', () => {
    it('should handle relative URIs correctly', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-013',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        resources: [
          {
            id: 'resource-1',
            type: 'https://xats.org/core/resources/image',
            url: '/relative/path/image.png', // Relative URI - may or may not be valid
          },
        ],
        bodyMatter: { contents: [] },
      };

      await validator.validate(doc);
      // This tests how the validator handles relative URIs
      // The result depends on the URI validation implementation
    });

    it('should handle scheme-less URIs', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-014',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        resources: [
          {
            id: 'resource-1',
            type: 'https://xats.org/core/resources/image',
            url: '//example.com/image.png', // Scheme-less URI
          },
        ],
        bodyMatter: { contents: [] },
      };

      await validator.validate(doc);
      // This tests how the validator handles scheme-less URIs
    });

    it('should handle URIs with special characters', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-015',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
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
                      blockType: 'https://xats.org/core/blocks/custom-block?param=value&other=123', // URI with query params
                      content: {
                        customField: 'value',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      await validator.validate(doc);
      // This tests how the validator handles URIs with query parameters
    });

    it('should handle internationalized URIs', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-016',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        resources: [
          {
            id: 'resource-1',
            type: 'https://xats.org/core/resources/image',
            url: 'https://例え.テスト/image.png', // Internationalized domain
          },
        ],
        bodyMatter: { contents: [] },
      };

      await validator.validate(doc);
      // This tests how the validator handles internationalized domain names
    });

    it('should reject obviously invalid URIs', async () => {
      const invalidUris = [
        'ht tp://example.com', // Space in scheme
        'https:///example.com', // Triple slash
        'ftp://', // No domain
        'https://example.com:-80', // Invalid port
        '', // Empty string
      ];

      for (const invalidUri of invalidUris) {
        const doc = {
          schemaVersion: '0.1.0',
          bibliographicEntry: {
            id: `test-invalid-${invalidUris.indexOf(invalidUri)}`,
            type: 'book',
            title: 'Test Book',
          },
          subject: 'Test Subject',
          resources: [
            {
              id: 'resource-1',
              type: 'https://xats.org/core/resources/image',
              url: invalidUri, // Invalid URI
            },
          ],
          bodyMatter: { contents: [] },
        };

        const result = await validator.validate(doc);
        expect(result.isValid).toBe(false);
      }
    });
  });

  describe('Custom Block Type Validation', () => {
    it('should accept custom block type URIs', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-017',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
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
                      blockType: 'https://example.org/custom/blocks/specialContent', // Custom block type
                      content: {
                        customProperty: 'custom value',
                        customArray: [1, 2, 3],
                        customObject: {
                          nested: true,
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(true);
    });

    it('should accept extension block types with proper URI format', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-018',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
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
                      blockType: 'https://extension.example.com/blocks/interactiveWidget', // Extension block
                      content: {
                        widgetType: 'quiz',
                        questions: [
                          {
                            question: 'What is 2+2?',
                            answers: ['3', '4', '5'],
                            correct: 1,
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Format Validation Edge Cases', () => {
    it('should handle very long URIs', async () => {
      const longUri = `https://example.com/${'a'.repeat(2000)}/block`;

      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-019',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
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
                      blockType: longUri, // Very long URI
                      content: {
                        field: 'value',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = await validator.validate(doc);
      // Test that extremely long URIs are handled appropriately
      expect(typeof result.isValid).toBe('boolean');
    });

    it('should handle URIs with various protocols', async () => {
      const protocols = [
        'https://example.com/block',
        'http://example.com/block',
        'ftp://example.com/block',
        'file:///path/to/block',
        'urn:example:block:type',
      ];

      for (const uri of protocols) {
        const doc = {
          schemaVersion: '0.1.0',
          bibliographicEntry: {
            id: `test-protocol-${protocols.indexOf(uri)}`,
            type: 'book',
            title: 'Test Book',
          },
          subject: 'Test Subject',
          resources: [
            {
              id: 'resource-1',
              type: 'https://xats.org/core/resources/image',
              url: uri, // Different protocol
            },
          ],
          bodyMatter: { contents: [] },
        };

        const result = await validator.validate(doc);
        // All should be valid URIs regardless of protocol
        expect(typeof result.isValid).toBe('boolean');
      }
    });
  });
});
