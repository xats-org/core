/**
 * LaTeX-specific types and interfaces
 */

import type {
  RendererOptions,
  ParseOptions,
  FormatMetadata,
} from '@xats-org/types';

/**
 * LaTeX document classes
 */
export type LaTeXDocumentClass = 
  | 'article'
  | 'book'
  | 'report'
  | 'memoir'
  | 'scrartcl'
  | 'scrbook'
  | 'scrreprt'
  | 'amsart'
  | 'amsbook'
  | 'amsproc'
  | 'ieeetran'
  | 'beamer'
  | 'standalone'
  | string; // Allow custom classes

/**
 * LaTeX package definition
 */
export interface LaTeXPackage {
  /** Package name */
  name: string;
  /** Package options */
  options?: string[];
  /** Whether package is required for functionality */
  required?: boolean;
  /** Description of what the package provides */
  description?: string;
}

/**
 * LaTeX environment definition
 */
export interface LaTeXEnvironment {
  /** Environment name */
  name: string;
  /** Environment options/parameters */
  options?: string[];
  /** Whether environment requires specific packages */
  requiredPackages?: string[];
}

/**
 * LaTeX renderer options extending base renderer options
 */
export interface LaTeXRendererOptions extends RendererOptions {
  /** LaTeX document class to use */
  documentClass?: LaTeXDocumentClass;
  
  /** Document class options */
  documentOptions?: string[];
  
  /** LaTeX packages to include */
  packages?: LaTeXPackage[];
  
  /** Custom LaTeX commands to define */
  customCommands?: string[];
  
  /** LaTeX preamble additions */
  preamble?: string;
  
  /** Paper size (a4paper, letterpaper, etc.) */
  paperSize?: string;
  
  /** Font size (10pt, 11pt, 12pt) */
  fontSize?: string;
  
  /** Whether to use UTF-8 encoding */
  useUTF8?: boolean;
  
  /** Bibliography style */
  bibliographyStyle?: 'plain' | 'alpha' | 'unsrt' | 'abbrv' | 'ieeetr' | 'acm' | 'siam' | string;
  
  /** Whether to use natbib for citations */
  useNatbib?: boolean;
  
  /** Whether to use biblatex instead of bibtex */
  useBiblatex?: boolean;
  
  /** Citation style for biblatex */
  citationStyle?: string;
  
  /** Math environments to preserve */
  preserveMathEnvironments?: string[];
  
  /** Whether to wrap inline math with $ or \( \) */
  inlineMathDelimiter?: '$' | 'parentheses';
  
  /** Whether to include draft mode markers */
  draftMode?: boolean;
  
  /** Line spacing (singlespacing, onehalfspacing, doublespacing) */
  lineSpacing?: string;
  
  /** Margin settings */
  margins?: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  };
  
  /** Custom LaTeX code to insert before \begin{document} */
  beforeBeginDocument?: string;
  
  /** Custom LaTeX code to insert after \begin{document} */
  afterBeginDocument?: string;
  
  /** Custom LaTeX code to insert before \end{document} */
  beforeEndDocument?: string;
}

/**
 * LaTeX parsing options extending base parse options
 */
export interface LaTeXParseOptions extends ParseOptions {
  /** Whether to preserve LaTeX comments */
  preserveComments?: boolean;
  
  /** Whether to preserve custom commands */
  preserveCustomCommands?: boolean;
  
  /** Known custom commands and their mappings */
  customCommandMappings?: Record<string, string>;
  
  /** Bibliography file paths */
  bibliographyFiles?: string[];
  
  /** Whether to parse included files */
  parseIncludes?: boolean;
  
  /** Base directory for resolving includes */
  includeBaseDir?: string;
  
  /** Math environments to preserve as-is */
  preserveMathEnvironments?: string[];
  
  /** Whether to normalize whitespace */
  normalizeWhitespace?: boolean;
  
  /** Maximum recursion depth for includes */
  maxIncludeDepth?: number;
  
  /** Custom environment handlers */
  environmentHandlers?: Record<string, (content: string) => unknown>;
}

/**
 * LaTeX document metadata
 */
export interface LaTeXMetadata extends FormatMetadata {
  /** Detected document class */
  documentClass?: string;
  
  /** Document class options */
  documentOptions?: string[];
  
  /** Used packages */
  packages?: LaTeXPackage[];
  
  /** Custom commands found */
  customCommands?: string[];
  
  /** Bibliography files referenced */
  bibliographyFiles?: string[];
  
  /** Math environments used */
  mathEnvironments?: string[];
  
