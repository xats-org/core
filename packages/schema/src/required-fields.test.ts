/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
/**
 * Required Field Validation Tests
 *
 * Tests that all required fields are properly enforced by the schema,
 * validation fails when required fields are missing, and required
 * field constraints work at all levels of the schema hierarchy.
 */

import { describe, it, expect, beforeAll } from 'vitest';

import { createValidator, type ValidatorInstance } from './test-utils.js';

describe('Required Field Validation', () => {
  let validator: ValidatorInstance;

  beforeAll(() => {
    validator = createValidator();
  });

  describe('Root Document Required Fields', () => {
    it('should require schemaVersion', async () => {
      const doc = {
        bibliographicEntry: {
          id: 'test-001',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e: any) => e.message.includes('schemaVersion') || e.path.includes('schemaVersion')
        )
      ).toBe(true);
    });

    it('should require bibliographicEntry', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        subject: 'Test Subject',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e: any) =>
            e.message.includes('bibliographicEntry') || e.path.includes('bibliographicEntry')
        )
      ).toBe(true);
    });

    it('should require subject', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-002',
          type: 'book',
          title: 'Test Book',
        },
        bodyMatter: {
          contents: [],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: any) => e.message.includes('subject') || e.path.includes('subject'))
      ).toBe(true);
    });

    it('should require bodyMatter', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-003',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e: any) => e.message.includes('bodyMatter') || e.path.includes('bodyMatter')
        )
      ).toBe(true);
    });

    it('should accept document with all required fields', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-004',
          type: 'book',
          title: 'Complete Test Book',
          author: [{ family: 'Test', given: 'Author' }],
          issued: { 'date-parts': [[2024]] },
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
                      blockType: 'https://xats.org/core/blocks/paragraph',
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
  });

  describe('XatsObject Required Fields', () => {
    it('should require id field in all XatsObject descendants', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-005',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              // Missing id field
              title: 'Chapter without ID',
              sections: [],
            },
          ],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: any) => e.message.includes('id') || e.path.includes('id'))
      ).toBe(true);
    });

    it('should require id in content blocks', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-006',
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
                      // Missing id field
                      blockType: 'https://xats.org/core/blocks/paragraph',
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
      expect(result.errors.some((e: any) => e.message.includes('id'))).toBe(true);
    });

    it('should require id in learning objectives', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-007',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              learningObjectives: [
                {
                  // Missing id field
                  description: 'Learn something',
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
      expect(result.errors.some((e: any) => e.message.includes('id'))).toBe(true);
    });
  });

  describe('StructuralContainer Required Fields', () => {
    it('should require title in units', async () => {
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
              id: 'unit-1',
              // Missing title field
              contents: [],
            },
          ],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('title'))).toBe(true);
    });

    it('should require title in chapters', async () => {
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
              // Missing title field
              sections: [],
            },
          ],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('title'))).toBe(true);
    });

    it('should require title in sections', async () => {
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
              sections: [
                {
                  id: 'section-1',
                  // Missing title field
                  content: [],
                },
              ],
            },
          ],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('title'))).toBe(true);
    });
  });

  describe('ContentBlock Required Fields', () => {
    it('should require blockType in content blocks', async () => {
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
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      // Missing blockType field
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
      expect(result.errors.some((e: any) => e.message.includes('blockType'))).toBe(true);
    });

    it('should require content in content blocks', async () => {
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
                      blockType: 'https://xats.org/core/blocks/paragraph',
                      // Missing content field
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
      expect(result.errors.some((e: any) => e.message.includes('content'))).toBe(true);
    });
  });

  describe('SemanticText Required Fields', () => {
    it('should require runs in SemanticText', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-013',
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
                      blockType: 'https://xats.org/core/blocks/paragraph',
                      content: {
                        text: {
                          // Missing runs field
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
      expect(result.errors.some((e: any) => e.message.includes('runs'))).toBe(true);
    });
  });

  describe('Text Run Required Fields', () => {
    it('should require type and text in TextRun', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-014',
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
                      blockType: 'https://xats.org/core/blocks/paragraph',
                      content: {
                        text: {
                          runs: [
                            {
                              // Missing type and text fields
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: any) => e.message.includes('type') || e.message.includes('text'))
      ).toBe(true);
    });

    it('should require type, text, and refId in ReferenceRun', async () => {
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
                      blockType: 'https://xats.org/core/blocks/paragraph',
                      content: {
                        text: {
                          runs: [
                            {
                              type: 'reference',
                              text: 'See Chapter 2',
                              // Missing refId field
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('refId'))).toBe(true);
    });

    it('should require type and refId in CitationRun', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-016',
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
                      blockType: 'https://xats.org/core/blocks/paragraph',
                      content: {
                        text: {
                          runs: [
                            {
                              type: 'citation',
                              // Missing refId field
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

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('refId'))).toBe(true);
    });
  });

  describe('Specific Content Block Required Fields', () => {
    it('should require text in paragraph blocks', async () => {
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
                      blockType: 'https://xats.org/core/blocks/paragraph',
                      content: {
                        // Missing text field
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
      expect(result.errors.some((e: any) => e.message.includes('text'))).toBe(true);
    });

    it('should require listType and items in list blocks', async () => {
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
                      blockType: 'https://xats.org/core/blocks/list',
                      content: {
                        // Missing listType and items fields
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
        result.errors.some(
          (e: any) => e.message.includes('listType') || e.message.includes('items')
        )
      ).toBe(true);
    });

    it('should require code in code blocks', async () => {
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
                      blockType: 'https://xats.org/core/blocks/codeBlock',
                      content: {
                        language: 'javascript',
                        // Missing code field
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
      expect(result.errors.some((e: any) => e.message.includes('code'))).toBe(true);
    });

    it('should require notation and expression in math blocks', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-020',
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
                      blockType: 'https://xats.org/core/blocks/mathBlock',
                      content: {
                        // Missing notation and expression fields
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
        result.errors.some(
          (e: any) => e.message.includes('notation') || e.message.includes('expression')
        )
      ).toBe(true);
    });

    it('should require resourceId in figure blocks', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-021',
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
                      blockType: 'https://xats.org/core/blocks/figure',
                      content: {
                        // Missing resourceId field
                        caption: {
                          runs: [{ type: 'text', text: 'Figure caption' }],
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
      expect(result.errors.some((e: any) => e.message.includes('resourceId'))).toBe(true);
    });

    it('should require rows in table blocks', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-022',
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
                      blockType: 'https://xats.org/core/blocks/table',
                      content: {
                        // Missing rows field
                        caption: {
                          runs: [{ type: 'text', text: 'Table caption' }],
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
      expect(result.errors.some((e: any) => e.message.includes('rows'))).toBe(true);
    });
  });

  describe('Matter Structure Required Fields', () => {
    it('should require contents in BodyMatter', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-023',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          // Missing contents field
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('contents'))).toBe(true);
    });

    it('should require contents in Unit', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-024',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'unit-1',
              title: 'Unit 1',
              // Missing contents field
            },
          ],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('contents'))).toBe(true);
    });

    it('should require sections in Chapter', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-025',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              // Missing sections field
            },
          ],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('sections'))).toBe(true);
    });

    it('should require content in Section', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-026',
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
                  // Missing content field
                },
              ],
            },
          ],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('content'))).toBe(true);
    });
  });

  describe('Pathway Required Fields', () => {
    it('should require trigger and rules in Pathway', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-027',
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
                  // Missing trigger and rules fields
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
        result.errors.some((e: any) => e.message.includes('trigger') || e.message.includes('rules'))
      ).toBe(true);
    });

    it('should require triggerType in pathway trigger', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-028',
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
                    // Missing triggerType field
                    sourceId: 'assessment-1',
                  },
                  rules: [
                    {
                      condition: 'score >= 70',
                      destinationId: 'next-chapter',
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
      expect(result.errors.some((e: any) => e.message.includes('triggerType'))).toBe(true);
    });

    it('should require condition and destinationId in pathway rules', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-029',
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
                      // Missing condition and destinationId fields
                      pathwayType: 'https://xats.org/core/pathways/standard',
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
          (e: any) => e.message.includes('condition') || e.message.includes('destinationId')
        )
      ).toBe(true);
    });
  });

  describe('CSL Data Item Required Fields', () => {
    it('should require id in bibliographic entry', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          // Missing id field
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('id'))).toBe(true);
    });
  });

  describe('Resource Required Fields', () => {
    it('should require type and url in resources', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-030',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        resources: [
          {
            id: 'resource-1',
            // Missing type and url fields
          },
        ],
        bodyMatter: {
          contents: [],
        },
      };

      const result = await validator.validate(doc);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: any) => e.message.includes('type') || e.message.includes('url'))
      ).toBe(true);
    });
  });

  describe('Key Term Required Fields', () => {
    it('should require term and definition in KeyTerm', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-031',
          type: 'book',
          title: 'Test Book',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              keyTerms: [
                {
                  id: 'term-1',
                  // Missing term and definition fields
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
          (e: any) => e.message.includes('term') || e.message.includes('definition')
        )
      ).toBe(true);
    });
  });

  describe('Rendering Hint Required Fields', () => {
    it('should require hintType and value in RenderingHint', async () => {
      const doc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'test-032',
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
                  // Missing hintType and value fields
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
          (e: any) => e.message.includes('hintType') || e.message.includes('value')
        )
      ).toBe(true);
    });
  });
});
