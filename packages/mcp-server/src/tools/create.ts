/**
 * @xats/mcp-server - Create Tool Implementation
 */

import { McpError } from '../types.js';

import type { CreateInput, CreateResult, McpServerConfig } from '../types.js';
import type { XatsDocument } from '@xats/types';

/**
 * Generate a unique ID for xats objects
 */
function generateId(): string {
  return `xats-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a minimal xats document template
 */
function createMinimalTemplate(input: CreateInput): XatsDocument {
  const schemaVersion = input.schemaVersion || '0.3.0';

  return {
    schemaVersion,
    bibliographicEntry: {
      type: 'book',
      title: input.title,
      author: input.author ? [{ family: input.author }] : [],
      language: input.language,
      issued: { 'date-parts': [[new Date().getFullYear()]] },
    },
    subject: input.subject || 'General',
    bodyMatter: {
      contents: [
        {
          label: 'chapter-1',
          title: {
            runs: [
              {
                type: 'text',
                text: 'Introduction',
              },
            ],
          },
          contents: [
            {
              label: 'section-1-1',
              title: {
                runs: [
                  {
                    type: 'text',
                    text: 'Getting Started',
                  },
                ],
              },
              contents: [
                {
                  blockType: 'https://xats.org/core/blocks/paragraph',
                  content: {
                    text: {
                      runs: [
                        {
                          type: 'text',
                          text: 'This is a sample paragraph in your new xats document.',
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
}

/**
 * Create a textbook template with multiple chapters
 */
function createTextbookTemplate(input: CreateInput): XatsDocument {
  const schemaVersion = input.schemaVersion || '0.3.0';

  return {
    schemaVersion,
    bibliographicEntry: {
      type: 'book',
      title: input.title,
      author: input.author ? [{ family: input.author }] : [],
      language: input.language || 'en',
      issued: { 'date-parts': [[new Date().getFullYear()]] },
      'container-title': input.subject,
    },
    subject: input.subject || 'General',
    ...(input.options?.includeFrontMatter
      ? {
          frontMatter: {
            preface: [
              {
                id: generateId(),
                blockType: 'https://xats.org/core/blocks/heading',
                content: {
                  level: 1,
                  text: {
                    runs: [
                      {
                        type: 'text',
                        text: 'Table of Contents',
                      },
                    ],
                  },
                },
              },
              {
                id: generateId(),
                blockType: 'https://xats.org/core/placeholders/tableOfContents',
                content: {},
              },
            ],
          },
        }
      : {}),
    bodyMatter: {
      contents: [
        {
          label: 'chapter-1',
          title: {
            runs: [
              {
                type: 'text',
                text: 'Introduction',
              },
            ],
          },
          learningOutcomes: [
            {
              statement: {
                runs: [
                  {
                    type: 'text',
                    text: 'Understand the basic concepts and structure of this textbook',
                  },
                ],
              },
            },
          ],
          contents: [
            {
              label: 'section-1-1',
              title: {
                runs: [
                  {
                    type: 'text',
                    text: 'Course Overview',
                  },
                ],
              },
              contents: [
                {
                  blockType: 'https://xats.org/core/blocks/paragraph',
                  content: {
                    text: {
                      runs: [
                        {
                          type: 'text',
                          text: 'Welcome to this comprehensive textbook. This introduction will guide you through the key concepts and learning objectives.',
                        },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'chapter-2',
          title: {
            runs: [
              {
                type: 'text',
                text: 'Fundamentals',
              },
            ],
          },
          contents: [
            {
              label: 'section-2-1',
              title: {
                runs: [
                  {
                    type: 'text',
                    text: 'Basic Principles',
                  },
                ],
              },
              contents: [
                {
                  blockType: 'https://xats.org/core/blocks/paragraph',
                  content: {
                    text: {
                      runs: [
                        {
                          type: 'text',
                          text: 'This chapter covers the fundamental principles and core concepts.',
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
    ...(input.options?.includeBackMatter
      ? {
          backMatter: {
            bibliography: [
              {
                id: generateId(),
                blockType: 'https://xats.org/core/placeholders/bibliography',
                content: {},
              },
            ],
            index: [
              {
                id: generateId(),
                blockType: 'https://xats.org/core/placeholders/index',
                content: {},
              },
            ],
          },
        }
      : {}),
  };
}

/**
 * Create a course template with pathways
 */
function createCourseTemplate(input: CreateInput): XatsDocument {
  const document = createTextbookTemplate(input);

  // Add pathway content if requested
  if (input.options?.includePathways && document.bodyMatter.contents[0]) {
    const firstChapter = document.bodyMatter.contents[0];
    if ('pathways' in firstChapter) {
      firstChapter.pathways = [
        {
          id: generateId(),
          pathwayType: 'https://xats.org/core/pathways/standard',
          condition: 'default',
        },
        {
          id: generateId(),
          pathwayType: 'https://xats.org/core/pathways/enrichment',
          condition: 'assessment.score >= 0.8',
        },
      ];
    }
  }

  return document;
}

/**
 * Create an assessment-focused template
 */
function createAssessmentTemplate(input: CreateInput): XatsDocument {
  const schemaVersion = input.schemaVersion || '0.3.0';

  return {
    schemaVersion,
    bibliographicEntry: {
      type: 'article',
      title: input.title,
      author: input.author ? [{ family: input.author }] : [],
      language: input.language || 'en',
      issued: { 'date-parts': [[new Date().getFullYear()]] },
    },
    subject: input.subject || 'Assessment',
    bodyMatter: {
      contents: [
        {
          label: 'assessment-chapter',
          title: {
            runs: [
              {
                type: 'text',
                text: 'Assessment Activities',
              },
            ],
          },
          contents: [
            {
              label: 'quiz-section',
              title: {
                runs: [
                  {
                    type: 'text',
                    text: 'Knowledge Check',
                  },
                ],
              },
              contents: [
                {
                  blockType: 'https://xats.org/core/blocks/paragraph',
                  content: {
                    text: {
                      runs: [
                        {
                          type: 'text',
                          text: 'Complete the following assessment to check your understanding.',
                        },
                      ],
                    },
                  },
                },
                // Example assessment block (would be more detailed in real implementation)
                {
                  blockType: 'https://xats.org/assessment/multipleChoice',
                  content: {
                    question: {
                      runs: [
                        {
                          type: 'text',
                          text: 'What is the primary purpose of xats?',
                        },
                      ],
                    },
                    options: [
                      {
                        text: {
                          runs: [
                            {
                              type: 'text',
                              text: 'To create educational content',
                            },
                          ],
                        },
                      },
                      {
                        text: {
                          runs: [
                            {
                              type: 'text',
                              text: 'To validate documents',
                            },
                          ],
                        },
                      },
                      {
                        text: {
                          runs: [
                            {
                              type: 'text',
                              text: 'To provide semantic structure for educational materials',
                            },
                          ],
                        },
                        correct: true,
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
}

/**
 * Create a new xats document from a template
 */
export async function createTool(
  input: CreateInput,
  config: McpServerConfig
): Promise<CreateResult> {
  try {
    // Validate input
    if (!input.title || input.title.trim().length === 0) {
      throw new McpError('Title is required for document creation', 'INVALID_INPUT');
    }

    let document: XatsDocument;
    const templateType = input.template || 'minimal';

    // Create document based on template type
    switch (templateType) {
      case 'minimal':
        document = createMinimalTemplate(input);
        break;
      case 'textbook':
        document = createTextbookTemplate(input);
        break;
      case 'course':
        document = createCourseTemplate(input);
        break;
      case 'assessment':
        document = createAssessmentTemplate(input);
        break;
      default:
        throw new McpError(`Unknown template type: ${templateType}`, 'INVALID_TEMPLATE');
    }

    return {
      success: true,
      data: {
        document,
        template: templateType,
      },
      metadata: {
        toolName: 'xats_create',
        timestamp: new Date().toISOString(),
        schemaVersion: document.schemaVersion,
        templateType,
        documentId: generateId(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown creation error',
      metadata: {
        toolName: 'xats_create',
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        template: input.template,
      },
    };
  }
}

/**
 * Get available template types and their descriptions
 */
export function getAvailableTemplates(): Array<{
  name: string;
  description: string;
  features: string[];
}> {
  return [
    {
      name: 'minimal',
      description: 'Basic document with single chapter and section',
      features: ['Single chapter', 'One section', 'Sample paragraph'],
    },
    {
      name: 'textbook',
      description: 'Complete textbook structure with multiple chapters',
      features: [
        'Multiple chapters',
        'Learning objectives',
        'Table of contents (optional)',
        'Bibliography placeholder (optional)',
      ],
    },
    {
      name: 'course',
      description: 'Course-focused structure with pathways',
      features: [
        'Textbook structure',
        'Learning pathways',
        'Conditional navigation',
        'Enrichment content',
      ],
    },
    {
      name: 'assessment',
      description: 'Assessment-focused document with quiz components',
      features: [
        'Assessment blocks',
        'Multiple choice questions',
        'Knowledge check sections',
        'Structured evaluation',
      ],
    },
  ];
}
