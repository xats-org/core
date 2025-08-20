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
    contents: [
      {
        id: 'chapter-1',
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
    contents: [
      {
        id: 'toc',
        blockType: 'https://xats.org/core/placeholders/tableOfContents',
        content: {},
      },
    ],
  },
  bodyMatter: {
    contents: [
      {
        id: 'unit-1',
        label: 'Unit 1',
        title: {
          runs: [
            {
              type: 'text',
              text: 'Foundations',
            },
          ],
        },
        contents: [
          {
            id: 'chapter-1',
            label: 'Chapter 1',
            title: {
              runs: [
                {
                  type: 'text',
                  text: 'Introduction to Programming',
                },
              ],
            },
            contents: [
              {
                id: 'heading-1-1',
                blockType: 'https://xats.org/core/blocks/heading',
                content: {
                  level: 2,
                  text: {
                    runs: [
                      {
                        type: 'text',
                        text: 'What is Programming?',
                      },
                    ],
                  },
                },
              },
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
