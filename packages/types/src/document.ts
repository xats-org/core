/**
 * Document structure types for xats
 */

import type { XatsObject, XatsUri, LanguageCode } from './common.js';
import type { FileReference } from './file-modularity.js';

/**
 * Main xats document structure
 */
export interface XatsDocument {
  schemaVersion: string;
  bibliographicEntry: CslDataItem;
  subject: XatsUri;
  frontMatter?: FrontMatter;
  bodyMatter: BodyMatter;
  backMatter?: BackMatter;
  lang?: LanguageCode;
  dir?: 'ltr' | 'rtl' | 'auto';
  accessibilityMetadata?: AccessibilityMetadata;
  rightsMetadata?: RightsMetadata;
}

/**
 * CSL-JSON bibliographic data
 */
export interface CslDataItem {
  type: string;
  title?: string;
  author?: Array<{ family?: string; given?: string }>;
  issued?: { 'date-parts': Array<Array<number>> };
  publisher?: string;
  ISBN?: string;
  DOI?: string;
  URL?: string;
  [key: string]: unknown;
}

/**
 * Document front matter
 */
export interface FrontMatter {
  preface?: ContentBlock[];
  acknowledgments?: ContentBlock[];
  [key: string]: unknown;
}

/**
 * Document body matter containing main content
 */
export interface BodyMatter {
  contents: Array<Unit | Chapter>;
}

/**
 * Document back matter
 */
export interface BackMatter {
  appendices?: Chapter[];
  glossary?: ContentBlock[];
  bibliography?: ContentBlock[];
  index?: ContentBlock[];
  [key: string]: unknown;
}

/**
 * Structural container base interface
 */
export interface StructuralContainer extends XatsObject {
  label?: string;
  title: SemanticText;
  pathways?: Pathway[];
  learningOutcomes?: LearningOutcome[];
  resources?: Resource[];
  keyTerms?: KeyTerm[];
  renderingHints?: RenderingHint[];
}

/**
 * Unit - highest level structural container
 */
export interface Unit extends StructuralContainer {
  contents: Array<Chapter | ContentBlock>;
}

/**
 * Chapter - mid-level structural container
 */
export interface Chapter extends StructuralContainer {
  contents: Array<Section | ContentBlock>;
  fileReference?: FileReference;
}

/**
 * Section - lowest level structural container
 */
export interface Section extends StructuralContainer {
  contents: ContentBlock[];
  fileReference?: FileReference;
}

/**
 * Content block - basic unit of content
 */
export interface ContentBlock extends XatsObject {
  blockType: XatsUri;
  content: unknown;
  renderingHints?: RenderingHint[];
}

/**
 * Semantic text with typed runs
 */
export interface SemanticText {
  runs: Run[];
}

/**
 * Union type for all run types
 */
export type Run = TextRun | ReferenceRun | CitationRun | EmphasisRun | StrongRun | IndexRun;

/**
 * Plain text run
 */
export interface TextRun {
  type: 'text';
  text: string;
}

/**
 * Internal reference run
 */
export interface ReferenceRun {
  type: 'reference';
  text: string;
  ref: string;
}

/**
 * Citation reference run
 */
export interface CitationRun {
  type: 'citation';
  citeKey: string;
}

/**
 * Emphasized text run
 */
export interface EmphasisRun {
  type: 'emphasis';
  runs: Run[];
}

/**
 * Strong emphasis text run
 */
export interface StrongRun {
  type: 'strong';
  runs: Run[];
}

/**
 * Index entry run
 */
export interface IndexRun {
  type: 'index';
  text: string;
  entry: string;
  subEntry?: string;
  see?: string;
  seeAlso?: string[];
}

/**
 * Learning outcome
 */
export interface LearningOutcome extends XatsObject {
  statement: SemanticText;
  bloomLevel?: string;
}

/**
 * Learning objective
 */
export interface LearningObjective extends XatsObject {
  statement: SemanticText;
  bloomLevel?: string;
}

/**
 * Educational resource
 */
export interface Resource extends XatsObject {
  title: SemanticText;
  resourceType: XatsUri;
  url?: string;
  description?: SemanticText;
  duration?: string;
  difficulty?: string;
}

/**
 * Key term definition
 */
export interface KeyTerm extends XatsObject {
  term: string;
  definition: SemanticText;
}

/**
 * Conditional learning pathway
 */
export interface Pathway {
  id: string;
  pathwayType: XatsUri;
  title?: SemanticText;
  description?: SemanticText;
  condition?: string;
  contents?: ContentBlock[];
  trigger?: XatsUri;
}

/**
 * Rendering hint for presentation
 */
export interface RenderingHint {
  hintType: XatsUri;
  value: unknown;
}

/**
 * Accessibility metadata
 */
export interface AccessibilityMetadata {
  accessMode?: string[];
  accessModeSufficient?: string[];
  accessibilityFeature?: string[];
  accessibilityHazard?: string[];
  accessibilitySummary?: string;
}

/**
 * Rights and licensing metadata
 */
export interface RightsMetadata {
  copyrightHolder?: string;
  copyrightYear?: number;
  copyrightNotice?: string;
  license?: string;
  licenseUrl?: string;
  rightsStatement?: string;
}

// Note: FileReference is defined in file-modularity.ts to avoid circular dependency