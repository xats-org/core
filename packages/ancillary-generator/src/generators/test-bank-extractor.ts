import { BaseAncillaryGenerator } from '../base-generator';

import type { ExtractedContent, GenerationResult, OutputFormat, TestBankOptions } from '../types';

// Internal types for test bank structure
interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  difficulty: string;
  points: number;
  topic: string;
  cognitiveLevel: string;
  timeEstimate: string;
  options?: QuestionOption[];
  correctAnswer?: string | boolean;
  expectedAnswer?: string;
  acceptableVariations?: string[];
  rubric?: string;
  sampleAnswer?: string;
  explanation?: string;
}

interface QuestionOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

interface AnswerKeyItem {
  id: string;
  correctAnswer?: string | boolean | undefined;
  explanation?: string | undefined;
}

interface TestBank {
  title: string;
  generatedAt: string;
  totalQuestions: number;
  questionTypes: Record<string, number>;
  questions: Question[];
  answerKey?: AnswerKeyItem[];
}

/**
 * Extractor for creating test banks from xats documents
 */
export class TestBankExtractor extends BaseAncillaryGenerator {
  supportedFormats: OutputFormat[] = ['json', 'html', 'markdown', 'docx'];

  /**
   * Generate test bank from extracted content
   */
  async generateOutput(
    content: ExtractedContent[],
    options: TestBankOptions
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      if (!this.validateOptions(options)) {
        return this.createErrorResult(options.format, ['Invalid options provided']);
      }

      // Extract and organize questions
      const questions = this.extractQuestions(content, options);

      // Randomize if requested
      if (options.randomizeOrder) {
        this.shuffleArray(questions);
      }

      // Build test bank structure
      const testBank: TestBank = {
        title: 'Test Bank',
        generatedAt: new Date().toISOString(),
        totalQuestions: questions.length,
        questionTypes: this.countQuestionTypes(questions),
        questions,
        ...(options.includeAnswerKey ? { answerKey: this.generateAnswerKey(questions) } : {}),
      };

      // Generate output
      let output: string | Buffer;
      switch (options.format) {
        case 'json':
          output = JSON.stringify(testBank, null, 2);
          break;
        case 'markdown':
          output = this.generateMarkdownTestBank(testBank, options);
          break;
        case 'html':
          output = this.generateHTMLTestBank(testBank, options);
          break;
        case 'docx':
          output = this.generateDOCXTestBank(testBank, options);
          break;
        default:
          return this.createErrorResult(options.format, [`Unsupported format: ${options.format}`]);
      }

      const timeElapsed = Date.now() - startTime;
      return this.createSuccessResult(output, options.format, {
        blocksProcessed: content.length,
        timeElapsed,
        outputSize: Buffer.isBuffer(output) ? output.length : output.length,
      });
    } catch (error) {
      return this.createErrorResult(options.format, [
        `Generation failed: ${error instanceof Error ? error.message : String(error)}`,
      ]);
    }
  }

  /**
   * Extract questions from content
   */
  private extractQuestions(content: ExtractedContent[], options: TestBankOptions): Question[] {
    const questions: Question[] = [];
    const allowedTypes = options.questionTypes || [
      'multiple-choice',
      'true-false',
      'short-answer',
      'essay',
    ];
    const allowedDifficulties = options.difficultyLevels || ['easy', 'medium', 'hard', 'expert'];

    for (const item of content) {
      // Only process items tagged as quiz-bank-item
      if (!item.tags.includes('quiz-bank-item')) continue;

      const questionType = (item.metadata?.questionType || 'multiple-choice') as Question['type'];
      const difficulty = item.metadata?.difficulty || 'medium';

      // Filter by type and difficulty
      if (!allowedTypes.includes(questionType)) continue;
      if (!allowedDifficulties.includes(difficulty)) continue;

      const question = this.createQuestion(item, questionType);
      if (question) {
        questions.push(question);
      }
    }

    // Limit questions per topic if specified
    if (options.questionsPerTopic) {
      const grouped = this.groupQuestionsByTopic(questions);
      const limited: any[] = [];

      for (const topicQuestions of grouped.values()) {
        limited.push(...topicQuestions.slice(0, options.questionsPerTopic));
      }

      return limited;
    }

    return questions;
  }

  /**
   * Create a question object from extracted content
   */
  private createQuestion(
    item: ExtractedContent,
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  ): Question | null {
    const questionText = this.extractPlainText(
      item.content as Parameters<typeof this.extractPlainText>[0]
    );
    if (!questionText) return null;

    const question: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      question: questionText,
      difficulty: item.metadata?.difficulty || 'medium',
      points: item.metadata?.points || 1,
      topic: item.path[1] || 'General',
      cognitiveLevel: item.metadata?.cognitiveLevel || 'understand',
      timeEstimate: item.metadata?.timeEstimate || 'PT2M',
    };

    // Add type-specific properties
    switch (type) {
      case 'multiple-choice':
        question.options = this.generateOptions(item);
        question.correctAnswer = (item.metadata?.correctAnswer as string) || 'A';
        break;
      case 'true-false':
        question.correctAnswer = (item.metadata?.correctAnswer as boolean) ?? true;
        break;
      case 'short-answer':
        question.expectedAnswer = (item.metadata?.expectedAnswer as string) || '';
        question.acceptableVariations = (item.metadata?.acceptableVariations as string[]) || [];
        break;
      case 'essay':
        question.rubric =
          (item.metadata?.rubricGuidance as string | undefined) ??
          'Evaluate based on understanding and clarity';
        question.sampleAnswer = (item.metadata?.sampleAnswer as string | undefined) ?? '';
        break;
    }

    return question;
  }

  /**
   * Generate multiple choice options
   */
  private generateOptions(item: ExtractedContent): QuestionOption[] {
    const options: QuestionOption[] = [];
    const correctAnswer = item.metadata?.correctAnswer || 'Option A';
    const distractors = item.metadata?.distractorHints || [];

    // Add correct answer
    options.push({
      label: 'A',
      text: correctAnswer,
      isCorrect: true,
    });

    // Add distractors
    const labels = ['B', 'C', 'D', 'E'];
    for (let i = 0; i < Math.min(distractors.length, 4); i++) {
      options.push({
        label: labels[i] || 'X',
        text: distractors[i] as string,
        isCorrect: false,
      });
    }

    // Fill remaining options if needed
    while (options.length < 4) {
      const labelIndex = options.length - 1;
      const label = labels[labelIndex] || 'X';
      options.push({
        label,
        text: `Option ${label}`,
        isCorrect: false,
      });
    }

    return options;
  }

  /**
   * Group questions by topic
   */
  private groupQuestionsByTopic(questions: Question[]): Map<string, Question[]> {
    const grouped = new Map<string, Question[]>();

    for (const question of questions) {
      const topic = question.topic || 'General';
      if (!grouped.has(topic)) {
        grouped.set(topic, []);
      }
      grouped.get(topic)!.push(question);
    }

    return grouped;
  }

  /**
   * Count questions by type
   */
  private countQuestionTypes(questions: Question[]): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const question of questions) {
      counts[question.type] = (counts[question.type] || 0) + 1;
    }

    return counts;
  }

  /**
   * Generate answer key
   */
  private generateAnswerKey(questions: Question[]): AnswerKeyItem[] {
    return questions.map((q) => ({
      id: q.id,
      correctAnswer: q.correctAnswer ?? q.expectedAnswer ?? q.sampleAnswer,
      explanation: q.explanation ?? undefined,
    }));
  }

  /**
   * Shuffle array in place
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i]!;
      array[i] = array[j]!;
      array[j] = temp;
    }
  }

  /**
   * Generate Markdown test bank
   */
  private generateMarkdownTestBank(testBank: TestBank, options: TestBankOptions): string {
    let markdown = `# ${testBank.title}\n\n`;
    markdown += `*Generated: ${new Date(testBank.generatedAt).toLocaleDateString()}*\n\n`;
    markdown += `**Total Questions:** ${testBank.totalQuestions}\n\n`;

    // Question type breakdown
    markdown += '## Question Types\n';
    for (const [type, count] of Object.entries(testBank.questionTypes)) {
      markdown += `- ${type}: ${count}\n`;
    }
    markdown += '\n';

    // Questions
    markdown += '## Questions\n\n';
    for (let i = 0; i < testBank.questions.length; i++) {
      const q = testBank.questions[i];
      if (!q) continue;
      markdown += `### Question ${i + 1} (${q.type}, ${q.difficulty}, ${q.points} pts)\n\n`;
      markdown += `**Topic:** ${q.topic}\n`;
      markdown += `**Cognitive Level:** ${q.cognitiveLevel}\n\n`;
      markdown += `${q.question}\n\n`;

      // Type-specific formatting
      if (q) {
        switch (q.type) {
          case 'multiple-choice':
            if (q.options) {
              for (const opt of q.options) {
                markdown += `${opt.label}. ${opt.text}\n`;
              }
            }
            markdown += '\n';
            break;
          case 'true-false':
            markdown += 'A. True\nB. False\n\n';
            break;
          case 'short-answer':
            markdown += '_____________________\n\n';
            break;
          case 'essay':
            markdown += `*Essay question - ${q.timeEstimate}*\n\n`;
            if (options.includeRubrics && q.rubric) {
              markdown += `**Rubric:** ${q.rubric}\n\n`;
            }
            break;
        }
      }
    }

    // Answer key
    if (options.includeAnswerKey && testBank.answerKey) {
      markdown += '\n---\n\n## Answer Key\n\n';
      for (let i = 0; i < testBank.answerKey.length; i++) {
        const answer = testBank.answerKey[i];
        if (answer) {
          markdown += `${i + 1}. ${answer.correctAnswer ?? 'N/A'}\n`;
          if (answer.explanation) {
            markdown += `   *${answer.explanation}*\n`;
          }
        }
      }
    }

    return markdown;
  }

  /**
   * Generate HTML test bank
   */
  private generateHTMLTestBank(testBank: TestBank, options: TestBankOptions): string {
    const questionsHTML = testBank.questions
      .map((q, i) =>
        q
          ? `
      <div class="question" data-type="${q.type}" data-difficulty="${q.difficulty}">
        <h3>Question ${i + 1}</h3>
        <div class="metadata">
          <span class="type">${q.type}</span>
          <span class="difficulty">${q.difficulty}</span>
          <span class="points">${q.points} pts</span>
        </div>
        <p class="question-text">${q.question}</p>
        ${this.formatQuestionHTML(q)}
      </div>
    `
          : ''
      )
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
    <title>${testBank.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .question { border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .metadata { margin: 10px 0; }
        .metadata span { display: inline-block; padding: 3px 8px; margin-right: 10px; background: #f0f0f0; border-radius: 3px; font-size: 0.9em; }
        .options { list-style: none; padding: 0; }
        .options li { padding: 5px 0; }
        .answer-key { background: #f9f9f9; padding: 20px; margin-top: 40px; border-top: 2px solid #333; }
    </style>
</head>
<body>
    <h1>${testBank.title}</h1>
    <p>Generated: ${new Date(testBank.generatedAt).toLocaleDateString()}</p>
    <p>Total Questions: ${testBank.totalQuestions}</p>
    ${questionsHTML}
    ${options.includeAnswerKey && testBank.answerKey ? this.formatAnswerKeyHTML(testBank.answerKey) : ''}
</body>
</html>`;
  }

  /**
   * Format question as HTML
   */
  private formatQuestionHTML(question: Question): string {
    switch (question.type) {
      case 'multiple-choice':
        return `<ul class="options">${
          question.options?.map((opt) => `<li>${opt.label}. ${opt.text}</li>`).join('') || ''
        }</ul>`;
      case 'true-false':
        return '<ul class="options"><li>A. True</li><li>B. False</li></ul>';
      case 'short-answer':
        return '<input type="text" style="width: 100%; padding: 5px;" />';
      case 'essay':
        return '<textarea style="width: 100%; height: 150px; padding: 5px;"></textarea>';
      default:
        return '';
    }
  }

  /**
   * Format answer key as HTML
   */
  private formatAnswerKeyHTML(answerKey: AnswerKeyItem[]): string {
    const answersHTML = answerKey
      .map(
        (a, i) =>
          `<li>${i + 1}. ${a.correctAnswer}${a.explanation ? ` - ${a.explanation}` : ''}</li>`
      )
      .join('');

    return `<div class="answer-key">
      <h2>Answer Key</h2>
      <ol>${answersHTML}</ol>
    </div>`;
  }

  /**
   * Generate DOCX test bank (placeholder)
   */
  private generateDOCXTestBank(testBank: TestBank, options: TestBankOptions): Buffer {
    const markdown = this.generateMarkdownTestBank(testBank, options);
    return Buffer.from(markdown, 'utf-8');
  }
}
