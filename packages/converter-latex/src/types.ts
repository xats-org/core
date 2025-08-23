/**
 * Types and interfaces for LaTeX document conversion
 * Supports academic publishing workflows with high-fidelity mathematical content
 */

import type { RendererOptions, ParseOptions, XatsDocument } from '@xats-org/types';

/**
 * Advanced LaTeX converter options extending base renderer options
 */
export interface LaTeXConverterOptions extends RendererOptions {
  /** LaTeX document class */
  documentClass?: 'article' | 'book' | 'report' | 'amsart' | 'amsbook' | string;

  /** Document class options */
  documentClassOptions?: string[];

  /** LaTeX packages to include */
  packages?: LaTeXPackage[];

  /** Bibliography style */
  bibliographyStyle?: 'plain' | 'alpha' | 'unsrt' | 'abbrv' | 'natbib' | 'biblatex' | string;

  /** Bibliography backend (for biblatex) */
  bibliographyBackend?: 'biber' | 'bibtex' | 'bibtex8';

  /** Math delimiters */
  mathDelimiters?: {
    inline?: { open: string; close: string };
    display?: { open: string; close: string };
  };

  /** Use UTF-8 encoding */
  useUTF8?: boolean;

  /** Enable microtype package */
  microtype?: boolean;

  /** Page geometry settings */
  geometry?: GeometryOptions;

  /** Font configuration */
  fonts?: FontConfiguration;

  /** Math font configuration */
  mathFonts?: MathFontConfiguration;

  /** Chapter/section numbering */
  numbering?: NumberingOptions;

  /** Cross-reference settings */
  crossReferences?: CrossReferenceOptions;

  /** Index generation */
  indexing?: IndexingOptions;

  /** Glossary generation */
  glossaries?: GlossaryOptions;

  /** Academic journal specific settings */
  journal?: JournalOptions;

  /** Enable production mode features */
  productionMode?: boolean;

  /** Custom LaTeX preamble */
  customPreamble?: string;

  /** Custom LaTeX commands */
  customCommands?: Record<string, string>;

  /** Enable draft mode */
  draftMode?: boolean;
}

/**
 * LaTeX package specification
 */
export interface LaTeXPackage {
  name: string;
  options?: string[];
  required?: boolean;
}

/**
 * Page geometry configuration
 */
export interface GeometryOptions {
  papersize?: 'a4paper' | 'letterpaper' | 'legalpaper' | 'a5paper' | string;
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    inner?: string;
    outer?: string;
  };
  bindingoffset?: string;
  includehead?: boolean;
  includefoot?: boolean;
  heightrounded?: boolean;
}

/**
 * Font configuration
 */
export interface FontConfiguration {
  main?: string; // Main text font
  sans?: string; // Sans serif font
  mono?: string; // Monospace font
  fontenc?: string; // Font encoding
  inputenc?: string; // Input encoding
  fontsize?: string; // Base font size
  useT1?: boolean; // Use T1 font encoding
}

/**
 * Mathematical font configuration
 */
export interface MathFontConfiguration {
  math?: string; // Math font
  mathcal?: string; // Calligraphic font
  mathbb?: string; // Blackboard bold
  mathfrak?: string; // Fraktur font
  mathsf?: string; // Sans serif math
  mathtt?: string; // Typewriter math
}

/**
 * Numbering configuration
 */
export interface NumberingOptions {
  chapters?: boolean;
  sections?: boolean;
  subsections?: boolean;
  equations?: boolean;
  figures?: boolean;
  tables?: boolean;
  theorems?: boolean;
  maxDepth?: number; // Maximum numbering depth
  resetCounters?: string[]; // Counters to reset
}

/**
 * Cross-reference configuration
 */
export interface CrossReferenceOptions {
  useCleveref?: boolean; // Use cleveref package
  useHyperref?: boolean; // Use hyperref package
  linkColors?: {
    cite?: string;
    link?: string;
    url?: string;
  };
  bookmarks?: boolean; // PDF bookmarks
  colorlinks?: boolean; // Colored links
}

/**
 * Indexing configuration
 */
