/**
 * Rendering and presentation types for xats
 */

import type { XatsDocument } from './document.js';

/**
 * Options for configuring document rendering
 */
export interface RendererOptions {
  theme?: string;
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
export type RenderFormat = 'html' | 'pdf' | 'epub' | 'latex' | 'markdown' | 'json' | 'docx' | 'rmarkdown';

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

// ============================================================================
// BIDIRECTIONAL RENDERING ARCHITECTURE (v0.5.0)
// ============================================================================

/**
 * Common interface for all bidirectional renderers
 * Provides both render (xats -> format) and parse (format -> xats) capabilities
 */
export interface BidirectionalRenderer<TOptions extends RendererOptions = RendererOptions> {
  /** Renderer format identifier */
  readonly format: RenderFormat;
  
  /** WCAG compliance level supported by this renderer */
  readonly wcagLevel: 'A' | 'AA' | 'AAA' | null;
  
  /** Render xats document to target format */
  render(document: XatsDocument, options?: TOptions): Promise<RenderResult>;
  
  /** Parse document from target format back to xats */
  parse(content: string, options?: ParseOptions): Promise<ParseResult>;
  
  /** Test round-trip fidelity between render and parse */
  testRoundTrip(document: XatsDocument, options?: RoundTripOptions): Promise<RoundTripResult>;
  
  /** Validate format-specific content */
  validate(content: string): Promise<ValidationResult>;
  
  /** Get format-specific metadata */
  getMetadata?(content: string): Promise<FormatMetadata>;
}

/**
 * Options for parsing content back to xats format
 */
export interface ParseOptions {
  /** Preserve format-specific metadata in extensions */
  preserveMetadata?: boolean;
  
  /** Strict parsing mode - fail on any ambiguity */
  strictMode?: boolean;
  
  /** Custom parsing rules for specific elements */
  customParsers?: Record<string, (content: string) => unknown>;
  
  /** Base URL for resolving relative links */
  baseUrl?: string;
  
  /** Character encoding (defaults to UTF-8) */
  encoding?: string;
}

/**
 * Result of parsing content to xats format
 */
export interface ParseResult {
  /** Parsed xats document */
  document: XatsDocument;
  
  /** Metadata about the parsing process */
  metadata?: ParseMetadata;
  
  /** Warnings encountered during parsing */
  warnings?: ParseWarning[];
  
  /** Errors encountered during parsing */
  errors?: ParseError[];
  
  /** Format-specific data that couldn't be mapped */
  unmappedData?: UnmappedData[];
}

/**
 * Metadata about the parsing process
 */
export interface ParseMetadata {
  /** Source format that was parsed */
  sourceFormat: string;
  
  /** Time taken to parse */
  parseTime: number;
  
  /** Number of elements successfully mapped */
  mappedElements: number;
  
  /** Number of elements that couldn't be mapped */
  unmappedElements: number;
  
  /** Fidelity score (0-1) indicating how well content was preserved */
  fidelityScore: number;
}

/**
 * Warning encountered during parsing
 */
export interface ParseWarning {
  type: 'lossy-conversion' | 'format-specific' | 'ambiguous-mapping' | 'other';
  message: string;
  path?: string;
  suggestion?: string;
}

/**
 * Error encountered during parsing
 */
export interface ParseError {
  type: 'invalid-format' | 'unsupported-feature' | 'malformed-content' | 'other';
  message: string;
  path?: string;
  fatal: boolean;
}

/**
 * Data that couldn't be mapped during parsing
 */
export interface UnmappedData {
  type: 'element' | 'attribute' | 'style' | 'script' | 'other';
  content: string;
  context?: string;
  reason: string;
}

/**
 * Options for round-trip testing
 */
export interface RoundTripOptions extends RendererOptions, ParseOptions {
  /** Acceptable fidelity threshold (0-1) */
  fidelityThreshold?: number;
  
  /** Compare semantic meaning rather than exact structure */
  semanticComparison?: boolean;
  
  /** Elements to ignore during comparison */
  ignoreElements?: string[];
}

/**
 * Result of round-trip testing
 */
export interface RoundTripResult {
  /** Whether round-trip passed fidelity threshold */
  success: boolean;
  
  /** Fidelity score (0-1) */
  fidelityScore: number;
  
  /** Original document */
  original: XatsDocument;
  
  /** Document after round-trip conversion */
  roundTrip: XatsDocument;
  
  /** Differences found between documents */
  differences: DocumentDifference[];
  