  /** Figures and tables count */
  figures?: number;
  tables?: number;
  
  /** Citation keys found */
  citations?: string[];
  
  /** Label/reference keys found */
  labels?: string[];
  references?: string[];
  
  /** LaTeX engine compatibility */
  engineCompatibility?: {
    pdflatex?: boolean;
    xelatex?: boolean;
    lualatex?: boolean;
  };
  
  /** Required compilation passes */
  compilationPasses?: number;
}

/**
 * LaTeX compilation context
 */
export interface LaTeXContext {
  /** Current section depth */
  sectionDepth: number;
  
  /** Equation counter */
  equationCounter: number;
  
  /** Figure counter */
  figureCounter: number;
  
  /** Table counter */
  tableCounter: number;
  
  /** List depth */
  listDepth: number;
  
  /** Current list type */
  listType?: 'itemize' | 'enumerate' | 'description';
  
  /** Bibliography entries */
  bibliography: Map<string, unknown>;
  
  /** Labels and references */
  labels: Set<string>;
  references: Set<string>;
  
  /** Custom commands in scope */
  customCommands: Map<string, string>;
  
  /** Current environment stack */
  environmentStack: string[];
  
  /** Math mode state */
  inMathMode: boolean;
  
  /** Custom data for extensibility */
  custom?: Record<string, unknown>;
}

/**
 * LaTeX command definition
 */
export interface LaTeXCommand {
  /** Command name (without backslash) */
  name: string;
  
  /** Number of arguments */
  numArgs?: number;
  
  /** Optional argument */
  hasOptionalArg?: boolean;
  
  /** Command definition/replacement */
  definition: string;
  
  /** Whether command is a math command */
  isMathMode?: boolean;
  
  /** Required packages */
  requiredPackages?: string[];
}

/**
 * LaTeX error types specific to parsing/rendering
 */
export interface LaTeXError {
  type: 'syntax' | 'missing-package' | 'undefined-command' | 'math-error' | 'file-not-found' | 'other';
  message: string;
  line?: number;
  column?: number;
  command?: string;
  environment?: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

/**
 * LaTeX table structure
 */
export interface LaTeXTable {
  /** Column specifications */
  columnSpec: string;
  
  /** Table rows */
  rows: LaTeXTableRow[];
  
  /** Caption */
  caption?: string;
  
  /** Label for references */
  label?: string;
  
  /** Table placement */
  placement?: string;
  
  /** Whether to use booktabs style */
  useBooktabs?: boolean;
}

/**
 * LaTeX table row
 */
export interface LaTeXTableRow {
  /** Cell contents */
  cells: string[];
  
  /** Row type */
  type?: 'normal' | 'hline' | 'cline' | 'midrule' | 'toprule' | 'bottomrule';
  
  /** Additional row formatting */
  formatting?: string;
}

/**
 * LaTeX figure structure
 */
export interface LaTeXFigure {
  /** Figure content (includegraphics, tikz, etc.) */
  content: string;
  
  /** Caption */
  caption?: string;
  
  /** Label for references */
  label?: string;
  
  /** Figure placement */
  placement?: string;
  
  /** Width specification */
  width?: string;
  
  /** Height specification */
  height?: string;
  
  /** Additional options */
  options?: string[];
}

/**
 * Math expression types
 */
export type MathExpressionType = 'inline' | 'display' | 'equation' | 'align' | 'gather' | 'multline' | 'custom';

/**
 * LaTeX math expression
 */
export interface LaTeXMathExpression {
  /** Type of math expression */
  type: MathExpressionType;
  
  /** Raw LaTeX content */
  content: string;
  
  /** Environment name for display math */
  environment?: string;
  
  /** Label for equation references */
  label?: string;
  
  /** Equation number (if numbered) */
  number?: string;
  
  /** Whether equation is starred (unnumbered) */
  starred?: boolean;
}

/**
 * Citation information
 */
export interface LaTeXCitation {
  /** Citation keys */
  keys: string[];
  
  /** Citation command used (\cite, \citep, \citet, etc.) */
  command: string;
  
  /** Optional arguments */
  prenote?: string;
  postnote?: string;
  
  /** Raw citation text */
  rawText: string;
}

/**
 * Cross-reference information
 */
export interface LaTeXCrossReference {
  /** Reference key */
  key: string;
  
  /** Reference command (\ref, \pageref, \autoref, etc.) */
  command: string;
  
  /** Reference type (if known) */
  type?: 'section' | 'figure' | 'table' | 'equation' | 'listing' | 'other';
}