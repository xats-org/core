import { XatsRenderer, type XatsRendererProps } from '../components/XatsRenderer';
import type { Story } from '@ladle/react';

import type { XatsDocument } from '@xats-org/types';

export default {
  title: 'Renderer/XatsRenderer',
};

// Sample xats document for stories

// Sample xats document for stories
const sampleDocument: XatsDocument = {
  schemaVersion: '0.3.0',
  bibliographicEntry: {
    id: 'sample-doc',
    type: 'book',
    title: 'Sample xats Document',
    author: [{ family: 'Doe', given: 'Jane' }],
    issued: { 'date-parts': [[2025, 1]] },
  },
  subject: 'Sample',
  bodyMatter: {
    contents: [
      {
        id: 'ch-1',
        label: 'Chapter 1',
        title: {
          runs: [{ type: 'text', text: 'Introduction to xats' }],
        },
        contents: [
          {
            id: 'sec-1-1',
            title: {
              runs: [{ type: 'text', text: 'What is xats?' }],
            },
            contents: [
              {
                id: 'para-1',
                blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                content: {
                  text: {
                    runs: [
                      {
                        type: 'text',
                        text: 'The ',
                      },
                      {
                        type: 'strong',
                        text: 'eXtensible Academic Text Standard',
                      },
                      {
                        type: 'text',
                        text: ' (xats) is a modern, JSON-based schema for educational content.',
                      },
                    ],
                  },
                },
              },
              {
                id: 'heading-1',
                blockType: 'https://xats.org/vocabularies/blocks/heading',
                content: {
                  level: 2,
                  text: {
                    runs: [
                      {
                        type: 'text',
                        text: 'Key Features',
                      },
                    ],
                  },
                },
              },
              {
                id: 'list-1',
                blockType: 'https://xats.org/vocabularies/blocks/list',
                content: {
                  listType: 'unordered',
                  items: [
                    {
                      runs: [{ type: 'text', text: 'AI-native design' }],
                    },
                    {
                      runs: [{ type: 'text', text: 'Rich educational metadata' }],
                    },
                    {
                      runs: [{ type: 'text', text: 'Accessibility first' }],
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

// Basic HTML rendering story
export const HTMLFormat: Story<XatsRendererProps> = ({
  document = sampleDocument,
  format = 'html',
  options = {},
  className,
}) => (
  <XatsRenderer
    document={document}
    format={format}
    options={options}
    {...(className ? { className } : {})}
  />
);

HTMLFormat.args = {
  document: sampleDocument,
  format: 'html' as const,
  options: {},
};

HTMLFormat.argTypes = {
  format: {
    control: { type: 'select' },
    options: ['html', 'markdown', 'text'],
    description: 'Output format for rendering',
  },
  document: {
    description: 'The xats document to render',
  },
  options: {
    description: 'Renderer-specific options',
  },
  className: {
    control: { type: 'text' },
    description: 'Additional CSS class name',
  },
};

// Markdown rendering story
export const MarkdownFormat: Story<XatsRendererProps> = ({
  document = sampleDocument,
  format = 'markdown',
  options = {},
  className,
}) => (
  <XatsRenderer
    document={document}
    format={format}
    options={options}
    {...(className ? { className } : {})}
  />
);

MarkdownFormat.args = {
  document: sampleDocument,
  format: 'markdown' as const,
  options: {},
};

// Plain text rendering story
export const TextFormat: Story<XatsRendererProps> = ({
  document = sampleDocument,
  format = 'text',
  options = {},
  className,
}) => (
  <XatsRenderer
    document={document}
    format={format}
    options={options}
    {...(className ? { className } : {})}
  />
);

TextFormat.args = {
  document: sampleDocument,
  format: 'text' as const,
  options: {},
};

// Complex document with math and code
const complexDocument: XatsDocument = {
  schemaVersion: '0.3.0',
  bibliographicEntry: {
    id: 'complex-doc',
    type: 'book',
    title: 'Complex xats Document',
    author: [{ family: 'Smith', given: 'John' }],
    issued: { 'date-parts': [[2025, 1]] },
  },
  subject: 'Mathematics',
  bodyMatter: {
    contents: [
      {
        id: 'ch-1',
        label: 'Chapter 1',
        title: {
          runs: [{ type: 'text', text: 'Mathematical Concepts' }],
        },
        contents: [
          {
            id: 'sec-1-1',
            title: {
              runs: [{ type: 'text', text: 'Equations and Code' }],
            },
            contents: [
              {
                id: 'para-1',
                blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                content: {
                  text: {
                    runs: [
                      {
                        type: 'text',
                        text: 'Consider the quadratic equation:',
                      },
                    ],
                  },
                },
              },
              {
                id: 'math-1',
                blockType: 'https://xats.org/vocabularies/blocks/mathBlock',
                content: {
                  mathContent: 'ax^2 + bx + c = 0',
                  format: 'latex',
                },
              },
              {
                id: 'para-2',
                blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                content: {
                  text: {
                    runs: [
                      {
                        type: 'text',
                        text: 'Here is a Python implementation:',
                      },
                    ],
                  },
                },
              },
              {
                id: 'code-1',
                blockType: 'https://xats.org/vocabularies/blocks/codeBlock',
                content: {
                  code: 'def solve_quadratic(a, b, c):\n    discriminant = b**2 - 4*a*c\n    if discriminant >= 0:\n        x1 = (-b + discriminant**0.5) / (2*a)\n        x2 = (-b - discriminant**0.5) / (2*a)\n        return x1, x2\n    return None',
                  language: 'python',
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

export const ComplexDocument: Story<XatsRendererProps> = ({
  document = complexDocument,
  format = 'html',
  options = {},
  className,
}) => (
  <XatsRenderer
    document={document}
    format={format}
    options={options}
    {...(className ? { className } : {})}
  />
);

ComplexDocument.args = {
  document: complexDocument,
  format: 'html' as const,
  options: {},
};

// Document with assessment
const assessmentDocument: XatsDocument = {
  schemaVersion: '0.3.0',
  bibliographicEntry: {
    id: 'assessment-doc',
    type: 'book',
    title: 'Assessment Example',
    author: [{ family: 'Johnson', given: 'Mary' }],
    issued: { 'date-parts': [[2025, 1]] },
  },
  subject: 'Biology',
  bodyMatter: {
    contents: [
      {
        id: 'ch-1',
        label: 'Chapter 1',
        title: {
          runs: [{ type: 'text', text: 'Cell Biology Quiz' }],
        },
        contents: [
          {
            id: 'sec-1-1',
            title: {
              runs: [{ type: 'text', text: 'Multiple Choice Questions' }],
            },
            contents: [
              {
                id: 'assessment-1',
                blockType: 'https://xats.org/vocabularies/blocks/multipleChoice',
                content: {
                  question: {
                    runs: [
                      {
                        type: 'text',
                        text: 'What is the basic unit of life?',
                      },
                    ],
                  },
                  options: [
                    {
                      id: 'opt-a',
                      text: { runs: [{ type: 'text', text: 'Cell' }] },
                      correct: true,
                    },
                    {
                      id: 'opt-b',
                      text: { runs: [{ type: 'text', text: 'Tissue' }] },
                      correct: false,
                    },
                    {
                      id: 'opt-c',
                      text: { runs: [{ type: 'text', text: 'Organ' }] },
                      correct: false,
                    },
                    {
                      id: 'opt-d',
                      text: { runs: [{ type: 'text', text: 'Molecule' }] },
                      correct: false,
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

export const AssessmentDocument: Story<XatsRendererProps> = ({
  document = assessmentDocument,
  format = 'html',
  options = {},
  className,
}) => (
  <XatsRenderer
    document={document}
    format={format}
    options={options}
    {...(className ? { className } : {})}
  />
);

AssessmentDocument.args = {
  document: assessmentDocument,
  format: 'html' as const,
  options: {},
};

// Custom styled HTML rendering
export const StyledHTML: Story<XatsRendererProps> = ({
  document = sampleDocument,
  format = 'html',
  options = {},
  className = 'custom-xats-content',
}) => <XatsRenderer document={document} format={format} options={options} className={className} />;

StyledHTML.args = {
  document: sampleDocument,
  format: 'html' as const,
  options: {},
  className: 'custom-xats-content',
};

StyledHTML.meta = {
  description: 'HTML rendering with custom CSS class for styling',
};
