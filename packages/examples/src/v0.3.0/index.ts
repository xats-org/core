/**
 * v0.3.0 Example Documents
 */

import type { XatsDocument } from '@xats/types';

/**
 * Document demonstrating v0.3.0 features
 */
export const featuresExample: XatsDocument = {
  schemaVersion: '0.3.0',
  bibliographicEntry: {
    type: 'book',
    title: 'Advanced xats Features',
    author: [
      {
        family: 'Kumar',
        given: 'Priya',
      },
    ],
    issued: {
      'date-parts': [[2025]],
    },
  },
  subject: 'Technology',
  fileModularity: {
    baseUri: 'https://example.com/textbook/',
    files: [
      {
        id: 'main',
        path: 'index.json',
        type: 'primary',
        description: 'Main document structure',
      },
      {
        id: 'chapter-1-content',
        path: 'chapters/chapter-1.json',
        type: 'content',
        description: 'Chapter 1 content blocks',
      },
      {
        id: 'media',
        path: 'media/manifest.json',
        type: 'media',
        description: 'Media asset manifest',
      },
    ],
  },
  bodyMatter: {
    id: 'body',
    type: 'bodyMatter',
    contents: [
      {
        id: 'chapter-1',
        type: 'chapter',
        title: 'Interactive Learning',
        fileReference: {
          fileId: 'chapter-1-content',
          selector: '#content',
        },
        contents: [
          {
            id: 'interactive-1',
            blockType: 'https://xats.org/extensions/interactive/blocks/simulation',
            content: {
              type: 'physics-simulation',
              title: 'Pendulum Motion',
              parameters: {
                length: { min: 0.5, max: 2, default: 1, unit: 'meters' },
                mass: { min: 0.1, max: 1, default: 0.5, unit: 'kg' },
                gravity: { min: 1, max: 20, default: 9.8, unit: 'm/s²' },
              },
              instructions: {
                runs: [
                  {
                    type: 'text',
                    text: 'Adjust the parameters to see how they affect the pendulum period.',
                  },
                ],
              },
            },
            extensions: {
              analytics: {
                trackInteractions: true,
                eventTypes: ['parameter-change', 'simulation-run', 'reset'],
              },
            },
          },
          {
            id: 'annotated-text',
            blockType: 'https://xats.org/core/blocks/paragraph',
            content: {
              runs: [
                {
                  type: 'text',
                  text: 'The period of a pendulum is approximately ',
                },
                {
                  type: 'mathInline',
                  math: 'T = 2\\pi\\sqrt{\\frac{L}{g}}',
                },
                {
                  type: 'text',
                  text: ' where L is the length and g is gravitational acceleration.',
                },
              ],
            },
            annotations: [
              {
                id: 'ann-1',
                type: 'instructor',
                targetRange: { start: 0, end: 28 },
                content: {
                  runs: [
                    {
                      type: 'text',
                      text: 'This is the small angle approximation',
                    },
                  ],
                },
                visibility: 'instructor-only',
              },
              {
                id: 'ann-2',
                type: 'student',
                targetRange: { start: 29, end: 50 },
                content: {
                  runs: [
                    {
                      type: 'text',
                      text: 'Remember to check units!',
                    },
                  ],
                },
                author: 'student-123',
                timestamp: '2025-01-20T10:30:00Z',
              },
            ],
          },
        ],
      },
    ],
  },
  analytics: {
    enabled: true,
    providers: [
      {
        type: 'xapi',
        endpoint: 'https://lrs.example.com/xapi',
        version: '1.0.3',
      },
    ],
    dataCollection: {
      pageViews: true,
      timeOnPage: true,
      interactions: true,
      assessmentScores: true,
    },
  },
};