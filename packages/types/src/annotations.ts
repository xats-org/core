/**
 * xats v0.5.0 Annotation System Types
 *
 * TypeScript type definitions for the peer review and annotation system
 * introduced in xats schema version 0.5.0
 */

import type { XatsObject } from './common.js';
import type { SemanticText } from './document.js';

/**
 * Text range specification for precise targeting
 */
export interface TextRange {
  /** Character offset from beginning of target text where range starts */
  startOffset: number;
  /** Character offset from beginning of target text where range ends */
  endOffset: number;
  /** The actual text content being annotated */
  textContent: string;
  /** Optional XPath expression for targeting specific elements */
  xpath?: string;
  /** Optional CSS-style selector for web-based targeting */
  selector?: string;
}

/**
 * Formal review decision structure
 */
export interface ReviewDecision {
  /** The formal review decision outcome */
  decision: 'approve' | 'reject' | 'request_changes' | 'conditional_accept';
  /** Reviewer confidence level (1-5 scale, 5 = highest confidence) */
  confidence: number;
  /** Specific review criteria that influenced this decision */
  criteria?: string[];
  /** Detailed explanation for the review decision */
  justification: SemanticText;
  /** Specific actions recommended to address review findings */
  recommendedActions?: RecommendedAction[];
}

/**
 * Recommended action for addressing review findings
 */
