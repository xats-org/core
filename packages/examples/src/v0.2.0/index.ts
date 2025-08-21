/**
 * v0.2.0 Example Documents
 */

import type { XatsDocument } from '@xats/types';

/**
 * Document demonstrating accessibility features
 */
export const accessibilityExample: XatsDocument = {
  schemaVersion: '0.2.0',
  bibliographicEntry: {
    type: 'book',
    title: 'Accessible Learning Materials',
    author: [
      {
        family: 'Chen',
        given: 'Wei',
      },
    ],
    issued: {
      'date-parts': [[2025]],
    },
  },
  subject: 'Accessibility',
  bodyMatter: {
    contents: [
      {
        id: 'chapter-1',
        title: {
          runs: [
            {
              type: 'text',
              text: 'Visual Content with Descriptions',
            },
          ],
        },
        contents: [
          {
            id: 'figure-1',
            blockType: 'https://xats.org/vocabularies/blocks/figure',
            content: {
              src: 'diagram.png',
              alt: 'A flowchart showing the software development lifecycle',
              caption: {
                runs: [
                  {
                    type: 'text',
                    text: 'Figure 1: Software Development Lifecycle',
                  },
                ],
              },
              longDescription:
                'The flowchart begins with Requirements Analysis, flowing to Design, then Implementation, Testing, Deployment, and Maintenance, with feedback loops from each stage back to earlier stages.',
            },
            extensions: {
              accessibility: {
                audioDescription: 'audio/figure-1-description.mp3',
                tactileGraphic: 'tactile/figure-1.svg',
              },
            },
          },
          {
            id: 'math-1',
            blockType: 'https://xats.org/vocabularies/blocks/mathBlock',
            content: {
              math: 'E = mc^2',
              mathML:
                '<math><mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></math>',
              spokenText: 'E equals m c squared',
            },
          },
        ],
      },
    ],
  },
};

/**
 * Document with adaptive pathways
 */
export const adaptivePathwayExample: XatsDocument = {
  schemaVersion: '0.2.0',
  bibliographicEntry: {
    type: 'book',
    title: 'Adaptive Learning Mathematics',
    author: [
      {
        family: 'Rodriguez',
        given: 'Carlos',
      },
    ],
    issued: {
      'date-parts': [[2025]],
    },
  },
  subject: 'Mathematics',
  bodyMatter: {
    contents: [
      {
        id: 'chapter-1',
        title: {
          runs: [
            {
              type: 'text',
              text: 'Algebra Fundamentals',
            },
          ],
        },
        pathways: [
          {
            id: 'pathway-1',
            pathwayType: 'https://xats.org/vocabularies/pathways/conditional',
            condition: 'assessment:pretest-1:greater_than:80',
            description: {
              runs: [
                {
                  type: 'text',
                  text: 'Skip to advanced topics for high scorers',
                },
              ],
            },
          },
          {
            id: 'pathway-2',
            pathwayType: 'https://xats.org/vocabularies/pathways/conditional',
            condition: 'assessment:pretest-1:less_than:60',
            description: {
              runs: [
                {
                  type: 'text',
                  text: 'Additional support for struggling students',
                },
              ],
            },
          },
        ],
        contents: [
          {
            id: 'pretest-1',
            blockType: 'https://xats.org/vocabularies/blocks/assessment',
            content: {
              assessmentType: 'formative',
              title: {
                runs: [
                  {
                    type: 'text',
                    text: 'Pre-test: Algebra Basics',
                  },
                ],
              },
              questions: [
                {
                  id: 'q1',
                  type: 'multiple-choice',
                  prompt: {
                    runs: [
                      {
                        type: 'text',
                        text: 'Solve for x: 2x + 5 = 13',
                      },
                    ],
                  },
                  options: [
                    { id: 'a', text: 'x = 4', correct: true },
                    { id: 'b', text: 'x = 9', correct: false },
                    { id: 'c', text: 'x = 6', correct: false },
                    { id: 'd', text: 'x = 8', correct: false },
                  ],
                  points: 10,
                },
              ],
              totalPoints: 100,
            },
          },
          {
            id: 'standard-section',
            title: {
              runs: [
                {
                  type: 'text',
                  text: 'Standard Content',
                },
              ],
            },
            contents: [
              {
                id: 'para-standard',
                blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                content: {
                  runs: [
                    {
                      type: 'text',
                      text: 'This is the standard learning content for all students.',
                    },
                  ],
                },
              },
            ],
          },
          {
            id: 'remedial-section',
            title: {
              runs: [
                {
                  type: 'text',
                  text: 'Additional Support',
                },
              ],
            },
            contents: [
              {
                id: 'para-remedial',
                blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                content: {
                  runs: [
                    {
                      type: 'text',
                      text: 'This section provides extra practice and simplified explanations.',
                    },
                  ],
                },
              },
            ],
          },
          {
            id: 'advanced-section',
            title: {
              runs: [
                {
                  type: 'text',
                  text: 'Advanced Topics',
                },
              ],
            },
            contents: [
              {
                id: 'para-advanced',
                blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                content: {
                  runs: [
                    {
                      type: 'text',
                      text: 'This section covers more challenging concepts for advanced learners.',
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
