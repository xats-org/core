import type { XatsDocument, ContentBlock, SemanticText } from '@xats-org/types';

/**
 * Options for extracting content based on tags
 */
export interface ExtractionOptions {
  /** Tags to filter content by */
  tags: string[];
  /** Whether to include nested content */
  includeNested?: boolean;
  /** Maximum depth for nested content extraction */
  maxDepth?: number;
  /** Whether to preserve document structure */
  preserveStructure?: boolean;
  /** Custom filtering function */
  filter?: (block: ContentBlock) => boolean;
}

/**
 * Template configuration for output generation
 */
export interface Template {
  /** Template name */
  name: string;
  /** Template format (mustache, handlebars, etc.) */
  format: 'mustache' | 'handlebars' | 'ejs';
  /** Template content or path to template file */
  content: string;
  /** Additional template options */
  options?: Record<string, any>;
}

/**
 * Supported output formats
 */
export type OutputFormat = 
  | 'html'
  | 'pdf'
  | 'docx'
  | 'pptx'
  | 'latex'
  | 'markdown'
  | 'json';

/**
 * Configuration for generating ancillary materials
 */
export interface GenerationOptions {
  /** Output format */
  format: OutputFormat;
  /** Template to use for generation */
  template?: Template;
  /** Custom styling options */
  styling?: Record<string, any>;
  /** Metadata to include in output */
  metadata?: Record<string, any>;
  /** Whether to include source references */
  includeReferences?: boolean;
  /** Output file path */
  outputPath?: string;
}

/**
 * Result of content extraction
 */
export interface ExtractedContent {
  /** Original block from which content was extracted */
  sourceBlock: ContentBlock;
  /** Extracted content */
  content: any;
  /** Tags associated with this content */
  tags: string[];
  /** Hierarchical path in document */
  path: string[];
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Result of ancillary generation
 */
export interface GenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated output content */
  output?: string | Buffer;
  /** Output format */
  format: OutputFormat;
  /** Path to output file if saved */
  outputPath?: string;
  /** Any errors encountered */
  errors?: string[];
  /** Generation statistics */
  stats?: {
    blocksProcessed: number;
    timeElapsed: number;
    outputSize: number;
  };
}

/**
 * Base interface for ancillary generators
 */
export interface AncillaryGenerator {
  /** Extract tagged content from document */
  extractTaggedContent(
    document: XatsDocument,
    options: ExtractionOptions
  ): ExtractedContent[];
  
  /** Generate output from extracted content */
  generateOutput(
    content: ExtractedContent[],
    options: GenerationOptions
  ): Promise<GenerationResult>;
  
  /** Supported output formats */
  supportedFormats: OutputFormat[];
  
  /** Validate generation options */
  validateOptions(options: GenerationOptions): boolean;
}

/**
 * Study guide specific types
 */
export interface StudyGuideOptions extends GenerationOptions {
  /** Include learning objectives */
  includeLearningObjectives?: boolean;
  /** Include practice questions */
  includePracticeQuestions?: boolean;
  /** Include key terms glossary */
  includeGlossary?: boolean;
  /** Include chapter summaries */
  includeSummaries?: boolean;
  /** Group by chapter or section */
  groupBy?: 'chapter' | 'section' | 'unit';
}

/**
 * Slide deck specific types
 */
export interface SlideDeckOptions extends GenerationOptions {
  /** Maximum slides to generate */
  maxSlides?: number;
  /** Slides per section */
  slidesPerSection?: number;
  /** Include speaker notes */
  includeSpeakerNotes?: boolean;
  /** Slide template theme */
  theme?: string;
  /** Animation preferences */
  animations?: boolean;
}

/**
 * Test bank specific types
 */
export interface TestBankOptions extends GenerationOptions {
  /** Question types to include */
  questionTypes?: Array<'multiple-choice' | 'true-false' | 'short-answer' | 'essay'>;
  /** Difficulty levels to include */
  difficultyLevels?: Array<'easy' | 'medium' | 'hard' | 'expert'>;
  /** Number of questions per topic */
  questionsPerTopic?: number;
  /** Include answer key */
  includeAnswerKey?: boolean;
  /** Include grading rubrics */
  includeRubrics?: boolean;
  /** Randomize question order */
  randomizeOrder?: boolean;
}

/**
 * Instructor manual specific types
 */
export interface InstructorManualOptions extends GenerationOptions {
  /** Include teaching tips */
  includeTeachingTips?: boolean;
  /** Include common misconceptions */
  includeCommonMisconceptions?: boolean;
  /** Include discussion prompts */
  includeDiscussionPrompts?: boolean;
  /** Include activity suggestions */
  includeActivitySuggestions?: boolean;
  /** Include pacing guides */
  includePacingGuides?: boolean;
  /** Target class format */
  classFormat?: 'lecture' | 'discussion' | 'lab' | 'online' | 'hybrid' | 'flipped';
}

/**
 * Solution manual specific types
 */
export interface SolutionManualOptions extends GenerationOptions {
  /** Solution detail level */
  detailLevel?: 'answer-only' | 'hints' | 'step-by-step' | 'complete';
  /** Include alternative solutions */
  includeAlternatives?: boolean;
  /** Include common errors */
  includeCommonErrors?: boolean;
  /** Include partial credit guidance */
  includePartialCredit?: boolean;
  /** Include pedagogical notes */
  includePedagogicalNotes?: boolean;
}