/**
 * xats Annotation System Utilities
 *
 * Provides utilities for managing peer review workflows, annotation threading,
 * and review decision processing in accordance with xats v0.5.0 schema.
 */

// Core Types (mirrors the schema definitions)
export interface Annotation {
  id: string;
  language: string;
  annotationType: string;
  targetObjectId: string;
  targetRange?: TextRange;
  status: 'open' | 'resolved' | 'rejected' | 'deferred';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  reviewer: string;
  threadId?: string;
  parentAnnotationId?: string;
  content: SemanticText;
  suggestedChange?: SemanticText;
  reviewDecision?: ReviewDecision;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  annotations?: Annotation[];
  extensions?: Record<string, unknown>;
  // For thread hierarchy building (not in schema)
  replies?: Annotation[];
}

export interface TextRange {
  startOffset: number;
  endOffset: number;
  textContent: string;
  xpath?: string;
  selector?: string;
}

export interface SemanticText {
  runs: Array<{
    type: string;
    text?: string;
    refId?: string;
  }>;
}

export interface ReviewDecision {
  decision: 'approve' | 'reject' | 'request_changes' | 'conditional_accept';
  confidence: number;
  criteria?: string[];
  justification: SemanticText;
  recommendedActions?: Array<{
    action: string;
    description: SemanticText;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

// Vocabulary Constants
export const ANNOTATION_TYPES = {
  SUGGESTION: 'https://xats.org/vocabularies/annotations/suggestion',
  CLARIFICATION_REQUEST: 'https://xats.org/vocabularies/annotations/clarification_request',
  MINOR_REVISION_NEEDED: 'https://xats.org/vocabularies/annotations/minor_revision_needed',
  MAJOR_REVISION_NEEDED: 'https://xats.org/vocabularies/annotations/major_revision_needed',
  APPROVAL: 'https://xats.org/vocabularies/annotations/approval',
  REJECTION: 'https://xats.org/vocabularies/annotations/rejection',
} as const;

export const ANNOTATION_STATUS = {
  OPEN: 'open',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  DEFERRED: 'deferred',
} as const;

export const ANNOTATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const REVIEW_DECISIONS = {
  APPROVE: 'approve',
  REJECT: 'reject',
  REQUEST_CHANGES: 'request_changes',
  CONDITIONAL_ACCEPT: 'conditional_accept',
} as const;

// Utility Functions

/**
 * Create a new annotation with required metadata
 */
export function createAnnotation(params: {
  annotationType: string;
  targetObjectId: string;
  content: SemanticText;
  reviewer: string;
  targetRange?: TextRange;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  threadId?: string;
  parentAnnotationId?: string;
  suggestedChange?: SemanticText;
  reviewDecision?: ReviewDecision;
}): Annotation {
  const now = new Date().toISOString();

  const annotation: Annotation = {
    id: generateAnnotationId(),
    language: 'en', // Default, should be configurable
    annotationType: params.annotationType,
    targetObjectId: params.targetObjectId,
    status: 'open',
    priority: params.priority || 'medium',
    reviewer: params.reviewer,
    content: params.content,
    createdAt: now,
  };

  // Add optional properties only if provided
  if (params.targetRange) annotation.targetRange = params.targetRange;
  if (params.assignee) annotation.assignee = params.assignee;
  if (params.threadId) annotation.threadId = params.threadId;
  if (params.parentAnnotationId) annotation.parentAnnotationId = params.parentAnnotationId;
  if (params.suggestedChange) annotation.suggestedChange = params.suggestedChange;
  if (params.reviewDecision) annotation.reviewDecision = params.reviewDecision;

  return annotation;
}

/**
 * Generate a unique annotation ID
 */
export function generateAnnotationId(): string {
  return `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a thread ID for grouping related annotations
 */
export function generateThreadId(): string {
  return `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Update annotation status and add timestamp
 */
export function updateAnnotationStatus(
  annotation: Annotation,
  newStatus: 'open' | 'resolved' | 'rejected' | 'deferred'
): Annotation {
  const now = new Date().toISOString();
  const updated: Annotation = {
    ...annotation,
    status: newStatus,
  };

  updated.updatedAt = now;

  if (newStatus === 'resolved') {
    updated.resolvedAt = now;
  }

  return updated;
}

/**
 * Create a thread of related annotations
 */
export function createAnnotationThread(
  parentAnnotation: Annotation,
  replies: Omit<Annotation, 'threadId' | 'parentAnnotationId'>[]
): Annotation[] {
  const threadId = parentAnnotation.threadId || generateThreadId();

  const threadParent = {
    ...parentAnnotation,
    threadId,
  };

  const threadReplies = replies.map((reply) => ({
    ...reply,
    threadId,
    parentAnnotationId: parentAnnotation.id,
  }));

  return [threadParent, ...threadReplies];
}

/**
 * Filter annotations by various criteria
 */
export function filterAnnotations(
  annotations: Annotation[],
  filters: {
    status?: 'open' | 'resolved' | 'rejected' | 'deferred';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    annotationType?: string;
    reviewer?: string;
    assignee?: string;
    targetObjectId?: string;
  }
): Annotation[] {
  return annotations.filter((annotation) => {
    if (filters.status && annotation.status !== filters.status) return false;
    if (filters.priority && annotation.priority !== filters.priority) return false;
    if (filters.annotationType && annotation.annotationType !== filters.annotationType)
      return false;
    if (filters.reviewer && annotation.reviewer !== filters.reviewer) return false;
    if (filters.assignee && annotation.assignee !== filters.assignee) return false;
    if (filters.targetObjectId && annotation.targetObjectId !== filters.targetObjectId)
      return false;
    return true;
  });
}

/**
 * Group annotations by thread ID
 */
export function groupAnnotationsByThread(annotations: Annotation[]): Map<string, Annotation[]> {
  const threads = new Map<string, Annotation[]>();

  annotations.forEach((annotation) => {
    const threadId = annotation.threadId || annotation.id;
    if (!threads.has(threadId)) {
      threads.set(threadId, []);
    }
    threads.get(threadId)!.push(annotation);
  });

  // Sort each thread by creation time
  threads.forEach((thread) => {
    thread.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  return threads;
}

/**
 * Build hierarchical thread structure
 */
export function buildThreadHierarchy(annotations: Annotation[]): Annotation[] {
  const annotationMap = new Map<string, Annotation>();
  const roots: Annotation[] = [];

  // First pass: create annotation map
  annotations.forEach((annotation) => {
    annotationMap.set(annotation.id, { ...annotation, replies: [] });
  });

  // Second pass: build hierarchy
  annotations.forEach((annotation) => {
    const annotationWithReplies = annotationMap.get(annotation.id)!;

    if (annotation.parentAnnotationId) {
      const parent = annotationMap.get(annotation.parentAnnotationId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(annotationWithReplies);
      }
    } else {
      roots.push(annotationWithReplies);
    }
  });

  return roots;
}

/**
 * Calculate review progress metrics
 */
export function calculateReviewProgress(annotations: Annotation[]): {
  total: number;
  open: number;
  resolved: number;
  rejected: number;
  deferred: number;
  completionRate: number;
  criticalIssues: number;
} {
  const total = annotations.length;
  const statusCounts = annotations.reduce(
    (counts, annotation) => {
      counts[annotation.status] = (counts[annotation.status] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>
  );

  const open = statusCounts.open || 0;
  const resolved = statusCounts.resolved || 0;
  const rejected = statusCounts.rejected || 0;
  const deferred = statusCounts.deferred || 0;
  const completionRate = total > 0 ? ((resolved + rejected) / total) * 100 : 100;
  const criticalIssues = annotations.filter(
    (a) => a.priority === 'critical' && a.status === 'open'
  ).length;

  return {
    total,
    open,
    resolved,
    rejected,
    deferred,
    completionRate,
    criticalIssues,
  };
}

/**
 * Validate annotation against schema requirements
 */
export function validateAnnotation(annotation: Partial<Annotation>): string[] {
  const errors: string[] = [];

  if (!annotation.id) errors.push('Annotation must have an id');
  if (!annotation.language) errors.push('Annotation must have a language');
  if (!annotation.annotationType) errors.push('Annotation must have an annotationType');
  if (!annotation.targetObjectId) errors.push('Annotation must have a targetObjectId');
  if (!annotation.content) errors.push('Annotation must have content');
  if (!annotation.reviewer) errors.push('Annotation must have a reviewer');
  if (!annotation.createdAt) errors.push('Annotation must have a createdAt timestamp');

  // Validate URI format for annotationType
  if (annotation.annotationType && !isValidAnnotationTypeURI(annotation.annotationType)) {
    errors.push('annotationType must be a valid URI');
  }

  // Validate enum values
  if (
    annotation.status &&
    !['open', 'resolved', 'rejected', 'deferred'].includes(annotation.status)
  ) {
    errors.push('status must be one of: open, resolved, rejected, deferred');
  }

  if (annotation.priority && !['low', 'medium', 'high', 'critical'].includes(annotation.priority)) {
    errors.push('priority must be one of: low, medium, high, critical');
  }

  // Validate TextRange if present
  if (annotation.targetRange) {
    const range = annotation.targetRange;
    if (typeof range.startOffset !== 'number' || range.startOffset < 0) {
      errors.push('targetRange.startOffset must be a non-negative number');
    }
    if (typeof range.endOffset !== 'number' || range.endOffset < 0) {
      errors.push('targetRange.endOffset must be a non-negative number');
    }
    if (range.startOffset >= range.endOffset) {
      errors.push('targetRange.startOffset must be less than endOffset');
    }
    if (!range.textContent) {
      errors.push('targetRange.textContent is required');
    }
  }

  // Validate ReviewDecision if present
  if (annotation.reviewDecision) {
    const decision = annotation.reviewDecision;
    if (
      !['approve', 'reject', 'request_changes', 'conditional_accept'].includes(decision.decision)
    ) {
      errors.push(
        'reviewDecision.decision must be one of: approve, reject, request_changes, conditional_accept'
      );
    }
    if (
      typeof decision.confidence !== 'number' ||
      decision.confidence < 1 ||
      decision.confidence > 5
    ) {
      errors.push('reviewDecision.confidence must be a number between 1 and 5');
    }
    if (!decision.justification) {
      errors.push('reviewDecision.justification is required');
    }
  }

  return errors;
}

/**
 * Check if a URI is a valid annotation type URI
 */
export function isValidAnnotationTypeURI(uri: string): boolean {
  try {
    new URL(uri);
    return (
      uri.startsWith('https://xats.org/vocabularies/annotations/') ||
      uri.startsWith('http://xats.org/vocabularies/annotations/') ||
      /^https?:\/\/[\w.-]+\/vocabularies\/annotations\/\w+$/.test(uri)
    );
  } catch {
    return false;
  }
}

/**
 * Create a simple text SemanticText object for annotations
 */
export function createAnnotationSemanticText(text: string): SemanticText {
  return {
    runs: [{ type: 'text', text }],
  };
}

/**
 * Extract plain text from SemanticText
 */
export function extractPlainText(semanticText: SemanticText): string {
  return semanticText.runs
    .filter((run) => run.text)
    .map((run) => run.text)
    .join('');
}
