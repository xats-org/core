/**
 * v0.1.0 Example Documents
 */

import type { XatsDocument } from '@xats/types';

/**
 * Minimal valid xats document
 */
export const minimalDocument: XatsDocument = {
  schemaVersion: '0.1.0',
  bibliographicEntry: {
    type: 'book',
    title: 'Minimal xats Document',
    author: [
      {
        family: 'Doe',
        given: 'Jane',
      },
    ],
    issued: {
      'date-parts': [[2025]],
    },
  },
  subject: 'Example',
  bodyMatter: {
    id: 'body',
    type: 'bodyMatter',
    contents: [
      {
        id: 'chapter-1',
        type: 'chapter',
        title: 'Introduction',
        contents: [
          {
            id: 'para-1',
            blockType: 'https://xats.org/core/blocks/paragraph',
            content: {
              runs: [
                {
                  type: 'text',
                  text: 'This is a minimal xats document demonstrating the basic structure.',
                },
              ],
            },
          },
        ],
      },
    ],
  },
};

/**
 * Complete textbook example
 */
export const completeTextbook: XatsDocument = {
  schemaVersion: '0.1.0',
  bibliographicEntry: {
    type: 'book',
    title: 'Introduction to Computer Science',
    author: [
      {
        family: 'Smith',
        given: 'John',
      },
      {
        family: 'Johnson',
        given: 'Mary',
      },
    ],
    publisher: 'Academic Press',
    'publisher-place': 'New York',
    issued: {
      'date-parts': [[2025, 1]],
    },
    ISBN: '978-0-123456-78-9',
    language: 'en',
  },
  subject: 'Computer Science',
  frontMatter: {
    id: 'front',
    type: 'frontMatter',
    contents: [
      {
        id: 'toc',
        blockType: 'https://xats.org/core/placeholders/tableOfContents',
        content: {},
      },
    ],
  },
  bodyMatter: {
    id: 'body',
    type: 'bodyMatter',
    contents: [
      {
        id: 'unit-1',
        type: 'unit',
        label: 'Unit 1',
        title: 'Foundations',
        contents: [
          {
            id: 'chapter-1',
            type: 'chapter',
            label: 'Chapter 1',
            title: 'Introduction to Programming',
            learningObjectives: [
              {
                runs: [
                  {
                    type: 'text',
                    text: 'Understand basic programming concepts',
                  },
                ],
              },
              {
                runs: [
                  {
                    type: 'text',
                    text: 'Write simple programs in Python',
                  },
                ],
              },
            ],
            contents: [
              {
                id: 'section-1-1',
                type: 'section',
                label: '1.1',
                title: 'What is Programming?',
                contents: [
                  {
                    id: 'para-1-1-1',
                    blockType: 'https://xats.org/core/blocks/paragraph',
                    content: {
                      runs: [
                        {
                          type: 'text',
                          text: 'Programming is the process of creating ',
                        },
                        {
                          type: 'emphasis',
                          text: 'instructions',
                        },
                        {
                          type: 'text',
                          text: ' that tell a computer how to perform a task.',
                        },
                      ],
                    },
                  },
                  {
                    id: 'code-1-1-1',
                    blockType: 'https://xats.org/core/blocks/codeBlock',
                    content: {
                      language: 'python',
                      code: 'print("Hello, World!")',
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
    id: 'back',
    type: 'backMatter',
    contents: [
      {
        id: 'bibliography-placeholder',
        blockType: 'https://xats.org/core/placeholders/bibliography',
        content: {},
      },
      {
        id: 'index-placeholder',
        blockType: 'https://xats.org/core/placeholders/index',
        content: {},
      },
    ],
  },
};