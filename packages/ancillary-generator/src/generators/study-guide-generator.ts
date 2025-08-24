import { marked } from 'marked';
import Mustache from 'mustache';

import { BaseAncillaryGenerator } from '../base-generator';

import type { ExtractedContent, GenerationResult, OutputFormat, StudyGuideOptions } from '../types';
import type { SemanticText } from '@xats-org/types';

// Internal types for study guide structure
interface ConceptItem {
  text: string;
  tips: string[];
}

interface PracticeQuestion {
  question: string;
  type: string;
  difficulty: string;
}

interface StudyGuideSection {
  title: string;
  content: unknown[];
  learningObjectives?: string[];
  summary?: string;
  keyTerms?: Array<{ term: string; definition: string }>;
  practiceQuestions?: PracticeQuestion[];
  criticalConcepts?: ConceptItem[];
  importantConcepts?: ConceptItem[];
  additionalNotes?: ConceptItem[];
}

interface StudyGuideStructure {
  title: string;
  generatedAt: string;
  sections: StudyGuideSection[];
}

/**
 * Generator for creating study guides from xats documents
 */
export class StudyGuideGenerator extends BaseAncillaryGenerator {
  supportedFormats: OutputFormat[] = ['html', 'markdown', 'pdf', 'docx'];

  /**
   * Generate a study guide from extracted content
   */
  async generateOutput(
    content: ExtractedContent[],
    options: StudyGuideOptions
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      // Validate options
      if (!this.validateOptions(options)) {
        return this.createErrorResult(options.format, ['Invalid options provided']);
      }

      // Organize content by grouping preference
      const organized = this.organizeContent(content, options);

      // Build study guide structure
      const studyGuide = this.buildStudyGuide(organized, options);

      // Generate output based on format
      let output: string | Buffer;
      switch (options.format) {
        case 'markdown':
          output = this.generateMarkdown(studyGuide);
          break;
        case 'html':
          output = await this.generateHTML(studyGuide, options);
          break;
        case 'docx':
          output = await this.generateDOCX(studyGuide, options);
          break;
        case 'pdf':
          output = await this.generatePDF(studyGuide, options);
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
   * Organize content by specified grouping
   */
  private organizeContent(
    content: ExtractedContent[],
    options: StudyGuideOptions
  ): Map<string, ExtractedContent[]> {
    const organized = new Map<string, ExtractedContent[]>();
    const groupBy = options.groupBy || 'chapter';

    for (const item of content) {
      // Determine group key based on path
      let groupKey = 'General';

      if (groupBy === 'chapter' && item.path.length > 1) {
        groupKey = item.path[1] || 'General';
      } else if (groupBy === 'section' && item.path.length > 2) {
        groupKey = item.path.slice(1, 3).join(' - ');
      } else if (groupBy === 'unit' && item.path.length > 0) {
        groupKey = item.path[0];
      }

      if (!organized.has(groupKey)) {
        organized.set(groupKey, []);
      }
      organized.get(groupKey)!.push(item);
    }

    return organized;
  }

  /**
   * Build study guide structure
   */
  private buildStudyGuide(
    organized: Map<string, ExtractedContent[]>,
    options: StudyGuideOptions
  ): StudyGuideStructure {
    const sections: StudyGuideSection[] = [];

    for (const [groupName, items] of organized.entries()) {
      const section: StudyGuideSection = {
        title: groupName,
        content: [],
      };

      // Add learning objectives if requested
      if (options.includeLearningObjectives) {
        const objectives = this.extractLearningObjectives(items);
        if (objectives.length > 0) {
          section.learningObjectives = objectives;
        }
      }

      // Add summaries if requested
      if (options.includeSummaries) {
        const summary = this.generateSummary(items);
        if (summary) {
          section.summary = summary;
        }
      }

      // Add key terms if requested
      if (options.includeGlossary) {
        const terms = this.extractKeyTerms(items);
        if (terms.length > 0) {
          section.keyTerms = terms;
        }
      }

      // Add practice questions if requested
      if (options.includePracticeQuestions) {
        const questions = this.extractPracticeQuestions(items);
        if (questions.length > 0) {
          section.practiceQuestions = questions;
        }
      }

      // Process content blocks by importance
      const contentByImportance = this.groupByImportance(items);
      section.criticalConcepts = contentByImportance.critical;
      section.importantConcepts = contentByImportance.important;
      section.additionalNotes = contentByImportance.helpful;

      sections.push(section);
    }

    return {
      title: 'Study Guide',
      generatedAt: new Date().toISOString(),
      sections,
    };
  }

  /**
   * Extract learning objectives from content
   */
  private extractLearningObjectives(items: ExtractedContent[]): string[] {
    const objectives: string[] = [];

    for (const item of items) {
      // Check if block has learning objective metadata
      if (item.metadata?.learningObjective) {
        objectives.push(item.metadata.learningObjective as string);
      }

      // Check for specific learning objective block types
      if (item.sourceBlock.blockType?.includes('learning-objective')) {
        const text = this.extractPlainText(item.content as SemanticText);
        if (text) objectives.push(text);
      }
    }

    return objectives;
  }

  /**
   * Generate summary from content items
   */
  private generateSummary(items: ExtractedContent[]): string {
    const summaryPoints: string[] = [];

    for (const item of items) {
      // Look for content marked as summary-worthy
      const importance =
        item.metadata?.importance || (item.sourceBlock.extensions as Record<string, any>)?.ancillary?.importance;

      if (importance === 'critical' || importance === 'important') {
        const text = this.extractPlainText(item.content as SemanticText);
        if (text && text.length > 20) {
          // Truncate to first sentence or 150 chars
          const firstSentence = text.match(/^[^.!?]+[.!?]/);
          const summary = firstSentence ? firstSentence[0] : `${text.substring(0, 150)}...`;
          summaryPoints.push(summary);
        }
      }
    }

    return summaryPoints.join(' ');
  }

  /**
   * Extract key terms from content
   */
  private extractKeyTerms(items: ExtractedContent[]): Array<{ term: string; definition: string }> {
    const terms: Array<{ term: string; definition: string }> = [];

    for (const item of items) {
      // Check for definition block types
      if (
        item.sourceBlock.blockType?.includes('definition') ||
        item.sourceBlock.blockType?.includes('glossary')
      ) {
        const content = item.content as { term?: unknown; definition?: unknown };
        if (content?.term && content?.definition) {
          terms.push({
            term: this.extractPlainText(content.term as SemanticText),
            definition: this.extractPlainText(content.definition as SemanticText),
          });
        }
      }
    }

    return terms;
  }

  /**
   * Extract practice questions from content
   */
  private extractPracticeQuestions(items: ExtractedContent[]): PracticeQuestion[] {
    const questions: PracticeQuestion[] = [];

    for (const item of items) {
      // Check for quiz-bank-item tags
      if (item.tags.includes('quiz-bank-item')) {
        questions.push({
          question: this.extractPlainText(item.content as SemanticText),
          type: (item.metadata?.questionType as string) || 'review',
          difficulty: (item.metadata?.difficulty as string) || 'medium',
        });
      }
    }

    return questions;
  }

  /**
   * Group content by importance level
   */
  private groupByImportance(items: ExtractedContent[]): {
    critical: ConceptItem[];
    important: ConceptItem[];
    helpful: ConceptItem[];
  } {
    const grouped = {
      critical: [] as ConceptItem[],
      important: [] as ConceptItem[],
      helpful: [] as ConceptItem[],
    };

    for (const item of items) {
      const importance = (item.metadata?.importance as string) || 'important';
      const content = {
        text: this.extractPlainText(item.content as SemanticText),
        tips: (item.metadata?.studyTips as string[]) || [],
      };

      switch (importance) {
        case 'critical':
          grouped.critical.push(content);
          break;
        case 'important':
          grouped.important.push(content);
          break;
        case 'helpful':
        case 'optional':
          grouped.helpful.push(content);
          break;
        default:
          grouped.important.push(content);
      }
    }

    return grouped;
  }

  /**
   * Generate Markdown output
   */
  private generateMarkdown(studyGuide: StudyGuideStructure): string {
    let markdown = `# ${studyGuide.title}\n\n`;
    markdown += `*Generated: ${new Date(studyGuide.generatedAt).toLocaleDateString()}*\n\n`;

    for (const section of studyGuide.sections) {
      markdown += `## ${section.title}\n\n`;

      if (section.learningObjectives) {
        markdown += '### Learning Objectives\n';
        for (const obj of section.learningObjectives) {
          markdown += `- ${obj}\n`;
        }
        markdown += '\n';
      }

      if (section.summary) {
        markdown += `### Summary\n${section.summary}\n\n`;
      }

      if (section.criticalConcepts?.length > 0) {
        markdown += '### Critical Concepts\n';
        for (const concept of section.criticalConcepts) {
          markdown += `**${concept.text}**\n`;
          if (concept.tips?.length > 0) {
            markdown += `*Study Tips: ${concept.tips.join(', ')}*\n`;
          }
          markdown += '\n';
        }
      }

      if (section.importantConcepts?.length > 0) {
        markdown += '### Important Concepts\n';
        for (const concept of section.importantConcepts) {
          markdown += `- ${concept.text}\n`;
        }
        markdown += '\n';
      }

      if (section.keyTerms?.length > 0) {
        markdown += '### Key Terms\n';
        for (const term of section.keyTerms) {
          markdown += `**${term.term}**: ${term.definition}\n\n`;
        }
      }

      if (section.practiceQuestions?.length > 0) {
        markdown += '### Practice Questions\n';
        for (let i = 0; i < section.practiceQuestions.length; i++) {
          const q = section.practiceQuestions[i];
          markdown += `${i + 1}. ${q.question} *(${q.difficulty})*\n`;
        }
        markdown += '\n';
      }

      markdown += '---\n\n';
    }

    return markdown;
  }

  /**
   * Generate HTML output
   */
  private async generateHTML(
    studyGuide: StudyGuideStructure,
    options: StudyGuideOptions
  ): Promise<string> {
    const markdown = this.generateMarkdown(studyGuide);
    const htmlContent = await marked(markdown);

    // Use template if provided
    if (options.template) {
      return Mustache.render(options.template.content, {
        content: htmlContent,
        title: studyGuide.title,
        ...studyGuide,
      });
    }

    // Default HTML template
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${studyGuide.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        .critical { background-color: #ffebee; padding: 10px; border-left: 4px solid #f44336; margin: 10px 0; }
        .important { background-color: #fff3e0; padding: 10px; border-left: 4px solid #ff9800; margin: 10px 0; }
        .term { font-weight: bold; color: #3498db; }
        .question { background-color: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
  }

  /**
   * Generate DOCX output (placeholder - would use a library like docx)
   */
  private async generateDOCX(
    studyGuide: StudyGuideStructure,
    _options: StudyGuideOptions
  ): Promise<Buffer> {
    // This would use the @xats-org/converter-word package
    // For now, return a placeholder
    const markdown = this.generateMarkdown(studyGuide);
    return Buffer.from(markdown, 'utf-8');
  }

  /**
   * Generate PDF output (placeholder - would use a library like puppeteer or pdfkit)
   */
  private async generatePDF(
    studyGuide: StudyGuideStructure,
    options: StudyGuideOptions
  ): Promise<Buffer> {
    // This would generate actual PDF
    // For now, return a placeholder
    const html = await this.generateHTML(studyGuide, options);
    return Buffer.from(html, 'utf-8');
  }
}