export interface RecommendedAction {
  /** Type of action recommended */
  action: string;
  /** Description of the action */
  description: SemanticText;
  /** Priority level for this action */
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Annotation status values
 */
export type AnnotationStatus = 'open' | 'resolved' | 'rejected' | 'deferred';

/**
 * Annotation priority levels
 */
export type AnnotationPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Standard xats annotation type URIs
 */
export const ANNOTATION_TYPE_URIS = {
  /** Proposed change to content */
  SUGGESTION: 'https://xats.org/vocabularies/annotations/suggestion',
  /** Need for more information */
  CLARIFICATION_REQUEST: 'https://xats.org/vocabularies/annotations/clarification_request',
  /** Small fix required */
  MINOR_REVISION_NEEDED: 'https://xats.org/vocabularies/annotations/minor_revision_needed',
  /** Significant change required */
  MAJOR_REVISION_NEEDED: 'https://xats.org/vocabularies/annotations/major_revision_needed',
  /** Content approved */
  APPROVAL: 'https://xats.org/vocabularies/annotations/approval',
  /** Content rejected */
  REJECTION: 'https://xats.org/vocabularies/annotations/rejection',
} as const;

/**
 * Union type for standard annotation type URIs
 */
export type StandardAnnotationType =
  (typeof ANNOTATION_TYPE_URIS)[keyof typeof ANNOTATION_TYPE_URIS];

/**
 * Core annotation interface extending XatsObject
 */
export interface Annotation extends XatsObject {
  /** Required unique identifier */
  id: string;
  /** Required language code */
  language: string;
  /** URI identifying the type of annotation */
  annotationType: string;
  /** The ID of the XatsObject this annotation references */
  targetObjectId: string;
  /** Specific text range within the target object */
  targetRange?: TextRange;
  /** Current status of the annotation */
  status: AnnotationStatus;
  /** Priority level for addressing this annotation */
  priority: AnnotationPriority;
  /** Identifier for the person assigned to address this annotation */
  assignee?: string;
  /** Identifier for the person who created this annotation */
  reviewer: string;
  /** Identifier for grouping related annotations into discussion threads */
  threadId?: string;
  /** ID of parent annotation for hierarchical discussion threads */
  parentAnnotationId?: string;
  /** The annotation content */
  content: SemanticText;
  /** Proposed replacement content for suggestion-type annotations */
  suggestedChange?: SemanticText;
  /** Formal review decision with criteria and justification */
  reviewDecision?: ReviewDecision;
  /** ISO 8601 timestamp when annotation was created */
  createdAt: string;
  /** ISO 8601 timestamp when annotation was last modified */
  updatedAt?: string;
  /** ISO 8601 timestamp when annotation was resolved */
  resolvedAt?: string;
  /** Nested annotations for hierarchical structures */
  annotations?: Annotation[];
}

/**
 * Parameters for creating a new annotation
 */
export interface CreateAnnotationParams {
  annotationType: string;
  targetObjectId: string;
  content: SemanticText;
  reviewer: string;
  targetRange?: TextRange;
  priority?: AnnotationPriority;
  assignee?: string;
  threadId?: string;
  parentAnnotationId?: string;
  suggestedChange?: SemanticText;
  reviewDecision?: ReviewDecision;
  language?: string;
}

/**
 * Filters for annotation queries
 */
export interface AnnotationFilters {
  status?: AnnotationStatus;
  priority?: AnnotationPriority;
  annotationType?: string;
  reviewer?: string;
  assignee?: string;
  targetObjectId?: string;
  threadId?: string;
}

/**
 * Review progress metrics
 */
export interface ReviewProgress {
  /** Total number of annotations */
  total: number;
  /** Number of open annotations */
  open: number;
  /** Number of resolved annotations */
  resolved: number;
  /** Number of rejected annotations */
  rejected: number;
  /** Number of deferred annotations */
  deferred: number;
  /** Completion percentage */
  completionRate: number;
  /** Number of critical issues still open */
  criticalIssues: number;
}

/**
 * Annotation thread structure for hierarchical display
 */
export interface AnnotationThread {
  /** Thread identifier */
  threadId: string;
  /** Root annotation starting the thread */
  rootAnnotation: Annotation;
  /** Nested reply annotations */
  replies: AnnotationThreadNode[];
  /** Thread metadata */
  metadata: {
    participantCount: number;
    lastActivity: string;
    status: AnnotationStatus;
    priority: AnnotationPriority;
  };
}

/**
 * Individual node in an annotation thread
 */
export interface AnnotationThreadNode {
  /** The annotation for this node */
  annotation: Annotation;
  /** Child reply nodes */
  replies: AnnotationThreadNode[];
  /** Depth level in the thread */
  level: number;
}

/**
 * Annotation validation result
 */
export interface AnnotationValidationResult {
  /** Whether the annotation is valid */
  isValid: boolean;
  /** Validation error messages */
  errors: string[];
}

/**
 * Batch annotation operation result
 */
export interface BatchAnnotationResult {
  /** Number of successful operations */
  successful: number;
  /** Number of failed operations */
  failed: number;
  /** Details of failed operations */
  failures: Array<{
    annotation: Annotation;
    error: string;
  }>;
}

/**
 * Annotation export format options
 */
export interface AnnotationExportOptions {
  /** Include resolved annotations */
  includeResolved?: boolean;
  /** Include rejected annotations */
  includeRejected?: boolean;
  /** Filter by priority levels */
  priorities?: AnnotationPriority[];
  /** Filter by annotation types */
  annotationTypes?: string[];
  /** Export format */
  format: 'json' | 'csv' | 'markdown' | 'html';
}

/**
 * Type guard to check if an object is an annotation
 */
export function isAnnotation(obj: unknown): obj is Annotation {
  if (typeof obj !== 'object' || obj === null) return false;

  const annotation = obj as Record<string, unknown>;

  return (
    typeof annotation.id === 'string' &&
    typeof annotation.language === 'string' &&
    typeof annotation.annotationType === 'string' &&
    typeof annotation.targetObjectId === 'string' &&
    ['open', 'resolved', 'rejected', 'deferred'].includes(annotation.status as string) &&
    ['low', 'medium', 'high', 'critical'].includes(annotation.priority as string) &&
    typeof annotation.reviewer === 'string' &&
    typeof annotation.content === 'object' &&
    typeof annotation.createdAt === 'string'
  );
}

/**
 * Type guard to check if an annotation type URI is standard
 */
export function isStandardAnnotationType(uri: string): uri is StandardAnnotationType {
  return Object.values(ANNOTATION_TYPE_URIS).includes(uri as StandardAnnotationType);
}

/**
 * Utility type for annotation collections
 */
export type AnnotationCollection = Annotation[];

/**
 * Utility type for annotation maps indexed by ID
 */
export type AnnotationMap = Map<string, Annotation>;

/**
 * Utility type for thread collections
 */
export type ThreadCollection = AnnotationThread[];

// SemanticText is already exported from document.js in index.ts
