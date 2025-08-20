/**
 * Rendering and presentation types for xats
 */

/**
 * Options for configuring document rendering
 */
export interface RendererOptions {
  theme?: 'default' | 'minimal' | 'academic' | 'accessibility-focused' | string;
  cssClasses?: CssClasses;
  includeTableOfContents?: boolean;
  includeBibliography?: boolean;
  includeIndex?: boolean;
  mathRenderer?: 'mathjax' | 'katex' | 'none';
  syntaxHighlighter?: 'prism' | 'highlight.js' | 'none';
  locale?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  accessibilityMode?: boolean;
  customStyles?: string;
  baseUrl?: string;
  fragmentOnly?: boolean;
}

/**
 * CSS class mappings for rendered elements
 */
export interface CssClasses {
  document?: string;
  frontMatter?: string;
  bodyMatter?: string;
  backMatter?: string;
  unit?: string;
  chapter?: string;
  section?: string;
  paragraph?: string;
  heading?: string;
  list?: string;
  listItem?: string;
  blockquote?: string;
  codeBlock?: string;
  mathBlock?: string;
  table?: string;
  figure?: string;
  emphasis?: string;
  strong?: string;
  citation?: string;
  reference?: string;
  index?: string;
  keyTerm?: string;
  learningObjective?: string;
  pathway?: string;
  resource?: string;
  [key: string]: string | undefined;
}

/**
 * Rendered output format
 */
export type RenderFormat = 'html' | 'pdf' | 'epub' | 'latex' | 'markdown' | 'json';

/**
 * Rendering context for tracking state during rendering
 */
export interface RenderingContext {
  currentLevel: number;
  headingCounter: number[];
  footnotes: Array<{ id: string; content: string }>;
  citations: Set<string>;
  indexEntries: Map<string, string[]>;
  customData?: Record<string, unknown>;
}

/**
 * Rendered output result
 */
export interface RenderResult {
  content: string;
  metadata?: RenderMetadata;
  assets?: RenderAsset[];
  errors?: RenderError[];
}

/**
 * Metadata about the rendering process
 */
export interface RenderMetadata {
  format: RenderFormat;
  renderTime: number;
  wordCount?: number;
  pageCount?: number;
  tocGenerated?: boolean;
  indexGenerated?: boolean;
  bibliographyGenerated?: boolean;
}

/**
 * External asset referenced in rendered output
 */
export interface RenderAsset {
  type: 'stylesheet' | 'script' | 'image' | 'font' | 'other';
  url: string;
  integrity?: string;
  crossOrigin?: string;
}

/**
 * Error encountered during rendering
 */
export interface RenderError {
  type: 'missing-reference' | 'invalid-content' | 'unsupported-feature' | 'other';
  message: string;
  path?: string;
  recoverable: boolean;
}