export interface IndexingOptions {
  enabled?: boolean;
  package?: 'makeidx' | 'imakeidx' | 'index';
  columns?: number;
  style?: string;
  sorting?: 'word' | 'letter';
}

/**
 * Glossary configuration
 */
export interface GlossaryOptions {
  enabled?: boolean;
  package?: 'glossaries' | 'glossaries-extra';
  acronyms?: boolean;
  symbols?: boolean;
  style?: string;
  sorting?: string;
}

/**
 * Academic journal configuration
 */
export interface JournalOptions {
  template?: string; // Journal template name
  class?: string; // Journal document class
  style?: string; // Citation style
  doublespacing?: boolean;
  linenumbers?: boolean;
  anonymize?: boolean; // Remove author information
}

/**
 * LaTeX parsing options
 */
export interface LaTeXParseOptions extends ParseOptions {
  /** Math parsing configuration */
  mathParsing?: MathParsingOptions;

  /** Bibliography parsing */
  bibliography?: BibliographyParsingOptions;

  /** Figure and table handling */
  floats?: FloatHandlingOptions;

  /** Cross-reference resolution */
  crossReferences?: CrossReferenceResolution;

  /** Custom command definitions */
  customCommands?: Record<string, CommandDefinition>;

  /** Package-specific parsing */
  packageParsers?: Record<string, PackageParser>;

  /** Error handling strategy */
  errorHandling?: 'strict' | 'lenient' | 'ignore';

  /** Preserve LaTeX comments */
  preserveComments?: boolean;

  /** Handle includes and inputs */
  followIncludes?: boolean;
}

/**
 * Mathematical content parsing options
 */
export interface MathParsingOptions {
  /** Math renderer for display */
  renderer?: 'mathjax' | 'katex' | 'plain';

  /** Preserve original LaTeX */
  preserveLaTeX?: boolean;

  /** Convert to MathML */
  mathML?: boolean;

  /** Handle custom math commands */
  customCommands?: Record<string, string>;

  /** Math environment handling */
  environments?: MathEnvironmentOptions;
}

/**
 * Mathematical environment handling
 */
export interface MathEnvironmentOptions {
  align?: 'preserve' | 'convert' | 'block';
  equation?: 'preserve' | 'convert' | 'block';
  gather?: 'preserve' | 'convert' | 'block';
  matrix?: 'preserve' | 'convert' | 'table';
  cases?: 'preserve' | 'convert' | 'list';
}

/**
 * Bibliography parsing configuration
 */
export interface BibliographyParsingOptions {
  /** Parse .bib files */
  parseBibFiles?: boolean;

  /** Citation style mapping */
  citationStyles?: Record<string, string>;

  /** Handle natbib commands */
  natbib?: boolean;

  /** Handle biblatex commands */
  biblatex?: boolean;

  /** URL handling in citations */
  urlHandling?: 'preserve' | 'convert' | 'remove';
}

/**
 * Float (figure/table) handling options
 */
export interface FloatHandlingOptions {
  /** Figure placement handling */
  figures?: 'preserve' | 'convert' | 'external';

  /** Table conversion */
  tables?: 'preserve' | 'convert' | 'html';

  /** Caption parsing */
  captions?: 'preserve' | 'extract';

  /** Label resolution */
  labels?: 'preserve' | 'convert' | 'remove';
}

/**
 * Cross-reference resolution
 */
export interface CrossReferenceResolution {
  /** Resolve internal references */
  resolveInternal?: boolean;

  /** Generate reference text */
  generateText?: boolean;

  /** Reference type mapping */
  typeMapping?: Record<string, string>;

  /** Prefix handling */
  prefixHandling?: 'preserve' | 'extract' | 'remove';
}

/**
 * Custom LaTeX command definition
 */
export interface CommandDefinition {
  /** Number of arguments */
  args?: number;

  /** Optional argument */
  optional?: boolean;

  /** Command expansion */
  expansion: string;

  /** Command type */
  type?: 'text' | 'math' | 'environment';
}

/**
 * Package-specific parser
 */
