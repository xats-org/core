/**
 * @xats/mcp-server - Analyze Tool Implementation
 */

import { AnalysisError } from '../types.js';

import type {
  AnalyzeInput,
  AnalyzeResult,
  McpServerConfig,
  DocumentStructure,
  DocumentStatistics,
  DocumentIssue,
} from '../types.js';
import type { XatsDocument, SemanticText } from '@xats/types';

/**
 * Extract text content from SemanticText objects
 */
function extractTextFromSemanticText(semanticText: SemanticText | undefined): string {
  if (!semanticText?.runs) return '';

  return semanticText.runs
    .filter((run) => run.type === 'text')
    .map((run) => run.text || '')
    .join(' ');
}

/**
 * Count words in text content
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Calculate reading time (assuming 200 words per minute)
 */
function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200);
}

/**
 * Calculate text complexity score based on various factors
 */
function calculateComplexityScore(text: string): number {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0);

  if (words.length === 0 || sentences.length === 0) return 0;

  // Average words per sentence
  const avgWordsPerSentence = words.length / sentences.length;

  // Average syllables per word (rough estimate)
  const avgSyllablesPerWord =
    words.reduce((sum, word) => {
      // Simple syllable counting heuristic
      const syllables =
        word
          .toLowerCase()
          .replace(/[^a-z]/g, '')
          .replace(/e$/, '')
          .match(/[aeiouy]+/g)?.length || 1;
      return sum + syllables;
    }, 0) / words.length;

  // Flesch-Kincaid grade level (simplified)
  const complexityScore = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  return Math.max(0, Math.min(20, complexityScore)); // Cap between 0-20
}

/**
 * Analyze document structure
 */
