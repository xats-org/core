# Phase 3 Peer Review & Annotation System Design

**Date:** 2025-08-24-0256  
**Issue:** #65  
**Phase:** 3  
**Agent:** xats-project-steward  

## Overview

This document outlines the design decisions for implementing Phase 3 of issue #65: Peer Review & Annotation Layer. The annotation system will enable structured academic peer review workflows by extending the existing xats schema with annotation capabilities.

## Core Requirements

From issue #65, the peer review system must support:

### Annotation Types
- `suggestion` - Proposed change
- `clarification_request` - Need more information  
- `minor_revision_needed` - Small fix required
- `major_revision_needed` - Significant change required
- `approval` - Content approved
- `rejection` - Content rejected

### Annotation Properties
- `status`: open, resolved, rejected, deferred
- `priority`: low, medium, high, critical  
- `assignee`: Reviewer assignment
- `thread`: Discussion threading

### Review Workflow Features
- Annotation management interface
- Review assignment system
- Progress tracking
- Version comparison

## Architecture Decisions

### 1. Schema Integration Strategy

**Decision:** Extend `XatsObject` with an optional `annotations` property rather than creating a separate annotation system.

**Rationale:**
- Maintains consistency with existing xats architecture
- Allows annotations on any addressable component
- Preserves backward compatibility
- Follows the established extension pattern

### 2. Annotation Data Structure

**Decision:** Create a new `Annotation` definition that extends `XatsObject` with peer review specific properties.

```json
{
  "Annotation": {
    "allOf": [
      { "$ref": "#/definitions/XatsObject" },
      {
        "type": "object",
        "properties": {
          "annotationType": { "type": "string", "format": "uri" },
          "targetObjectId": { "type": "string" },
          "targetRange": { "$ref": "#/definitions/TextRange" },
          "status": { "enum": ["open", "resolved", "rejected", "deferred"] },
          "priority": { "enum": ["low", "medium", "high", "critical"] },
          "assignee": { "type": "string" },
          "reviewer": { "type": "string" },
          "threadId": { "type": "string" },
          "parentAnnotationId": { "type": "string" },
          "content": { "$ref": "#/definitions/SemanticText" },
          "suggestedChange": { "$ref": "#/definitions/SemanticText" },
          "reviewDecision": { "$ref": "#/definitions/ReviewDecision" },
          "createdAt": { "type": "string", "format": "date-time" },
          "updatedAt": { "type": "string", "format": "date-time" },
          "resolvedAt": { "type": "string", "format": "date-time" }
        }
      }
    ]
  }
}
```

### 3. Vocabulary URIs

**Decision:** Use the established xats vocabulary pattern with new annotation-specific URIs:

- `https://xats.org/vocabularies/annotations/suggestion`
- `https://xats.org/vocabularies/annotations/clarification_request`
- `https://xats.org/vocabularies/annotations/minor_revision_needed`
- `https://xats.org/vocabularies/annotations/major_revision_needed`
- `https://xats.org/vocabularies/annotations/approval`
- `https://xats.org/vocabularies/annotations/rejection`

### 4. Text Range Targeting

**Decision:** Create a `TextRange` definition to support precise targeting of content within objects.

```json
{
  "TextRange": {
    "type": "object",
    "properties": {
      "startOffset": { "type": "integer", "minimum": 0 },
      "endOffset": { "type": "integer", "minimum": 0 },
      "textContent": { "type": "string" }
    },
    "additionalProperties": false
  }
}
```

### 5. Review Decision Structure

**Decision:** Create a structured `ReviewDecision` object to capture formal review outcomes.

```json
{
  "ReviewDecision": {
    "type": "object",
    "properties": {
      "decision": { "enum": ["approve", "reject", "request_changes"] },
      "confidence": { "type": "integer", "minimum": 1, "maximum": 5 },
      "criteria": { "type": "array", "items": { "type": "string" } },
      "justification": { "$ref": "#/definitions/SemanticText" }
    }
  }
}
```

## Implementation Plan

### Phase 3.1: Schema Extensions
1. Add `Annotation`, `TextRange`, and `ReviewDecision` definitions to v0.5.0 schema
2. Add `annotations` property to `XatsObject`
3. Update schema validation tests

### Phase 3.2: Vocabulary Implementation
1. Define annotation vocabulary URIs
2. Create vocabulary documentation
3. Add vocabulary validation

### Phase 3.3: Examples and Documentation
1. Create comprehensive peer review workflow examples
2. Write user guides for annotation features
3. Create API reference documentation

### Phase 3.4: Tooling Integration
1. Update TypeScript types
2. Create annotation utilities
3. Add workflow management tools

## Backwards Compatibility

The annotation system is designed to be fully backwards compatible:
- `annotations` property is optional on all `XatsObject` instances
- Existing documents without annotations remain valid
- New annotation features can be gradually adopted

## Future Considerations

### Phase 4 Integration Points
The annotation system is designed to integrate with Phase 4 collaborative features:
- Annotation threads can support multi-user discussions
- Review assignments can link to collaborative project blocks
- Progress tracking can integrate with project management features

### Extensibility
The annotation system follows xats extension patterns:
- Custom annotation types can be added via vocabulary extensions
- Additional properties can be added via the `extensions` object
- Rendering hints can customize annotation display