export interface PackageParser {
  /** Commands to handle */
  commands?: Record<string, (args: string[]) => any>;

  /** Environments to handle */
  environments?: Record<string, (content: string, options: any) => any>;

  /** Pre-processing function */
  preprocess?: (content: string) => string;

  /** Post-processing function */
  postprocess?: (result: any) => any;
}

/**
 * LaTeX document metadata
 */
export interface LaTeXMetadata {
  /** Document format */
  format: 'latex' | 'tex';

  /** LaTeX engine used */
  engine?: 'pdflatex' | 'xelatex' | 'lualatex';

  /** Document class */
  documentClass?: string;

  /** Packages used */
  packages?: LaTeXPackage[];

  /** Bibliography information */
  bibliography?: BibliographyMetadata;

  /** Math complexity */
  mathComplexity?: 'none' | 'basic' | 'advanced' | 'heavy';

  /** Figure count */
  figures?: number;

  /** Table count */
  tables?: number;

  /** Equation count */
  equations?: number;

  /** Cross-reference count */
  crossReferences?: number;

  /** Custom properties */
  customProperties?: Record<string, unknown>;
}

/**
 * Bibliography metadata
 */
export interface BibliographyMetadata {
  style?: string;
  backend?: string;
  entries?: number;
  files?: string[];
  citations?: number;
}

/**
 * LaTeX conversion context
 */
export interface LaTeXConversionContext {
  /** Current document being processed */
  document?: string;

  /** Command definitions */
  commands: Map<string, CommandDefinition>;

  /** Environment handlers */
  environments: Map<string, any>;

  /** Counter values */
  counters: Map<string, number>;

  /** Label definitions */
  labels: Map<string, string>;

  /** Citation keys */
  citations: Set<string>;

  /** Figure references */
  figures: Map<string, string>;

  /** Table references */
  tables: Map<string, string>;

  /** Equation references */
  equations: Map<string, string>;

  /** Include stack (for nested includes) */
  includeStack: string[];

  /** Current processing state */
  state: {
    inMath?: boolean;
    inFigure?: boolean;
    inTable?: boolean;
    currentEnvironment?: string;
    sectionLevel?: number;
  };
}

/**
 * LaTeX round-trip fidelity result
 */
export interface LaTeXRoundTripResult {
  /** Overall success */
  success: boolean;

  /** Fidelity score */
  fidelityScore: number;

  /** Content fidelity (text accuracy) */
  contentFidelity: number;

  /** Math fidelity (formula accuracy) */
  mathFidelity: number;

  /** Structure fidelity (document organization) */
  structureFidelity: number;

  /** Formatting fidelity (styling preservation) */
  formattingFidelity: number;

  /** Specific issues found */
  issues: LaTeXFidelityIssue[];

  /** Performance metrics */
  metrics: {
    renderTime: number;
    parseTime: number;
    compilationTime?: number;
    outputSize: number;
  };
}

/**
 * LaTeX-specific fidelity issue
 */
export interface LaTeXFidelityIssue {
  type: 'content' | 'math' | 'structure' | 'formatting' | 'compilation';
  severity: 'critical' | 'major' | 'minor' | 'cosmetic';
  description: string;
  location?: string;
  original?: string;
  converted?: string;
  recommendation?: string;
  command?: string;
  environment?: string;
}
/**
 * Result of parsing a LaTeX document
 */
export interface LaTeXParseResult {
  /** Whether parsing was successful */
  success: boolean;
  
  /** Parsed xats document */
  document: XatsDocument;
  
  /** Parsing metadata */
  metadata: Record<string, any>;
  
  /** Any parsing errors */
  errors?: Array<{
    message: string;
    location?: string;
  }>;
}

/**
 * Result of rendering to LaTeX format
 */
export interface LaTeXRenderResult {
  /** Whether rendering was successful */
  success: boolean;
  
  /** Rendered LaTeX content */
  content: string;
  
  /** Rendering metadata */
  metadata: Record<string, any>;
  
  /** Any rendering errors */
  errors?: Array<{
    message: string;
    location?: string;
  }>;
}
