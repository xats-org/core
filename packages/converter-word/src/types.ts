/**
 * Types and interfaces for Word document conversion
 * Supports Microsoft Word bidirectional conversion with production workflow features
 */

import type { RendererOptions, ParseOptions } from '@xats-org/types';

/**
 * Advanced Word converter options extending base renderer options
 */
export interface WordConverterOptions extends RendererOptions {
  /** Document title for Word metadata */
  documentTitle?: string;

  /** Author name for Word metadata */
  author?: string;

  /** Document subject for Word metadata */
  documentSubject?: string;

  /** Company/organization for metadata */
  company?: string;

  /** Document category */
  category?: string;

  /** Keywords for document */
  keywords?: string[];

  /** Document language */
  language?: string;

  /** Page setup configuration */
  pageSetup?: PageSetup;

  /** Typography settings */
  typography?: Typography;

  /** Track changes settings */
  trackChanges?: TrackChangesOptions;

  /** Comment preservation settings */
  comments?: CommentOptions;

  /** Style mapping configuration */
  styleMappings?: StyleMappings;

  /** Image handling options */
  imageHandling?: ImageHandling;

  /** Table formatting options */
  tableFormatting?: TableFormatting;

  /** Math equation handling */
  mathHandling?: MathHandling;

  /** Template file path (for custom Word templates) */
  templatePath?: string;

  /** Enable production workflow features */
  productionMode?: boolean;
}

/**
 * Page setup configuration
 */
export interface PageSetup {
  /** Page size */
  size?: {
    width: number; // in DXA units (twentieths of a point)
    height: number;
  };

  /** Page orientation */
  orientation?: 'portrait' | 'landscape';

  /** Page margins */
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    header?: number;
    footer?: number;
  };

  /** Section breaks */
  sectionBreaks?: boolean;

  /** Headers and footers */
  headers?: {
    different_first_page?: boolean;
    different_odd_even?: boolean;
  };
}

/**
 * Typography configuration
 */
export interface Typography {
  /** Default font family */
  defaultFont?: string;

  /** Default font size in half-points */
  fontSize?: number;

  /** Line spacing */
  lineSpacing?: number;

  /** Paragraph spacing */
  paragraphSpacing?: {
    before?: number;
    after?: number;
  };

  /** Heading fonts */
  headingFonts?: {
    [level: number]: {
      font?: string;
      size?: number;
      bold?: boolean;
      color?: string;
    };
  };

  /** Enable smart quotes */
  smartQuotes?: boolean;

  /** Hyphenation settings */
  hyphenation?: boolean;
}

/**
 * Track changes handling options
 */
export interface TrackChangesOptions {
  /** Preserve track changes during conversion */
  preserve?: boolean;

  /** Convert track changes to xats annotations */
  convertToAnnotations?: boolean;

  /** Author mapping for track changes */
  authorMappings?: Record<string, string>;

  /** Include revision history */
  includeRevisionHistory?: boolean;
}

/**
 * Comment handling options
 */
export interface CommentOptions {
  /** Preserve comments during conversion */
  preserve?: boolean;

  /** Convert comments to xats annotations */
  convertToAnnotations?: boolean;

  /** Include comment threading */
  includeThreading?: boolean;

  /** Comment author mappings */
  authorMappings?: Record<string, string>;
}

/**
 * Style mapping configuration
 */
export interface StyleMappings {
  /** Paragraph style mappings */
  paragraphs?: Record<string, string>;

  /** Character style mappings */
  characters?: Record<string, string>;

  /** Custom style handling */
  customStyles?: Record<string, StyleMapping>;

  /** Default style for unmapped elements */
  defaultStyle?: string;
}

/**
 * Individual style mapping definition
 */
export interface StyleMapping {
  /** Target xats block type */
  blockType?: string;

  /** CSS class mapping */
  cssClass?: string;

  /** Semantic meaning */
  semantic?: string;

  /** Preserve formatting */
  preserveFormatting?: boolean;
}

/**
 * Image handling configuration
 */
export interface ImageHandling {
  /** Image extraction strategy */
  extractionMode?: 'embed' | 'external' | 'reference';

  /** Output directory for extracted images */
  outputDirectory?: string;

  /** Image format preferences */
  formats?: string[];

  /** Maximum image dimensions */
  maxDimensions?: {
    width?: number;
    height?: number;
  };

  /** Image compression settings */
  compression?: {
    quality?: number;
    format?: 'png' | 'jpeg' | 'webp';
  };

  /** Alt text handling */
  altTextHandling?: 'preserve' | 'generate' | 'ignore';
}

/**
 * Table formatting options
 */
export interface TableFormatting {
  /** Preserve table styling */
  preserveStyling?: boolean;

