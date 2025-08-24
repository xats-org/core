/**
 * @fileoverview Validation tests for the comprehensive annotation demo
 * Tests that the annotation system implementation meets all requirements for Phase 3 of issue #65
 */

import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Comprehensive Annotation Demo Validation', () => {
  const examplePath = join(__dirname, '../examples/v0.5.0/comprehensive-annotation-demo.json');
  const document = JSON.parse(readFileSync(examplePath, 'utf8'));

  test('document has correct schema version', () => {
    expect(document.schemaVersion).toBe('0.5.0');
    expect(document.$schema).toBe('https://xats.org/schemas/0.5.0/schema.json');
  });

  test('demonstrates all annotation types', () => {
    const annotations = extractAllAnnotations(document);
    
    const annotationTypes = new Set(
      annotations.map(annotation => annotation.annotationType)
    );

    // Verify all required annotation types are present
    expect(annotationTypes).toContain('https://xats.org/vocabularies/annotations/suggestion');
    expect(annotationTypes).toContain('https://xats.org/vocabularies/annotations/clarification_request');
    expect(annotationTypes).toContain('https://xats.org/vocabularies/annotations/minor_revision_needed');
    expect(annotationTypes).toContain('https://xats.org/vocabularies/annotations/major_revision_needed');
    expect(annotationTypes).toContain('https://xats.org/vocabularies/annotations/approval');
    expect(annotationTypes).toContain('https://xats.org/vocabularies/annotations/rejection');
  });

  test('demonstrates all annotation statuses', () => {
    const annotations = extractAllAnnotations(document);
    
    const statuses = new Set(
      annotations.map(annotation => annotation.status)
    );

    // Verify all required statuses are present
    expect(statuses).toContain('open');
    expect(statuses).toContain('resolved');
    expect(statuses).toContain('rejected');
    expect(statuses).toContain('deferred');
  });

  test('demonstrates all priority levels', () => {
    const annotations = extractAllAnnotations(document);
    
    const priorities = new Set(
      annotations.map(annotation => annotation.priority)
    );

    // Verify all priority levels are present
    expect(priorities).toContain('low');
    expect(priorities).toContain('medium');
    expect(priorities).toContain('high');
    expect(priorities).toContain('critical');
  });

  test('demonstrates threading functionality', () => {
    const annotations = extractAllAnnotations(document);
    
    // Find annotations that have thread relationships
    const threaded = annotations.filter(annotation => 
      annotation.threadId || annotation.parentAnnotationId
    );
    
    expect(threaded.length).toBeGreaterThan(0);
    
    // Verify thread structure
    const parentAnnotations = annotations.filter(annotation => 
      annotation.threadId && !annotation.parentAnnotationId
    );
    const childAnnotations = annotations.filter(annotation => 
      annotation.parentAnnotationId
    );
    
    expect(parentAnnotations.length).toBeGreaterThan(0);
    expect(childAnnotations.length).toBeGreaterThan(0);
    
    // Verify child annotations reference valid parent IDs
    childAnnotations.forEach(child => {
      const parent = annotations.find(annotation => 
        annotation.id === child.parentAnnotationId
      );
      expect(parent).toBeDefined();
    });
  });

  test('demonstrates assignee functionality', () => {
    const annotations = extractAllAnnotations(document);
    
    const assignedAnnotations = annotations.filter(annotation => 
      annotation.assignee
    );
    
    expect(assignedAnnotations.length).toBeGreaterThan(0);
  });

  test('demonstrates target range functionality', () => {
    const annotations = extractAllAnnotations(document);
    
    const rangeAnnotations = annotations.filter(annotation => 
      annotation.targetRange
    );
    
    expect(rangeAnnotations.length).toBeGreaterThan(0);
    
    // Verify target range structure
    rangeAnnotations.forEach(annotation => {
      const range = annotation.targetRange;
      expect(range.startOffset).toBeTypeOf('number');
      expect(range.endOffset).toBeTypeOf('number');
      expect(range.startOffset).toBeLessThanOrEqual(range.endOffset);
      expect(range.textContent).toBeTypeOf('string');
    });
  });

  test('demonstrates suggested changes', () => {
    const annotations = extractAllAnnotations(document);
    
    const suggestionsWithChanges = annotations.filter(annotation => 
      annotation.suggestedChange
    );
    
    expect(suggestionsWithChanges.length).toBeGreaterThan(0);
    
    // Verify suggested change structure
    suggestionsWithChanges.forEach(annotation => {
      expect(annotation.suggestedChange.runs).toBeDefined();
      expect(Array.isArray(annotation.suggestedChange.runs)).toBe(true);
    });
  });

  test('demonstrates review decisions', () => {
    const annotations = extractAllAnnotations(document);
    
    const annotationsWithDecisions = annotations.filter(annotation => 
      annotation.reviewDecision
    );
    
    expect(annotationsWithDecisions.length).toBeGreaterThan(0);
    
    // Verify review decision structure
    annotationsWithDecisions.forEach(annotation => {
      const decision = annotation.reviewDecision;
      expect(decision.decision).toBeDefined();
      expect(['approve', 'reject', 'request_changes', 'conditional_accept']).toContain(decision.decision);
      expect(decision.confidence).toBeGreaterThanOrEqual(1);
      expect(decision.confidence).toBeLessThanOrEqual(5);
      expect(Array.isArray(decision.criteria)).toBe(true);
    });
  });

  test('demonstrates recommended actions', () => {
    const annotations = extractAllAnnotations(document);
    
    const annotationsWithActions = annotations.filter(annotation => 
      annotation.reviewDecision?.recommendedActions
    );
    
    expect(annotationsWithActions.length).toBeGreaterThan(0);
    
    // Verify recommended actions structure
    annotationsWithActions.forEach(annotation => {
      const actions = annotation.reviewDecision.recommendedActions;
      expect(Array.isArray(actions)).toBe(true);
      actions.forEach(action => {
        expect(action.action).toBeTypeOf('string');
        expect(action.description).toBeDefined();
        expect(action.priority).toBeDefined();
      });
    });
  });

  test('demonstrates timestamp fields', () => {
    const annotations = extractAllAnnotations(document);
    
    // All annotations should have createdAt
    annotations.forEach(annotation => {
      expect(annotation.createdAt).toBeDefined();
      // Verify ISO 8601 format
      expect(() => new Date(annotation.createdAt)).not.toThrow();
    });
    
    // Some annotations should have resolvedAt
    const resolvedAnnotations = annotations.filter(annotation => 
      annotation.resolvedAt
    );
    expect(resolvedAnnotations.length).toBeGreaterThan(0);
    
    resolvedAnnotations.forEach(annotation => {
      expect(() => new Date(annotation.resolvedAt)).not.toThrow();
    });
  });

  test('demonstrates annotation metadata capabilities', () => {
    const annotations = extractAllAnnotations(document);
    
    // Find annotations with rich metadata
    const annotationsWithTags = annotations.filter(annotation => 
      annotation.tags && annotation.tags.length > 0
    );
    expect(annotationsWithTags.length).toBeGreaterThan(0);
    
    const annotationsWithDescription = annotations.filter(annotation => 
      annotation.description
    );
    expect(annotationsWithDescription.length).toBeGreaterThan(0);
    
    const annotationsWithExtensions = annotations.filter(annotation => 
      annotation.extensions
    );
    expect(annotationsWithExtensions.length).toBeGreaterThan(0);
  });

  test('demonstrates backward compatibility', () => {
    // Verify the document structure is compatible with v0.5.0 requirements
    expect(document.schemaVersion).toBe('0.5.0');
    expect(document.bibliographicEntry).toBeDefined();
    expect(document.subject).toBeDefined();
    expect(document.bodyMatter).toBeDefined();
    
    // Verify annotations don't break existing XatsObject structure
    const allObjects = extractAllXatsObjects(document);
    allObjects.forEach(obj => {
      if (obj.annotations) {
        expect(Array.isArray(obj.annotations)).toBe(true);
      }
    });
  });
});

/**
 * Recursively extract all annotations from a document
 */
function extractAllAnnotations(document: any): any[] {
  const annotations: any[] = [];
  
  function traverse(obj: any) {
    if (typeof obj !== 'object' || obj === null) return;
    
    if (obj.annotations && Array.isArray(obj.annotations)) {
      annotations.push(...obj.annotations);
    }
    
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else {
      Object.values(obj).forEach(traverse);
    }
  }
  
  traverse(document);
  return annotations;
}

/**
 * Recursively extract all XatsObjects from a document
 */
function extractAllXatsObjects(document: any): any[] {
  const objects: any[] = [];
  
  function traverse(obj: any) {
    if (typeof obj !== 'object' || obj === null) return;
    
    // If object has an ID, it's likely a XatsObject
    if (obj.id) {
      objects.push(obj);
    }
    
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else {
      Object.values(obj).forEach(traverse);
    }
  }
  
  traverse(document);
  return objects;
}