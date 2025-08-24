import { describe, it, expect } from 'vitest';
import { StudyGuideGenerator, SlideDeckGenerator, TestBankExtractor } from '../src';
import type { XatsDocument } from '@xats-org/types';

// Sample xats document for testing
const sampleDocument: XatsDocument = {
  schemaVersion: '0.5.0',
  bibliographicEntry: {
    title: 'Test Document',
    author: [{ family: 'Test', given: 'Author' }],
    issued: { 'date-parts': [[2024, 1, 1]] },
    type: 'book',
  },
  subject: 'test-subject',
  bodyMatter: {
    contents: [
      {
        type: 'chapter',
        label: 'Chapter 1',
        title: {
          runs: [{ type: 'text', text: 'Introduction' }],
        },
        content: [
          {
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              runs: [{ type: 'text', text: 'This is important content for study guides.' }],
            },
            tags: ['study-guide-content'],
            extensions: {
              ancillary: {
                importance: 'critical',
                reviewFrequency: 'always',
              },
            },
          },
          {
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              runs: [{ type: 'text', text: 'This is slide content.' }],
            },
            tags: ['slide-content'],
            extensions: {
              ancillary: {
                slideType: 'bullet-points',
                maxBulletPoints: 3,
              },
            },
          },
          {
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              runs: [{ type: 'text', text: 'What is the capital of France?' }],
            },
            tags: ['quiz-bank-item'],
            extensions: {
              ancillary: {
                questionType: 'multiple-choice',
                difficulty: 'easy',
                correctAnswer: 'Paris',
                distractorHints: ['London', 'Berlin', 'Madrid'],
              },
            },
          },
        ],
      },
    ],
  },
};

describe('StudyGuideGenerator', () => {
  const generator = new StudyGuideGenerator();

  it('should extract tagged content', () => {
    const content = generator.extractTaggedContent(sampleDocument, {
      tags: ['study-guide-content'],
    });

    expect(content).toHaveLength(1);
    expect(content[0].tags).toContain('study-guide-content');
  });

  it('should generate markdown output', async () => {
    const content = generator.extractTaggedContent(sampleDocument, {
      tags: ['study-guide-content'],
    });

    const result = await generator.generateOutput(content, {
      format: 'markdown',
      includeSummaries: true,
      groupBy: 'chapter',
    });

    expect(result.success).toBe(true);
    expect(result.format).toBe('markdown');
    expect(result.output).toBeDefined();
    expect(typeof result.output).toBe('string');
  });

  it('should validate supported formats', () => {
    const isValid = generator.validateOptions({
      format: 'markdown',
    });
    expect(isValid).toBe(true);

    const isInvalid = generator.validateOptions({
      format: 'unsupported' as any,
    });
    expect(isInvalid).toBe(false);
  });
});

describe('SlideDeckGenerator', () => {
  const generator = new SlideDeckGenerator();

  it('should extract slide content', () => {
    const content = generator.extractTaggedContent(sampleDocument, {
      tags: ['slide-content'],
    });

    expect(content).toHaveLength(1);
    expect(content[0].tags).toContain('slide-content');
  });

  it('should generate markdown slides', async () => {
    const content = generator.extractTaggedContent(sampleDocument, {
      tags: ['slide-content'],
    });

    const result = await generator.generateOutput(content, {
      format: 'markdown',
      maxSlides: 10,
      includeSpeakerNotes: true,
    });

    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
    expect(result.output).toContain('---'); // Slide separator
  });
});

describe('TestBankExtractor', () => {
  const extractor = new TestBankExtractor();

  it('should extract quiz questions', () => {
    const content = extractor.extractTaggedContent(sampleDocument, {
      tags: ['quiz-bank-item'],
    });

    expect(content).toHaveLength(1);
    expect(content[0].tags).toContain('quiz-bank-item');
  });

  it('should generate JSON test bank', async () => {
    const content = extractor.extractTaggedContent(sampleDocument, {
      tags: ['quiz-bank-item'],
    });

    const result = await extractor.generateOutput(content, {
      format: 'json',
      includeAnswerKey: true,
    });

    expect(result.success).toBe(true);
    expect(result.format).toBe('json');
    
    const testBank = JSON.parse(result.output as string);
    expect(testBank.questions).toHaveLength(1);
    expect(testBank.answerKey).toBeDefined();
  });

  it('should filter by question type', async () => {
    const content = extractor.extractTaggedContent(sampleDocument, {
      tags: ['quiz-bank-item'],
    });

    const result = await extractor.generateOutput(content, {
      format: 'json',
      questionTypes: ['true-false'], // Filter out multiple-choice
      includeAnswerKey: false,
    });

    expect(result.success).toBe(true);
    const testBank = JSON.parse(result.output as string);
    expect(testBank.questions).toHaveLength(0); // No true-false questions
  });
});