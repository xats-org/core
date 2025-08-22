/**
 * Markdown-specific types and interfaces
 */

import type { RendererOptions, ParseOptions, FormatMetadata } from '@xats-org/types';

/**
 * Markdown variant types
 */
export type MarkdownVariant =
  | 'commonmark' // CommonMark standard
  | 'gfm' // GitHub Flavored Markdown
  | 'academic' // Academic/scholarly extensions
  | 'pandoc' // Pandoc flavor
  | 'mmark' // Academic-focused markdown
  | 'kramdown'; // Kramdown flavor

/**
 * Markdown syntax preference for various elements
 */
export interface MarkdownSyntaxPreferences {
  /** Heading style preference */
  headingStyle?: 'atx' | 'setext';

  /** Emphasis markers */
  emphasisMarker?: '*' | '_';

  /** Strong emphasis markers */
  strongMarker?: '**' | '__';

  /** List markers */
  listMarkers?: {
    bullet?: '-' | '*' | '+';
    ordered?: '.' | ')';
  };

  /** Code fence markers */
  codeFence?: '```' | '~~~';

  /** Link reference style */
  linkStyle?: 'inline' | 'reference' | 'shortcut';

  /** Line break style */
  lineBreak?: 'spaces' | 'backslash';
}

/**
 * Markdown renderer options extending base renderer options
 */
export interface MarkdownRendererOptions extends RendererOptions {
  /** Markdown variant to target */
  variant?: MarkdownVariant;

  /** Syntax preferences for output formatting */
  syntaxPreferences?: MarkdownSyntaxPreferences;

  /** Enable GitHub Flavored Markdown extensions */
  enableGFM?: boolean;

  /** Enable academic extensions (footnotes, citations, etc.) */
  enableAcademic?: boolean;

  /** Enable table support */
  enableTables?: boolean;

  /** Enable task list support */
  enableTaskLists?: boolean;

  /** Enable strikethrough support */
  enableStrikethrough?: boolean;

  /** Enable automatic link detection */
  enableAutolinks?: boolean;

  /** Enable line breaks in paragraphs */
  enableHardWraps?: boolean;

  /** Maximum line width for text wrapping (0 = no wrapping) */
  lineWidth?: number;

  /** Include front matter (YAML/TOML) */
  includeFrontMatter?: boolean;

  /** Front matter format */
  frontMatterFormat?: 'yaml' | 'toml' | 'json';

  /** Custom CSS classes for HTML output (when used with Markdown processors) */
  htmlClasses?: Record<string, string>;

  /** Whether to generate reference-style links */
  useReferenceLinks?: boolean;

  /** Base level for headings (1-6) */
  baseHeadingLevel?: number;

  /** Whether to preserve HTML in markdown */
  allowHTML?: boolean;

  /** Custom extensions to enable */
  extensions?: string[];

  /** Footnote style */
  footnoteStyle?: 'brackets' | 'caret';

  /** Citation style */
  citationStyle?: 'pandoc' | 'bibtex' | 'numeric';
}

/**
 * Markdown parsing options extending base parse options
 */
export interface MarkdownParseOptions extends ParseOptions {
  /** Markdown variant being parsed */
  variant?: MarkdownVariant;

  /** Whether to parse front matter */
  parseFrontMatter?: boolean;

  /** Whether to parse footnotes */
  parseFootnotes?: boolean;

  /** Whether to parse tables */
  parseTables?: boolean;

  /** Whether to parse task lists */
  parseTaskLists?: boolean;

  /** Whether to parse strikethrough */
  parseStrikethrough?: boolean;

  /** Whether to parse mathematics */
  parseMath?: boolean;

  /** Math delimiter preferences */
  mathDelimiters?: {
    inline?: ['$', '$'] | ['\\(', '\\)'];
    block?: ['$$', '$$'] | ['\\[', '\\]'];
  };

  /** Whether to parse citations */
  parseCitations?: boolean;

  /** Citation patterns to recognize */
  citationPatterns?: RegExp[];

  /** Whether to normalize heading levels */
  normalizeHeadings?: boolean;

  /** Maximum heading depth to parse */
  maxHeadingDepth?: number;

  /** Whether to preserve HTML tags */
  preserveHTML?: boolean;

  /** Custom parsing rules */
  customRules?: Record<string, (content: string) => unknown>;

  /** Link resolution base URL */
  linkBaseUrl?: string;

  /** Image resolution base URL */
  imageBaseUrl?: string;
}

/**
 * Markdown document metadata
 */
export interface MarkdownMetadata extends FormatMetadata {
  /** Detected variant */
  variant?: MarkdownVariant;

  /** Front matter content */
  frontMatter?: Record<string, unknown>;

  /** Front matter format */
  frontMatterFormat?: 'yaml' | 'toml' | 'json';

  /** Heading structure */
  headings?: MarkdownHeading[];

  /** Links found in document */
  links?: MarkdownLink[];

  /** Images found in document */
  images?: MarkdownImage[];

  /** Code blocks found */
  codeBlocks?: MarkdownCodeBlock[];

  /** Tables found */
  tables?: MarkdownTable[];

  /** Footnotes found */
  footnotes?: MarkdownFootnote[];

  /** Citations found */
  citations?: MarkdownCitation[];

  /** Task lists found */
  taskLists?: MarkdownTaskList[];

  /** Used extensions */
  extensions?: string[];

  /** Reading time estimate (in minutes) */
  readingTime?: number;

  /** Complexity score (0-10) */
  complexityScore?: number;
}

/**
 * Markdown heading information
 */
