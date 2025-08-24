/**
 * @fileoverview Validation tests for the simple annotation example
 */

import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Simple Annotation Example Validation', () => {
  const examplePath = join(__dirname, '../examples/v0.5.0/simple-annotation-example.json');
  const document = JSON.parse(readFileSync(examplePath, 'utf8'));

  test('document structure is valid', () => {
    expect(document.schemaVersion).toBe('0.5.0');
    expect(document.$schema).toBe('https://xats.org/schemas/0.5.0/schema.json');
    expect(document.bibliographicEntry).toBeDefined();
    expect(document.subject).toBeDefined();
    expect(document.bodyMatter).toBeDefined();
  });

  test('contains expected annotation types', () => {
    const annotations = extractAllAnnotations(document);
    const types = new Set(annotations.map(a => a.annotationType));
    
    expect(types.has('https://xats.org/vocabularies/annotations/suggestion')).toBe(true);
    expect(types.has('https://xats.org/vocabularies/annotations/clarification_request')).toBe(true);
    expect(types.has('https://xats.org/vocabularies/annotations/approval')).toBe(true);
    expect(types.has('https://xats.org/vocabularies/annotations/major_revision_needed')).toBe(true);
  });

  test('annotations have required fields', () => {
    const annotations = extractAllAnnotations(document);
    
    annotations.forEach(annotation => {
      expect(annotation.id).toBeDefined();
      expect(annotation.annotationType).toBeDefined();
      expect(annotation.targetObjectId).toBeDefined();
      expect(annotation.status).toBeDefined();
      expect(annotation.priority).toBeDefined();
      expect(annotation.reviewer).toBeDefined();
      expect(annotation.content).toBeDefined();
      expect(annotation.createdAt).toBeDefined();
    });
  });

  test('demonstrates key annotation features', () => {
    const annotations = extractAllAnnotations(document);
    
    // Should have suggested change
    const withSuggestions = annotations.filter(a => a.suggestedChange);
    expect(withSuggestions.length).toBeGreaterThan(0);
    
    // Should have review decision
    const withDecisions = annotations.filter(a => a.reviewDecision);
    expect(withDecisions.length).toBeGreaterThan(0);
    
    // Should have assignee
    const withAssignee = annotations.filter(a => a.assignee);
    expect(withAssignee.length).toBeGreaterThan(0);
    
    // Should have resolved annotation
    const resolved = annotations.filter(a => a.status === 'resolved');
    expect(resolved.length).toBeGreaterThan(0);
  });
});

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