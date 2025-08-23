/**
 * R Markdown-specific types and interfaces
 */

import type { RendererOptions, ParseOptions, FormatMetadata, ParseResult } from '@xats-org/types';

/**
 * R Markdown output format types supported by knitr/rmarkdown
 */
export type RMarkdownOutputFormat =
  | 'html_document'
  | 'pdf_document'
  | 'word_document'
  | 'github_document'
  | 'bookdown::gitbook'
  | 'bookdown::pdf_book'
  | 'bookdown::epub_book'
  | 'distill::distill_article'
  | 'pagedown::html_paged'
  | 'flexdashboard::flex_dashboard'
  | 'blogdown::html_page'
  | 'pkgdown::article';

/**
 * R code chunk engine types
 */
export type RChunkEngine =
  | 'r'
  | 'python'
  | 'sql'
  | 'bash'
  | 'js'
  | 'css'
  | 'stan'
  | 'julia'
  | 'rcpp';

/**
 * R code chunk options from knitr
 */
export interface RChunkOptions {
  /** Label for the chunk */
  label?: string;

  /** Whether to evaluate the code */
  eval?: boolean | string;

  /** Whether to echo the code */
  echo?: boolean | number | string;

  /** Whether to include results */
  include?: boolean;

  /** Whether to show warnings */
  warning?: boolean | string;

  /** Whether to show errors */
  error?: boolean | string;

  /** Whether to show messages */
  message?: boolean | string;

  /** Results format */
  results?: 'markup' | 'asis' | 'hold' | 'hide';

  /** Code collapse options */
  collapse?: boolean;

  /** Code prompt */
  prompt?: boolean;

  /** Comment character */
  comment?: string;

  /** Highlight code */
  highlight?: boolean;

  /** Strip white space */
  'strip.white'?: boolean | 'all';

  /** Tidy code */
  tidy?: boolean | string;

  /** Figure options */
  fig?: {
    width?: number;
    height?: number;
    cap?: string;
    path?: string;
    keep?: 'all' | 'none' | 'high' | 'low';
    show?: 'asis' | 'hold' | 'animate';
    align?: 'default' | 'left' | 'right' | 'center';
    env?: string;
    scap?: string;
    lp?: string;
    pos?: string;
    subcap?: string;
  };

  /** Cache options */
  cache?: boolean | string;
  'cache.path'?: string;
  'cache.vars'?: string[];
  'cache.lazy'?: boolean;

  /** Dependency options */
  dependson?: string | string[];
  autodep?: boolean;

  /** Output size */
  size?:
    | 'tiny'
    | 'scriptsize'
    | 'footnotesize'
    | 'small'
    | 'normalsize'
    | 'large'
    | 'Large'
    | 'LARGE'
    | 'huge'
    | 'Huge';

  /** Custom options */
  [key: string]: unknown;
}

/**
 * YAML frontmatter structure for R Markdown
 */
export interface RMarkdownFrontmatter {
  /** Document title */
  title?: string;

  /** Document authors */
  author?:
    | string
    | string[]
    | Array<{
        name: string;
        email?: string;
        affiliation?: string;
        orcid?: string;
      }>;

  /** Document date */
  date?: string;

  /** Abstract */
  abstract?: string;

  /** Keywords */
  keywords?: string[];

  /** Output format(s) */
  output?: RMarkdownOutputFormat | Record<RMarkdownOutputFormat, unknown>;

  /** Bibliography file(s) */
  bibliography?: string | string[];

  /** CSL style file */
  csl?: string;

  /** Citation style */
  citation_style?: 'authoryear' | 'numeric' | 'alphabetic';

  /** Link citations */
  link_citations?: boolean;

  /** Language */
  lang?: string;

  /** Document class (for LaTeX) */
  documentclass?: string;

  /** Geometry (for LaTeX) */
  geometry?: string | string[];

  /** Font size */
  fontsize?: string;

  /** Line spacing */
  linestretch?: number;

  /** Include in header */
  header_includes?: string | string[];

  /** Include before body */
  include_before?: string | string[];

  /** Include after body */
  include_after?: string | string[];

  /** Table of contents */
  toc?: boolean;

  /** Table of contents depth */
  toc_depth?: number;

  /** Number sections */
  number_sections?: boolean;

  /** Figure captions */
  fig_caption?: boolean;

  /** Keep intermediate files */
  keep_md?: boolean;
  keep_tex?: boolean;

  /** Bookdown specific */
  site?: string;
  book_filename?: string;
  chapter_name?: string;
  repo?: string;
  description?: string;
  github_repo?: string;
  cover_image?: string;

  /** Custom fields */
  [key: string]: unknown;
}

/**
 * R Markdown renderer options extending base renderer options
 */
export interface RMarkdownRendererOptions extends RendererOptions {
  /** Target R Markdown output format */
  outputFormat?: RMarkdownOutputFormat;

  /** Include YAML frontmatter */
  includeFrontmatter?: boolean;