function analyzeDocumentStructure(document: XatsDocument): DocumentStructure {
  const structure: DocumentStructure = {
    type: 'textbook',
    containers: {
      units: 0,
      chapters: 0,
      sections: 0,
    },
    contentBlocks: {
      total: 0,
      byType: {},
    },
    assessments: {
      total: 0,
      byType: {},
    },
    pathways: {
      total: 0,
      byType: {},
    },
  };

  // Analyze body matter
  if (document.bodyMatter?.contents) {
    for (const container of document.bodyMatter.contents) {
      if ('contents' in container) {
        // This is a chapter or unit
        if ('pathways' in container) {
          structure.containers.chapters++;
        } else {
          structure.containers.units++;
        }

        // Count pathways
        if (container.pathways) {
          for (const pathway of container.pathways) {
            structure.pathways.total++;
            const pathwayType = pathway.pathwayType || 'unknown';
            structure.pathways.byType[pathwayType] =
              (structure.pathways.byType[pathwayType] || 0) + 1;
          }
        }

        // Analyze sections and content blocks
        if (container.contents) {
          for (const section of container.contents) {
            if ('contents' in section) {
              structure.containers.sections++;

              // Analyze content blocks in section
              if (section.contents) {
                for (const block of section.contents) {
                  if ('blockType' in block) {
                    structure.contentBlocks.total++;
                    const blockType = block.blockType || 'unknown';
                    structure.contentBlocks.byType[blockType] =
                      (structure.contentBlocks.byType[blockType] || 0) + 1;

                    // Check if it's an assessment block
                    if (
                      blockType.includes('assessment') ||
                      blockType.includes('quiz') ||
                      blockType.includes('test')
                    ) {
                      structure.assessments.total++;
                      structure.assessments.byType[blockType] =
                        (structure.assessments.byType[blockType] || 0) + 1;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Determine document type based on structure
  if (structure.assessments.total > structure.contentBlocks.total * 0.5) {
    structure.type = 'course'; // Assessment-heavy
  } else if (structure.containers.chapters > 1) {
    structure.type = 'textbook';
  } else if (structure.containers.chapters === 1) {
    structure.type = 'chapter';
  } else if (structure.containers.units > 0) {
    structure.type = 'unit';
  }

  return structure;
}

/**
 * Calculate document statistics
 */
function calculateDocumentStatistics(document: XatsDocument): DocumentStatistics {
  let totalText = '';
  let learningObjectives = 0;
  let resources = 0;
  let references = 0;

  // Extract text from all content blocks
  function extractTextFromContainer(container: any): void {
    if (container.title) {
      totalText += ` ${extractTextFromSemanticText(container.title)}`;
    }

    if (container.learningOutcomes) {
      learningObjectives += container.learningOutcomes.length;
      for (const outcome of container.learningOutcomes) {
        if (outcome.statement) {
          totalText += ` ${extractTextFromSemanticText(outcome.statement)}`;
        }
      }
    }

    if (container.contents) {
      for (const item of container.contents) {
        if ('blockType' in item && item.content) {
          // Extract text from content blocks
          if (item.content.text) {
            totalText += ` ${extractTextFromSemanticText(item.content.text)}`;
          }

          // Count resources
          if (
            item.blockType?.includes('figure') ||
            item.blockType?.includes('image') ||
            item.blockType?.includes('video')
          ) {
            resources++;
          }
        } else if ('contents' in item) {
          // Recurse into nested containers
          extractTextFromContainer(item);
        }
      }
    }
  }

  // Analyze body matter
  if (document.bodyMatter?.contents) {
    for (const container of document.bodyMatter.contents) {
      extractTextFromContainer(container);
    }
  }

  // Count references from runs
  function countReferences(text: SemanticText | undefined): void {
    if (text?.runs) {
      for (const run of text.runs) {
        if (run.type === 'reference' || run.type === 'citation') {
          references++;
        }
      }
    }
  }

  // Count references in bibliographic data
  if (document.bibliographicEntry) {
    references++; // The document itself is a reference
  }

  const wordCount = countWords(totalText);

  return {
    wordCount,
    characterCount: totalText.length,
    readingTimeMinutes: calculateReadingTime(wordCount),
    complexityScore: calculateComplexityScore(totalText),
    learningObjectives,
    resources,
    references,
  };
}

/**
 * Find potential issues in the document
 */
function findDocumentIssues(
  document: XatsDocument,
  structure: DocumentStructure,
  statistics: DocumentStatistics
): DocumentIssue[] {
  const issues: DocumentIssue[] = [];

  // Check for missing required fields
  if (!document.schemaVersion) {
    issues.push({
      level: 'error',
      message: 'Missing schema version',
      path: 'schemaVersion',
      code: 'MISSING_SCHEMA_VERSION',
      suggestion: 'Add schemaVersion field to specify the xats schema version',
    });
  }

  if (!document.bibliographicEntry) {
    issues.push({
      level: 'error',
      message: 'Missing bibliographic entry',
      path: 'bibliographicEntry',
      code: 'MISSING_BIBLIOGRAPHIC_ENTRY',
      suggestion: 'Add bibliographicEntry with title, author, and other metadata',
    });
  }

  if (!document.subject) {
    issues.push({
      level: 'warning',
      message: 'Missing subject classification',
      path: 'subject',
      code: 'MISSING_SUBJECT',
      suggestion: 'Add subject field to categorize the document content',
    });
  }

  // Check structure issues
  if (structure.containers.chapters === 0 && structure.containers.units === 0) {
    issues.push({
      level: 'warning',
      message: 'Document has no chapters or units',
      path: 'bodyMatter.contents',
      code: 'NO_MAIN_CONTAINERS',
      suggestion: 'Add at least one chapter or unit to organize content',
    });
  }

  if (structure.contentBlocks.total === 0) {
    issues.push({
      level: 'warning',
      message: 'Document has no content blocks',
      path: 'bodyMatter',
      code: 'NO_CONTENT_BLOCKS',
      suggestion: 'Add content blocks (paragraphs, headings, etc.) to provide actual content',
    });
  }

  // Check content quality issues
  if (statistics.wordCount < 50) {
    issues.push({
      level: 'info',
      message: 'Document has very little text content',
      path: 'bodyMatter',
      code: 'LOW_WORD_COUNT',
      suggestion: 'Consider adding more detailed content to improve educational value',
    });
  }

  if (statistics.complexityScore > 16) {
    issues.push({
      level: 'info',
      message: 'Content may be too complex for target audience',
      path: 'bodyMatter',
      code: 'HIGH_COMPLEXITY',
      suggestion: 'Consider simplifying language or adding explanatory content',
    });
  }

  if (statistics.learningObjectives === 0 && structure.type === 'textbook') {
    issues.push({
      level: 'info',
      message: 'No learning objectives found',
      path: 'bodyMatter',
      code: 'NO_LEARNING_OBJECTIVES',
      suggestion: 'Add learning objectives to chapters to improve pedagogical structure',
    });
  }

  // Check for accessibility issues
  if (statistics.resources > 0 && statistics.resources > structure.contentBlocks.total * 0.3) {
    issues.push({
      level: 'info',
      message: 'High ratio of media resources to text content',
      path: 'bodyMatter',
      code: 'HIGH_MEDIA_RATIO',
      suggestion: 'Ensure all media resources have appropriate alt text and descriptions',
    });
  }

  return issues;
}

/**
 * Analyze a xats document structure and content
 */
export async function analyzeTool(
  input: AnalyzeInput,
  config: McpServerConfig
): Promise<AnalyzeResult> {
  try {
    // Validate input
    if (!input.document) {
      throw new AnalysisError('Document is required for analysis');
    }

    const depth = input.depth || 'detailed';
    const includeIssues = input.includeIssues ?? true;
    const includeStatistics = input.includeStatistics ?? true;

    // Perform basic structure analysis
    const structure = analyzeDocumentStructure(input.document);

    let statistics: DocumentStatistics | undefined;
    let issues: DocumentIssue[] = [];

    // Perform detailed analysis based on depth
    if (depth !== 'basic') {
      if (includeStatistics) {
        statistics = calculateDocumentStatistics(input.document);
      }

      if (includeIssues && depth === 'comprehensive') {
        issues = findDocumentIssues(
          input.document,
          structure,
          statistics || {
            wordCount: 0,
            characterCount: 0,
            readingTimeMinutes: 0,
            complexityScore: 0,
            learningObjectives: 0,
            resources: 0,
            references: 0,
          }
        );
      }
    }

    return {
      success: true,
      data: {
        structure,
        statistics: statistics || {
          wordCount: 0,
          characterCount: 0,
          readingTimeMinutes: 0,
          complexityScore: 0,
          learningObjectives: 0,
          resources: 0,
          references: 0,
        },
        issues,
      },
      metadata: {
        toolName: 'xats_analyze',
        timestamp: new Date().toISOString(),
        depth,
        includeIssues,
        includeStatistics,
        documentId: 'analyzed',
        schemaVersion: input.document.schemaVersion,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown analysis error',
      metadata: {
        toolName: 'xats_analyze',
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        depth: input.depth,
      },
    };
  }
}

/**
 * Get analysis summary for multiple documents
 */
export function getAnalysisSummary(results: AnalyzeResult[]): {
  totalDocuments: number;
  averageWordCount: number;
  totalIssues: number;
  commonIssues: Record<string, number>;
  documentTypes: Record<string, number>;
} {
  const summary = {
    totalDocuments: results.length,
    averageWordCount: 0,
    totalIssues: 0,
    commonIssues: {} as Record<string, number>,
    documentTypes: {} as Record<string, number>,
  };

  let totalWords = 0;

  for (const result of results) {
    if (result.success && result.data) {
      // Count words
      if (result.data.statistics) {
        totalWords += result.data.statistics.wordCount;
      }

      // Count document types
      const docType = result.data.structure.type;
      summary.documentTypes[docType] = (summary.documentTypes[docType] || 0) + 1;

      // Count issues
      summary.totalIssues += result.data.issues.length;
      for (const issue of result.data.issues) {
        const issueCode = issue.code || 'unknown';
        summary.commonIssues[issueCode] = (summary.commonIssues[issueCode] || 0) + 1;
      }
    }
  }

  summary.averageWordCount = results.length > 0 ? Math.round(totalWords / results.length) : 0;

  return summary;
}