export interface MarkdownHeading {
  /** Heading level (1-6) */
  level: number;

  /** Heading text */
  text: string;

  /** Heading ID/anchor */
  id?: string;

  /** Line number in source */
  line?: number;

  /** Heading style used */
  style: 'atx' | 'setext';
}

/**
 * Markdown link information
 */
export interface MarkdownLink {
  /** Link text */
  text: string;

  /** Link URL */
  url: string;

  /** Link title */
  title?: string;

  /** Link type */
  type: 'inline' | 'reference' | 'autolink' | 'email';

  /** Reference key (for reference links) */
  referenceKey?: string;

  /** Line number in source */
  line?: number;
}

/**
 * Markdown image information
 */
export interface MarkdownImage {
  /** Alt text */
  alt: string;

  /** Image URL */
  src: string;

  /** Image title */
  title?: string;

  /** Image type */
  type: 'inline' | 'reference';

  /** Reference key (for reference images) */
  referenceKey?: string;

  /** Line number in source */
  line?: number;
}

/**
 * Markdown code block information
 */
export interface MarkdownCodeBlock {
  /** Code content */
  code: string;

  /** Language identifier */
  language?: string;

  /** Additional info string */
  info?: string;

  /** Fence type used */
  fence: '```' | '~~~' | 'indented';

  /** Line number in source */
  line?: number;
}

/**
 * Markdown table information
 */
export interface MarkdownTable {
  /** Table headers */
  headers: string[];

  /** Table rows */
  rows: string[][];

  /** Column alignments */
  alignments?: ('left' | 'center' | 'right' | null)[];

  /** Line number in source */
  line?: number;
}

/**
 * Markdown footnote information
 */
export interface MarkdownFootnote {
  /** Footnote identifier */
  id: string;

  /** Footnote content */
  content: string;

  /** Line number in source */
  line?: number;
}

/**
 * Markdown citation information
 */
export interface MarkdownCitation {
  /** Citation key */
  key: string;

  /** Citation text */
  text?: string;

  /** Citation type */
  type: 'pandoc' | 'bibtex' | 'numeric' | 'other';

  /** Line number in source */
  line?: number;
}

/**
 * Markdown task list information
 */
export interface MarkdownTaskList {
  /** Task items */
  items: MarkdownTaskItem[];

  /** List is nested */
  nested?: boolean;

  /** Line number in source */
  line?: number;
}

/**
 * Markdown task item information
 */
export interface MarkdownTaskItem {
  /** Item text */
  text: string;

  /** Is checked */
  checked: boolean;

  /** Nesting level */
  level: number;
}

/**
 * Markdown parsing context
 */
export interface MarkdownContext {
  /** Current heading level */
  currentHeadingLevel: number;

  /** Current list depth */
  listDepth: number;

  /** Current list type */
  listType?: 'ordered' | 'unordered' | 'task';

  /** In blockquote */
  inBlockquote: boolean;

  /** In code block */
  inCodeBlock: boolean;

  /** In table */
  inTable: boolean;

  /** Reference definitions */
  references: Map<string, { url: string; title?: string }>;

  /** Footnote definitions */
  footnotes: Map<string, string>;

  /** Current line number */
  lineNumber: number;

  /** Custom data for extensibility */
  custom?: Record<string, unknown>;
}

/**
 * Markdown syntax error
 */
export interface MarkdownSyntaxError {
  type: 'invalid-syntax' | 'malformed-table' | 'unclosed-element' | 'invalid-reference';
  message: string;
  line?: number;
  column?: number;
  element?: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

/**
 * Markdown formatting options for specific elements
 */
export interface MarkdownFormatting {
  /** Paragraph formatting */
  paragraph?: {
    preserveLineBreaks?: boolean;
    wrapWidth?: number;
  };

  /** List formatting */
  list?: {
    tight?: boolean;
    indentSize?: number;
    markerSpacing?: number;
  };

  /** Code formatting */
  code?: {
    preserveIndentation?: boolean;
    tabSize?: number;
  };

  /** Table formatting */
  table?: {
    alignment?: boolean;
    padding?: number;
    separators?: boolean;
  };

  /** Link formatting */
  links?: {
    maxInlineLength?: number;
    preferReference?: boolean;
  };
}

/**
 * Markdown element types that can be processed
 */
export type MarkdownElementType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'listItem'
  | 'blockquote'
  | 'code'
  | 'codeBlock'
  | 'table'
  | 'tableRow'
  | 'tableCell'
  | 'link'
  | 'image'
  | 'emphasis'
  | 'strong'
  | 'strikethrough'
  | 'footnote'
  | 'citation'
  | 'math'
  | 'html'
  | 'break'
  | 'thematicBreak';

/**
 * Markdown processing pipeline stage
 */
export interface MarkdownPipelineStage {
  /** Stage name */
  name: string;

  /** Process function */
  process: (content: string, context: MarkdownContext) => string;

  /** Stage priority (higher = earlier) */
  priority?: number;

  /** Whether stage modifies the AST */
  modifiesAST?: boolean;
}

/**
 * Configuration for academic markdown features
 */
export interface AcademicMarkdownOptions {
  /** Enable academic citations */
  citations?: boolean;

  /** Enable footnotes */
  footnotes?: boolean;

  /** Enable cross-references */
  crossReferences?: boolean;

  /** Enable bibliography */
  bibliography?: boolean;

  /** Enable equation numbering */
  equationNumbering?: boolean;

  /** Enable figure/table numbering */
  figureNumbering?: boolean;

  /** Enable table of contents */
  tableOfContents?: boolean;

  /** Enable index generation */
  index?: boolean;
}
