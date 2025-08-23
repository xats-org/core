/**
 * @xats-org/renderer-rmarkdown - R Markdown Bidirectional Renderer
 *
 * Provides bidirectional conversion between xats documents and R Markdown format
 * supporting R-based academic and statistical workflows with high fidelity preservation.
 */

// Main renderer (exports both render and parse capabilities)
export { RMarkdownRenderer } from './renderer.js';
export { RMarkdownRenderer as default } from './renderer.js';

// Individual converters for specific use cases
export { XatsToRMarkdownConverter } from './xats-to-rmarkdown.js';
export { RMarkdownToXatsParser } from './rmarkdown-to-xats.js';

// Utility functions for R Markdown processing
export {
  parseChunkHeader,
  parseChunkOptionValue,
  serializeChunkOptions,
  serializeChunkOptionValue,
  parseYamlFrontmatter,
  serializeYamlFrontmatter,
  extractCodeChunks,
  extractInlineCode,
  parseBookdownReferences,
  validateRMarkdown,
  normalizeChunkOptions,
  generateChunkLabel,
  extractMathExpressions,
  cleanRMarkdownContent,
} from './utils.js';

// Import types for re-export

// Re-export types for R Markdown processing
export type {
  // Options types
  RMarkdownRendererOptions,
  RMarkdownParseOptions,

  // Output format types
  RMarkdownOutputFormat,
  RChunkEngine,

  // Content structure types
  RChunkOptions,
  RMarkdownFrontmatter,
  RCodeChunk,
  RChunkOutput,
  RFigureOutput,

  // Bookdown types
  BookdownRefType,
  BookdownReference,

  // Metadata types
  RMarkdownMetadata,
  RMarkdownContext,
  RMarkdownValidationError,
  RMarkdownParseResult,

  // Configuration types
  RMarkdownSyntaxPreferences,
  DistillComponent,
  KnitrSetup,
  RMarkdownPipelineStage,
  AcademicRMarkdownOptions,
};

// Version and compatibility information
export const RMARKDOWN_RENDERER_VERSION = '1.0.0';
export const SUPPORTED_RMARKDOWN_VERSIONS = ['2.0', '2.1', '2.2', '2.3'];
export const SUPPORTED_KNITR_VERSIONS = ['1.40', '1.41', '1.42'];
export const SUPPORTED_BOOKDOWN_VERSIONS = ['0.24', '0.25', '0.26'];

// Feature flags
export const FEATURES = {
  BIDIRECTIONAL_CONVERSION: true,
  CODE_CHUNK_PRESERVATION: true,
  YAML_FRONTMATTER: true,
  BOOKDOWN_REFERENCES: true,
  DISTILL_COMPONENTS: false, // Experimental
  KNITR_HOOKS: false, // Future feature
  CACHE_SUPPORT: false, // Future feature
  INTERACTIVE_WIDGETS: false, // Future feature
} as const;

// Default configurations
export const DEFAULT_RENDERER_OPTIONS: Partial<RMarkdownRendererOptions> = {
  outputFormat: 'html_document',
  includeFrontmatter: true,
  preserveCodeChunks: true,
  useBookdown: false,
  useDistill: false,
  citationStyle: 'authoryear',
  enableCrossReferences: true,
  defaultChunkOptions: {
    eval: true,
    echo: true,
    include: true,
    warning: true,
    error: false,
    message: true,
    results: 'markup',
  },
};

export const DEFAULT_PARSE_OPTIONS: Partial<RMarkdownParseOptions> = {
  parseFrontmatter: true,
  parseCodeChunks: true,
  preserveChunkOptions: true,
  parseInlineCode: true,
  parseBookdownReferences: true,
  validateChunks: true,
  mathParsing: {
    parseLatex: true,
    parseR: true,
    preserveDelimiters: true,
  },
  citationParsing: {
    parsePandoc: true,
    parseR: true,
    validateKeys: false,
  },
};

// Import classes for factory functions
import { RMarkdownRenderer } from './renderer.js';
import { RMarkdownToXatsParser } from './rmarkdown-to-xats.js';
import { XatsToRMarkdownConverter } from './xats-to-rmarkdown.js';