  /** Performance metrics */
  metrics: RoundTripMetrics;
}

/**
 * Difference found between original and round-trip documents
 */
export interface DocumentDifference {
  type: 'missing' | 'added' | 'changed' | 'moved';
  path: string;
  original?: unknown;
  roundTrip?: unknown;
  impact: 'critical' | 'major' | 'minor' | 'cosmetic';
}

/**
 * Performance metrics for round-trip testing
 */
export interface RoundTripMetrics {
  renderTime: number;
  parseTime: number;
  totalTime: number;
  memoryUsage?: number;
  documentSize: number;
  outputSize: number;
}

/**
 * Validation result for format-specific content
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: {
    validator: string;
    version: string;
    validatedAt: Date;
  };
}

/**
 * Error from format validation
 */
export interface ValidationError {
  code: string;
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
}

/**
 * Warning from format validation
 */
export interface ValidationWarning {
  code: string;
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

/**
 * Format-specific metadata
 */
export interface FormatMetadata {
  format: string;
  version?: string;
  encoding?: string;
  language?: string;
  wordCount?: number;
  elementCount?: number;
  features?: string[];
  custom?: Record<string, unknown>;
}

/**
 * WCAG compliance testing interface
 */
export interface WcagCompliance {
  /** Test WCAG compliance level */
  testCompliance(content: string, level: 'A' | 'AA' | 'AAA'): Promise<WcagResult>;
  
  /** Get accessibility audit report */
  auditAccessibility(content: string): Promise<AccessibilityAudit>;
}

/**
 * WCAG compliance test result
 */
export interface WcagResult {
  level: 'A' | 'AA' | 'AAA';
  compliant: boolean;
  violations: WcagViolation[];
  warnings: WcagWarning[];
  score: number; // 0-100
}

/**
 * WCAG violation found during testing
 */
export interface WcagViolation {
  criterion: string; // e.g., "1.4.3"
  level: 'A' | 'AA' | 'AAA';
  description: string;
  element?: string;
  recommendation: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

/**
 * WCAG warning found during testing
 */
export interface WcagWarning {
  criterion: string;
  level: 'A' | 'AA' | 'AAA';
  description: string;
  element?: string;
  suggestion: string;
}

/**
 * Comprehensive accessibility audit
 */
export interface AccessibilityAudit {
  compliant: boolean;
  overallScore: number; // 0-100
  levelA: WcagResult;
  levelAA: WcagResult;
  levelAAA: WcagResult;
  recommendations: AccessibilityRecommendation[];
  testedAt: Date;
}

/**
 * Accessibility improvement recommendation
 */
export interface AccessibilityRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'structure' | 'navigation' | 'content' | 'interaction' | 'visual';
  description: string;
  implementation: string;
  wcagCriteria: string[];
}

/**
 * Plugin system interface for extending renderers
 */
export interface RendererPlugin<TRenderer extends BidirectionalRenderer = BidirectionalRenderer> {
  /** Plugin identifier */
  readonly id: string;
  
  /** Plugin name */
  readonly name: string;
  
  /** Plugin version */
  readonly version: string;
  
  /** Compatible renderer formats */
  readonly compatibleFormats: RenderFormat[];
  
  /** Initialize plugin with renderer instance */
  initialize(renderer: TRenderer): Promise<void>;
  
  /** Cleanup plugin resources */
  cleanup?(): Promise<void>;
  
  /** Extend rendering process */
  beforeRender?(document: XatsDocument, options: RendererOptions): Promise<void>;
  afterRender?(result: RenderResult): Promise<RenderResult>;
  
  /** Extend parsing process */
  beforeParse?(content: string, options: ParseOptions): Promise<string>;
  afterParse?(result: ParseResult): Promise<ParseResult>;
}

/**
 * Plugin registry for managing renderer extensions
 */
export interface PluginRegistry {
  /** Register a new plugin */
  register<T extends BidirectionalRenderer>(plugin: RendererPlugin<T>): Promise<void>;
  
  /** Unregister a plugin */
  unregister(pluginId: string): Promise<void>;
  
  /** Get registered plugin by ID */
  getPlugin(pluginId: string): RendererPlugin | undefined;
  
  /** List all registered plugins */
  listPlugins(): RendererPlugin[];
  
  /** Find plugins compatible with a format */
  findCompatiblePlugins(format: RenderFormat): RendererPlugin[];
}

/**
 * Factory interface for creating renderer instances
 */
export interface RendererFactory {
  /** Create a renderer for the specified format */
  createRenderer<T extends BidirectionalRenderer>(format: RenderFormat): Promise<T>;
  
  /** Get available renderer formats */
  getAvailableFormats(): RenderFormat[];
  
  /** Check if a format is supported */
  supportsFormat(format: RenderFormat): boolean;
  
  /** Register a new renderer implementation */
  registerRenderer<T extends BidirectionalRenderer>(
    format: RenderFormat, 
    rendererClass: new (...args: unknown[]) => T
  ): void;
}