  /** Preserve R code chunks exactly */
  preserveCodeChunks?: boolean;

  /** Default chunk options to apply */
  defaultChunkOptions?: Partial<RChunkOptions>;

  /** Whether to use bookdown extensions */
  useBookdown?: boolean;

  /** Whether to use distill extensions */
  useDistill?: boolean;

  /** Citation style for bibliography */
  citationStyle?: 'authoryear' | 'numeric' | 'alphabetic';

  /** Enable cross-references */
  enableCrossReferences?: boolean;

  /** Code chunk engine preferences */
  chunkEngineMapping?: Record<string, RChunkEngine>;

  /** Figure options */
  figureOptions?: {
    width?: number;
    height?: number;
    dpi?: number;
    format?: 'png' | 'pdf' | 'svg';
  };

  /** Table options */
  tableOptions?: {
    format?: 'markdown' | 'html' | 'latex';
    caption?: boolean;
  };

  /** Math options */
  mathOptions?: {
    engine?: 'mathjax' | 'katex' | 'webtex';
    delimiters?: 'dollar' | 'parentheses';
  };

  /** Output directory for generated files */
  outputDir?: string;

  /** Custom knitr options */
  knitrOptions?: Record<string, unknown>;

  /** Bookdown configuration */
  bookdownConfig?: {
    book_filename?: string;
    chapter_name?: string;
    repo?: string;
    edit?: string;
    download?: string[];
  };
}

/**
 * R Markdown parsing options extending base parse options
 */
export interface RMarkdownParseOptions extends ParseOptions {
  /** Parse YAML frontmatter */
  parseFrontmatter?: boolean;

  /** Parse R code chunks */
  parseCodeChunks?: boolean;

  /** Preserve chunk options exactly */
  preserveChunkOptions?: boolean;

  /** Parse inline R code */
  parseInlineCode?: boolean;

  /** Parse bookdown cross-references */
  parseBookdownReferences?: boolean;

  /** Parse distill components */
  parseDistillComponents?: boolean;

  /** Code chunk validation */
  validateChunks?: boolean;

  /** Math parsing options */
  mathParsing?: {
    parseLatex?: boolean;
    parseR?: boolean;
    preserveDelimiters?: boolean;
  };

  /** Citation parsing options */
  citationParsing?: {
    parsePandoc?: boolean;
    parseR?: boolean;
    validateKeys?: boolean;
  };

  /** Figure parsing options */
  figureParsing?: {
    extractCaptions?: boolean;
    parseLabels?: boolean;
    resolveReferences?: boolean;
  };

  /** Table parsing options */
  tableParsing?: {
    parseHeaders?: boolean;
    parseAlignment?: boolean;
    extractCaptions?: boolean;
  };
}

/**
 * R code chunk representation
 */
export interface RCodeChunk {
  /** Chunk label/name */
  label?: string;

  /** Code engine (r, python, etc.) */
  engine: RChunkEngine;

  /** Raw code content */
  code: string;

  /** Chunk options */
  options: RChunkOptions;

  /** Line number in source document */
  line?: number;

  /** Whether chunk is inline or block */
  inline: boolean;

  /** Chunk output (if executed) */
  output?: RChunkOutput;
}

/**
 * R code chunk output
 */
export interface RChunkOutput {
  /** Text output */
  text?: string;

  /** Warning messages */
  warnings?: string[];

  /** Error messages */
  errors?: string[];

  /** Figures generated */
  figures?: RFigureOutput[];

  /** Tables generated */
  tables?: unknown[];

  /** HTML output */
  html?: string;

  /** Execution time */
  timing?: number;
}

/**
 * Figure output from R chunks
 */
export interface RFigureOutput {
  /** File path */
  path: string;

  /** Figure width */
  width?: number;

  /** Figure height */
  height?: number;

  /** Figure caption */
  caption?: string;

  /** Figure label */
  label?: string;

  /** Figure format */
  format: 'png' | 'pdf' | 'svg' | 'jpg';
}

/**
 * Bookdown cross-reference types
 */
export type BookdownRefType =
  | 'fig'
  | 'tab'
  | 'eq'
  | 'sec'
  | 'lem'
  | 'thm'
  | 'def'
  | 'cor'
  | 'prp'
  | 'hyp'
  | 'exm'
  | 'exr';

/**
 * Bookdown cross-reference
 */
export interface BookdownReference {
  /** Reference type */
  type: BookdownRefType;

  /** Reference label */
  label: string;

  /** Reference text */
  text?: string;

  /** Line number */
  line?: number;
}

/**
 * R Markdown document metadata
 */
export interface RMarkdownMetadata extends FormatMetadata {
  /** YAML frontmatter */
  frontmatter?: RMarkdownFrontmatter;

  /** R code chunks found */
  codeChunks?: RCodeChunk[];

  /** Inline code expressions */
  inlineCode?: Array<{
    engine: RChunkEngine;
    code: string;
    line?: number;
  }>;

  /** Bookdown references */
  crossReferences?: BookdownReference[];

