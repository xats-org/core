/**
 * @fileoverview Type definitions for LaTeX converter
 */

import type {
  XatsDocument,
  RenderFormat,
  RendererOptions,
  RenderResult,
  ParseResult,
  ValidationResult,
  RenderMetadata,
  ParseMetadata,
  RenderError,
  ParseWarning,
} from '@xats-org/types';

// Core converter types
export interface LaTeXConverter {
  readonly format: RenderFormat;
  readonly wcagLevel: 'A' | 'AA' | 'AAA' | null;

  render(document: XatsDocument, options?: LaTeXRenderOptions): Promise<LaTeXRenderResult>;
  parse(content: string, options?: LaTeXParseOptions): Promise<LaTeXParseResult>;
  testRoundTrip(document: XatsDocument, options?: RoundTripOptions): Promise<RoundTripResult>;
  validate(content: string): Promise<FormatValidationResult>;
  getMetadata?(content: string): Promise<LaTeXRenderMetadata>;
}

// Render options
export interface LaTeXRenderOptions extends RendererOptions {
  documentClass?: string;
  packages?: LaTeXPackage[];
  bibliography?: BibliographyOptions;
  mathDelimiters?: MathDelimiters;
  customCommands?: Record<string, string>;
  theme?: 'article' | 'book' | 'report' | 'amsart' | 'custom';
  outputFormat?: 'latex' | 'pdf';
  includeHeaders?: boolean;
  includeDocumentWrapper?: boolean;
}

// Parse options
export interface LaTeXParseOptions {
  mathParsing?: MathParsingOptions;
  bibliography?: {
    parseBibFiles: boolean;
    natbib?: boolean;
    biblatex?: boolean;
  };
  packages?: {
    extractUsed: boolean;
    resolveCommands: boolean;
  };
  customCommands?: Record<string, string>;
  preserveComments?: boolean;
}

// LaTeX packages
export interface LaTeXPackage {
  name: string;
  options?: string[];
  required?: boolean;
  version?: string;
}

// Math delimiters
export interface MathDelimiters {
  inline: {
    open: string;
    close: string;
  };
  display: {
    open: string;
    close: string;
  };
}

// Math parsing options
export interface MathParsingOptions {
  renderer?: 'mathjax' | 'katex' | 'native';
  preserveLaTeX?: boolean;
  mathML?: boolean;
  customCommands?: Record<string, string>;
  environments?: Record<string, 'preserve' | 'convert'>;
}

// Bibliography options
export interface BibliographyOptions {
  style?: string;
  backend?: 'bibtex' | 'biber' | 'biblatex';
  sortOrder?: string;
  includeFiles?: string[];
}

// Results
export interface LaTeXRenderResult extends RenderResult {
  content: string;
  metadata: LaTeXRenderMetadata;
  errors?: LaTeXConversionError[];
  packages: LaTeXPackage[];
  customCommands: Record<string, string>;
}

export interface LaTeXParseResult extends ParseResult {
  document: XatsDocument;
  metadata: LaTeXParseMetadata;
  warnings?: LaTeXConversionWarning[];
  packages: LaTeXPackage[];
  bibliography?: BibliographyEntry[];
  customCommands: Record<string, string>;
}

// Round trip testing
export interface RoundTripOptions {
  fidelityThreshold?: number;
  mathFidelityThreshold?: number;
  ignoreFormatting?: boolean;
  ignoreBibliography?: boolean;
}

export interface RoundTripResult {
  success: boolean;
  fidelityScore: number;
  mathFidelity: number;
  contentFidelity: number;
  structureFidelity: number;
  issues: FidelityIssue[];
  originalDocument: XatsDocument;
  convertedDocument: XatsDocument;
  differences: DocumentDifference[];
}

// Metadata
export interface LaTeXRenderMetadata extends RenderMetadata {
  format: 'latex';
  documentClass?: string;
  packages: string[];
  commands: string[];
  environments: string[];
  mathComplexity: 'low' | 'medium' | 'high';
  equationCount: number;
  figureCount: number;
  tableCount: number;
  crossReferences: number;
  bibliographyCount: number;
  author?: string;
  title?: string;
  date?: string;
}

export interface LaTeXParseMetadata extends ParseMetadata {
  sourceFormat: 'latex';
  documentClass?: string;
  packages: string[];
  commands: string[];
  environments: string[];
  mathComplexity: 'low' | 'medium' | 'high';
  equationCount: number;
  figureCount: number;
  tableCount: number;
  crossReferences: number;
  bibliographyCount: number;
  author?: string;
  title?: string;
  date?: string;
}

// Validation
export interface FormatValidationResult extends ValidationResult {
  format: 'latex';
  structureValid: boolean;
  mathValid: boolean;
  bibliographyValid: boolean;
  latexSpecificIssues?: LaTeXValidationIssue[];
}

export interface LaTeXValidationIssue {
  type: 'syntax' | 'math' | 'package' | 'bibliography' | 'command';
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

// Errors and warnings
export interface LaTeXConversionError extends RenderError {
  code: string;
  line?: number;
  column?: number;
  suggestion?: string;
  // LaTeX-specific error types mapped to base types
  latexErrorType?: 'syntax' | 'math' | 'package' | 'bibliography';
}

export interface LaTeXConversionWarning extends ParseWarning {
  code: string;
  line?: number;
  column?: number;
  impact: 'low' | 'medium' | 'high';
  // LaTeX-specific warning types mapped to base types
  latexWarningType?: 'syntax' | 'math' | 'package' | 'bibliography';
}

// Bibliography
export interface BibliographyEntry {
  id: string;
  type: string;
  fields: Record<string, string>;
  crossRefs?: string[];
}

// Fidelity testing
export interface FidelityIssue {
  type: 'content' | 'math' | 'structure' | 'bibliography';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  location?: string;
  originalValue?: any;
  convertedValue?: any;
  recommendation?: string;
}

export interface DocumentDifference {
  path: string;
  type: 'added' | 'removed' | 'modified';
  original?: any;
  converted?: any;
  impact: 'low' | 'medium' | 'high';
}

// Math processing
export interface MathExpression {
  type: 'inline' | 'display' | 'environment';
  latex: string;
  mathML?: string;
  rendered?: string;
  environment?: string;
  label?: string;
  number?: string;
}

export interface MathEnvironment {
  name: string;
  content: string;
  numbered: boolean;
  label?: string;
}

// Cross-references
export interface CrossReference {
  type: 'equation' | 'figure' | 'table' | 'section' | 'chapter';
  label: string;
  target?: string;
  text?: string;
}

// Options interfaces
export interface LaTeXConverterOptions extends RendererOptions {
  defaultPackages?: LaTeXPackage[];
  mathRenderer?: 'mathjax' | 'katex';
  enableBibliography?: boolean;
  qualityThreshold?: number;
  academicMode?: boolean;
}
