/**
 * v0.3.0 Example Documents
 */

import type { XatsDocument } from '@xats-org/types';

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
  bodyMatter: {
    contents: [
      {
        id: 'chapter-1',
        title: {
          runs: [
            {
              type: 'text',
              text: 'Interactive Learning',
            },
          ],
        },
        fileReference: {
          $ref: 'chapter-1-content.json',
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
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
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
          },
        ],
      },
    ],
  },
};