  /** Bibliography information */
  bibliography?: {
    files: string[];
    style?: string;
    citationCount: number;
  };

  /** Figure information */
  figures?: Array<{
    label?: string;
    caption?: string;
    path?: string;
    line?: number;
  }>;

  /** Table information */
  tables?: Array<{
    label?: string;
    caption?: string;
    line?: number;
  }>;

  /** Math expressions */
  mathExpressions?: Array<{
    type: 'inline' | 'display';
    content: string;
    line?: number;
  }>;

  /** Output format detected */
  outputFormat?: RMarkdownOutputFormat;

  /** Dependencies detected */
  dependencies?: {
    packages: string[];
    datasets: string[];
    functions: string[];
  };

  /** Knitr version compatibility */
  knitrVersion?: string;

  /** R version compatibility */
  rVersion?: string;

  /** Source format for compatibility */
  sourceFormat: string;

  /** Parse time for compatibility */
  parseTime: number;

  /** Mapped elements count for compatibility */
  mappedElements: number;

  /** Unmapped elements count for compatibility */
  unmappedElements: number;

  /** Fidelity score for compatibility */
  fidelityScore: number;
}

/**
 * R Markdown syntax preferences
 */
export interface RMarkdownSyntaxPreferences {
  /** Chunk fence style */
  chunkFence?: '```' | '~~~';

  /** Chunk option format */
  chunkOptions?: 'header' | 'body' | 'yaml';

  /** Inline code delimiters */
  inlineDelimiters?: '`r' | '`{r}';

  /** Math delimiters */
  mathDelimiters?: {
    inline?: '$' | '\\(\\)';
    display?: '$$' | '\\[\\]';
  };

  /** Citation format */
  citationFormat?: 'pandoc' | 'natbib' | 'biblatex';

  /** Cross-reference format */
  crossRefFormat?: 'bookdown' | 'pandoc';

  /** Heading anchors */
  headingAnchors?: boolean;

  /** Line ending style */
  lineEndings?: 'lf' | 'crlf' | 'auto';
}

/**
 * R Markdown processing context
 */
export interface RMarkdownContext {
  /** Current chunk number */
  chunkNumber: number;

  /** Current heading level */
  headingLevel: number;

  /** In code chunk */
  inCodeChunk: boolean;

  /** Current chunk options */
  currentChunkOptions?: RChunkOptions;

  /** Chunk label registry */
  chunkLabels: Set<string>;

  /** Cross-reference registry */
  crossRefs: Map<string, BookdownReference>;

  /** Citation keys found */
  citationKeys: Set<string>;

  /** Figure counter */
  figureCounter: number;

  /** Table counter */
  tableCounter: number;

  /** Equation counter */
  equationCounter: number;

  /** Custom data */
  custom?: Record<string, unknown>;
}

/**
 * R Markdown validation error types
 */
export interface RMarkdownValidationError {
  type:
    | 'invalid-chunk'
    | 'duplicate-label'
    | 'invalid-option'
    | 'missing-reference'
    | 'syntax-error';
  message: string;
  line?: number;
  column?: number;
  chunk?: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

/**
 * Distill article components
 */
export interface DistillComponent {
  type: 'aside' | 'margin' | 'fullwidth' | 'appendix' | 'bibliography';
  content: string;
  attributes?: Record<string, string>;
  line?: number;
}

/**
 * Knitr setup options
 */
export interface KnitrSetup {
  /** Global chunk options */
  opts_chunk?: Partial<RChunkOptions>;

  /** Hooks */
  hooks?: Record<string, string>;

  /** Custom engines */
  engines?: Record<string, string>;

  /** Output format */
  output?: unknown;

  /** Working directory */
  'root.dir'?: string;

  /** Figure path */
  'fig.path'?: string;
}

/**
 * R Markdown pipeline stage for processing
 */
export interface RMarkdownPipelineStage {
  name: string;
  process: (content: string, context: RMarkdownContext) => string;
  priority?: number;
  modifiesChunks?: boolean;
  requiresR?: boolean;
}

/**
 * R Markdown-specific parse result extending base ParseResult
 */
export interface RMarkdownParseResult extends Omit<ParseResult, 'metadata'> {
  /** R Markdown-specific metadata */
  metadata?: RMarkdownMetadata;
}

/**
 * Academic R Markdown features configuration
 */
export interface AcademicRMarkdownOptions {
  /** Enable academic citations with CSL */
  citations?: boolean;

  /** Enable bookdown features */
  bookdown?: boolean;

  /** Enable distill features */
  distill?: boolean;

  /** Enable equation numbering */
  equationNumbering?: boolean;

  /** Enable cross-references */
  crossReferences?: boolean;

  /** Enable bibliography */
  bibliography?: boolean;

  /** Enable figure/table numbering */
  numbering?: boolean;

  /** Enable theorem environments */
  theorems?: boolean;

  /** Enable proof environments */
  proofs?: boolean;

  /** Enable appendix handling */
  appendix?: boolean;
}