import type {
  // Options types
  RMarkdownRendererOptions,
  RMarkdownParseOptions,

  // Output format types
  RMarkdownOutputFormat,
  RChunkEngine,

  // Content structure types
  RChunkOptions,
  RMarkdownFrontmatter,
  RCodeChunk,
  RChunkOutput,
  RFigureOutput,

  // Bookdown types
  BookdownRefType,
  BookdownReference,

  // Metadata types
  RMarkdownMetadata,
  RMarkdownContext,
  RMarkdownValidationError,

  // Configuration types
  RMarkdownSyntaxPreferences,
  DistillComponent,
  KnitrSetup,
  RMarkdownPipelineStage,
  AcademicRMarkdownOptions,
  RMarkdownParseResult,
} from './types.js';

// Convenience factory functions
export function createRMarkdownRenderer(
  rendererOptions?: Partial<RMarkdownRendererOptions>,
  parseOptions?: Partial<RMarkdownParseOptions>
): RMarkdownRenderer {
  return new RMarkdownRenderer(
    { ...DEFAULT_RENDERER_OPTIONS, ...rendererOptions } as RMarkdownRendererOptions,
    { ...DEFAULT_PARSE_OPTIONS, ...parseOptions } as RMarkdownParseOptions
  );
}

export function createXatsToRMarkdownConverter(
  options?: Partial<RMarkdownRendererOptions>
): XatsToRMarkdownConverter {
  return new XatsToRMarkdownConverter({
    ...DEFAULT_RENDERER_OPTIONS,
    ...options,
  });
}

export function createRMarkdownToXatsParser(
  options?: Partial<RMarkdownParseOptions>
): RMarkdownToXatsParser {
  return new RMarkdownToXatsParser({
    ...DEFAULT_PARSE_OPTIONS,
    ...options,
  });
}

// Common R Markdown output format configurations
export const OUTPUT_FORMAT_CONFIGS = {
  HTML_DOCUMENT: {
    outputFormat: 'html_document' as const,
    mathRenderer: 'mathjax' as const,
    syntaxHighlighter: 'prism' as const,
  },
  PDF_DOCUMENT: {
    outputFormat: 'pdf_document' as const,
    mathRenderer: 'katex' as const,
    citationStyle: 'numeric' as const,
  },
  BOOKDOWN_GITBOOK: {
    outputFormat: 'bookdown::gitbook' as const,
    useBookdown: true,
    enableCrossReferences: true,
    includeTableOfContents: true,
  },
  BOOKDOWN_PDF: {
    outputFormat: 'bookdown::pdf_book' as const,
    useBookdown: true,
    enableCrossReferences: true,
    citationStyle: 'numeric' as const,
  },
  DISTILL_ARTICLE: {
    outputFormat: 'distill::distill_article' as const,
    useDistill: true,
    mathRenderer: 'katex' as const,
  },
} as const;

// Academic workflow helpers
export const ACADEMIC_WORKFLOW_CONFIGS = {
  // Statistical analysis workflow
  STATISTICAL_ANALYSIS: {
    ...DEFAULT_RENDERER_OPTIONS,
    preserveCodeChunks: true,
    defaultChunkOptions: {
      echo: true,
      eval: true,
      warning: false,
      message: false,
      fig: { width: 8, height: 6 },
    },
    chunkEngineMapping: {
      statistics: 'r' as const,
      analysis: 'r' as const,
      modeling: 'r' as const,
    },
  },

  // Academic paper workflow
  ACADEMIC_PAPER: {
    ...DEFAULT_RENDERER_OPTIONS,
    outputFormat: 'bookdown::pdf_book' as const,
    useBookdown: true,
    citationStyle: 'authoryear' as const,
    enableCrossReferences: true,
    includeBibliography: true,
    includeTableOfContents: true,
    defaultChunkOptions: {
      echo: false,
      eval: true,
      warning: false,
      message: false,
    },
  },

  // Interactive report workflow
  INTERACTIVE_REPORT: {
    ...DEFAULT_RENDERER_OPTIONS,
    outputFormat: 'html_document' as const,
    mathRenderer: 'mathjax' as const,
    defaultChunkOptions: {
      echo: true,
      eval: true,
      fig: { width: 10, height: 6 },
    },
  },

  // Course materials workflow
  COURSE_MATERIALS: {
    ...DEFAULT_RENDERER_OPTIONS,
    outputFormat: 'bookdown::gitbook' as const,
    useBookdown: true,
    includeTableOfContents: true,
    enableCrossReferences: true,
    defaultChunkOptions: {
      echo: true,
      eval: true,
      collapse: true,
    },
  },
} as const;
