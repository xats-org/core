/**
 * @fileoverview Type definitions for Word converter
 */

import type {
  XatsDocument,
  RenderFormat,
  RendererOptions,
  RenderResult,
  ParseResult,
  ValidationResult,
} from '@xats-org/types';

// Core converter types
export interface WordConverter {
  readonly format: RenderFormat;
  readonly wcagLevel: 'A' | 'AA' | 'AAA' | null;

  render(document: XatsDocument, options?: WordRenderOptions): Promise<WordRenderResult>;
  parse(content: string | Buffer, options?: WordParseOptions): Promise<WordParseResult>;
  testRoundTrip(document: XatsDocument, options?: RoundTripOptions): Promise<RoundTripResult>;
  validate(content: string | Buffer): Promise<FormatValidationResult>;
  getMetadata?(content: string | Buffer): Promise<WordMetadata>;
}

// Render options
export interface WordRenderOptions extends RendererOptions {
  author?: string;
  documentTitle?: string;
  productionMode?: boolean;
  trackChanges?: TrackChangesOptions;
  comments?: CommentsOptions;
  template?: string;
  styleMappings?: WordStyleMappings;
  includeTableOfContents?: boolean;
  includeBibliography?: boolean;
  theme?: 'default' | 'educational' | 'academic' | 'professional';
  accessibilityMode?: boolean;
}

// Parse options
export interface WordParseOptions {
  preserveMetadata?: boolean;
  trackChanges?: {
    preserve: boolean;
    convertToAnnotations: boolean;
    includeRevisionHistory?: boolean;
    authorMappings?: Record<string, string>;
  };
  comments?: {
    preserve: boolean;
    convertToAnnotations: boolean;
    includeThreading?: boolean;
  };
  styleMappings?: WordStyleMappings;
  productionMode?: boolean;
}

// Style mappings
export interface WordStyleMappings {
  paragraphs?: Record<string, string>;
  characters?: Record<string, string>;
  tables?: Record<string, string>;
  lists?: Record<string, string>;
}

// Track changes options
export interface TrackChangesOptions {
  preserve: boolean;
  convertToAnnotations?: boolean;
  includeRevisionHistory?: boolean;
  authorMappings?: Record<string, string>;
}

// Comments options
export interface CommentsOptions {
  preserve: boolean;
  convertToAnnotations?: boolean;
  includeThreading?: boolean;
}

// Results
export interface WordRenderResult {
  content: Buffer;
  metadata: WordMetadata;
  errors?: ConversionError[];
  warnings?: ConversionWarning[];
  styleReport?: StyleReport;
}

export interface WordParseResult {
  document: XatsDocument;
  metadata: WordMetadata;
  errors?: ConversionError[];
  warnings?: ConversionWarning[];
  annotations?: Annotation[];
  trackChanges?: TrackChange[];
  comments?: Comment[];
}

// Round trip testing
export interface RoundTripOptions {
  fidelityThreshold?: number;
  semanticComparison?: boolean;
  ignoreFormatting?: boolean;
  ignoreMeta?: boolean;
}

export interface RoundTripResult {
  success: boolean;
  fidelityScore: number;
  contentFidelity: number;
  formattingFidelity: number;
  structureFidelity: number;
  issues: FidelityIssue[];
  originalDocument: XatsDocument;
  convertedDocument: XatsDocument;
  differences: DocumentDifference[];
}

// Metadata
export interface WordMetadata {
  format: 'docx';
  wordCount: number;
  pageCount?: number;
  features: string[];
  styles: string[];
  images: number;
  tables: number;
  equations: number;
  renderTime?: number;
  fileSize?: number;
  author?: string;
  title?: string;
  subject?: string;
  keywords?: string[];
  created?: Date;
  modified?: Date;
  trackChanges?: boolean;
  comments?: number;
}

// Validation
export interface FormatValidationResult {
  valid: boolean;
  format: 'docx';
  structureValid: boolean;
  contentValid: boolean;
  metadataValid: boolean;
  errors: string[];
  warnings: string[];
  wordSpecificIssues?: WordValidationIssue[];
}

export interface WordValidationIssue {
  type: 'structure' | 'content' | 'metadata' | 'style';
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: string;
  suggestion?: string;
}

// Errors and warnings
export interface ConversionError {
  code: string;
  message: string;
  recoverable: boolean;
  location?: string;
  suggestion?: string;
}

export interface ConversionWarning {
  code: string;
  message: string;
  location?: string;
  impact: 'low' | 'medium' | 'high';
}

// Style reporting
export interface StyleReport {
  mappedStyles: Record<string, string>;
  unmappedStyles: string[];
  newStyles: string[];
  conflicts: StyleConflict[];
}

export interface StyleConflict {
  styleName: string;
  conflict: string;
  resolution: string;
}

// Annotations and collaboration
export interface Annotation {
  id: string;
  type:
    | 'comment'
    | 'suggestion'
    | 'clarification_request'
    | 'minor_revision_needed'
    | 'major_revision_needed'
    | 'approval'
    | 'rejection';
  content: string;
  author: string;
  timestamp: Date;
  location: AnnotationLocation;
  status: 'open' | 'resolved' | 'rejected' | 'deferred';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  thread?: string;
}

export interface AnnotationLocation {
  blockId?: string;
  runIndex?: number;
  characterOffset?: number;
  selection?: {
    start: number;
    end: number;
  };
}

export interface TrackChange {
  id: string;
  type: 'insert' | 'delete' | 'modify';
  author: string;
  timestamp: Date;
  content: string;
  originalContent?: string;
  location: AnnotationLocation;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  location: AnnotationLocation;
  thread?: Comment[];
  status: 'open' | 'resolved';
}

// Fidelity testing
export interface FidelityIssue {
  type: 'content' | 'formatting' | 'structure' | 'metadata';
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

// Options interfaces
export interface WordConverterOptions extends RendererOptions {
  defaultStyleMappings?: WordStyleMappings;
  qualityThreshold?: number;
  enableTrackChanges?: boolean;
  enableComments?: boolean;
  productionDefaults?: boolean;
}