  /** Border handling */
  borders?: 'preserve' | 'normalize' | 'remove';

  /** Cell padding */
  cellPadding?: number;

  /** Header row detection */
  headerDetection?: 'auto' | 'first-row' | 'none';

  /** Column width handling */
  columnWidths?: 'preserve' | 'auto' | 'equal';
}

/**
 * Math equation handling
 */
export interface MathHandling {
  /** Math equation format */
  format?: 'mathml' | 'latex' | 'unicode' | 'image';

  /** Preserve equation editor data */
  preserveEquationData?: boolean;

  /** Fallback format for unsupported equations */
  fallbackFormat?: 'text' | 'image';
}

/**
 * Word parsing options
 */
export interface WordParseOptions extends ParseOptions {
  /** Handle track changes */
  trackChanges?: TrackChangesOptions;

  /** Handle comments */
  comments?: CommentOptions;

  /** Style mapping configuration */
  styleMappings?: StyleMappings;

  /** Image extraction options */
  imageHandling?: ImageHandling;

  /** Table parsing options */
  tableFormatting?: TableFormatting;

  /** Math handling options */
  mathHandling?: MathHandling;

  /** Include document properties */
  includeProperties?: boolean;

  /** Preserve formatting hints */
  preserveFormatting?: boolean;

  /** Page break handling */
  pageBreaks?: 'preserve' | 'convert' | 'ignore';
}

/**
 * Word document metadata
 */
export interface WordMetadata {
  /** Document format */
  format: 'docx' | 'doc';

  /** Word version information */
  wordVersion?: string;

  /** Document properties */
  properties?: DocumentProperties;

  /** Document statistics */
  statistics?: DocumentStatistics;

  /** Style information */
  styles?: StyleInfo[];

  /** Custom properties */
  customProperties?: Record<string, unknown>;
}

/**
 * Document properties from Word file
 */
export interface DocumentProperties {
  title?: string;
  subject?: string;
  author?: string;
  keywords?: string;
  comments?: string;
  category?: string;
  company?: string;
  manager?: string;
  created?: Date;
  modified?: Date;
  lastAuthor?: string;
  revision?: string;
  template?: string;
  language?: string;
}

/**
 * Document statistics
 */
export interface DocumentStatistics {
  pages?: number;
  words?: number;
  characters?: number;
  paragraphs?: number;
  lines?: number;
  tables?: number;
  images?: number;
  equations?: number;
}

/**
 * Style information
 */
export interface StyleInfo {
  id: string;
  name: string;
  type: 'paragraph' | 'character' | 'table' | 'list';
  basedOn?: string;
  nextStyle?: string;
  inUse: boolean;
}

/**
 * Track changes revision
 */
export interface Revision {
  id: string;
  type: 'insert' | 'delete' | 'format';
  author: string;
  date: Date;
  content: string;
  originalContent?: string;
}

/**
 * Document comment
 */
export interface DocumentComment {
  id: string;
  author: string;
  date: Date;
  content: string;
  range: {
    start: number;
    end: number;
  };
  replies?: DocumentComment[];
  resolved?: boolean;
}

/**
 * Round-trip fidelity test result for Word documents
 */
export interface WordRoundTripResult {
  /** Overall success */
  success: boolean;

  /** Fidelity score */
  fidelityScore: number;

  /** Content fidelity */
  contentFidelity: number;

  /** Formatting fidelity */
  formattingFidelity: number;

  /** Structure fidelity */
  structureFidelity: number;

  /** Specific issues found */
  issues: FidelityIssue[];

  /** Performance metrics */
  metrics: {
    renderTime: number;
    parseTime: number;
    fileSize: {
      original: number;
      rendered: number;
      parsed: number;
    };
  };
}

/**
 * Fidelity issue found during round-trip testing
 */
export interface FidelityIssue {
  type: 'content' | 'formatting' | 'structure' | 'metadata';
  severity: 'critical' | 'major' | 'minor' | 'cosmetic';
  description: string;
  location?: string;
  expected?: unknown;
  actual?: unknown;
  recommendation?: string;
}

/**
 * Word conversion context for tracking state
 */
export interface WordConversionContext {
  /** Current document being processed */
  document?: any; // docx.Document

  /** Style registry */
  styles: Map<string, StyleMapping>;

  /** Image registry */
  images: Map<string, string>;

  /** Comment registry */
  comments: Map<string, DocumentComment>;

  /** Revision registry */
  revisions: Map<string, Revision>;

  /** Numbering definitions */
  numbering: Map<string, any>;

  /** Footnote/endnote registry */
  notes: Map<string, any>;

  /** Cross-reference targets */
  references: Map<string, string>;

  /** Current processing location */
  currentLocation?: {
    section?: number;
    paragraph?: number;
    run?: number;
  };
}