# xats Annotation Vocabulary Specification v0.5.0

**Version:** 0.5.0  
**Date:** 2025-08-24  
**Status:** Draft  

## Overview

This document defines the standard vocabulary URIs for the xats annotation system, enabling structured peer review workflows, collaborative editing, and academic feedback processes.

## Base URI

All annotation vocabulary URIs use the base:
```
https://xats.org/vocabularies/annotations/
```

## Annotation Types

### Core Review Annotations

#### `suggestion`
**URI:** `https://xats.org/vocabularies/annotations/suggestion`  
**Description:** Proposes specific changes to content  
**Use Case:** Content revision recommendations  
**Required Properties:** `content`, `suggestedChange` (recommended)  

#### `clarification_request`  
**URI:** `https://xats.org/vocabularies/annotations/clarification_request`  
**Description:** Requests additional information or explanation  
**Use Case:** Identifying unclear or ambiguous content  
**Required Properties:** `content`  

#### `minor_revision_needed`  
**URI:** `https://xats.org/vocabularies/annotations/minor_revision_needed`  
**Description:** Indicates need for small corrections (typos, formatting, etc.)  
**Use Case:** Editorial feedback, minor corrections  
**Required Properties:** `content`  

#### `major_revision_needed`  
**URI:** `https://xats.org/vocabularies/annotations/major_revision_needed`  
**Description:** Indicates need for significant content changes  
**Use Case:** Structural or substantive content issues  
**Required Properties:** `content`, `reviewDecision` (recommended)  

#### `approval`  
**URI:** `https://xats.org/vocabularies/annotations/approval`  
**Description:** Formal approval of content  
**Use Case:** Peer review sign-off, content validation  
**Required Properties:** `content`, `reviewDecision`  

#### `rejection`  
**URI:** `https://xats.org/vocabularies/annotations/rejection`  
**Description:** Formal rejection of content  
**Use Case:** Content that doesn't meet standards  
**Required Properties:** `content`, `reviewDecision`  

### Extended Annotation Types (Future)

#### `question`  
**URI:** `https://xats.org/vocabularies/annotations/question`  
**Description:** Poses a question about the content  
**Use Case:** Student questions, clarifying discussions  

#### `commendation`  
**URI:** `https://xats.org/vocabularies/annotations/commendation`  
**Description:** Positive feedback about content quality  
**Use Case:** Recognizing excellence, best practices  

#### `accessibility_concern`  
**URI:** `https://xats.org/vocabularies/annotations/accessibility_concern`  
**Description:** Identifies accessibility issues  
**Use Case:** WCAG compliance review, inclusive design  

#### `pedagogical_concern`  
**URI:** `https://xats.org/vocabularies/annotations/pedagogical_concern`  
**Description:** Questions about educational effectiveness  
**Use Case:** Learning objective alignment, instructional design  

## Workflow Integration

### Status Values
All annotations support these status values:
- `open`: Annotation needs attention
- `resolved`: Issue has been addressed  
- `rejected`: Annotation dismissed without action
- `deferred`: Action postponed to future iteration

### Priority Levels  
All annotations support these priority levels:
- `low`: Nice-to-have improvements
- `medium`: Standard feedback (default)
- `high`: Important issues requiring attention
- `critical`: Blocking issues that must be addressed

### Review Decision Integration

For formal peer review workflows, annotations of type `approval`, `rejection`, and `major_revision_needed` should include a `reviewDecision` object with:

```json
{
  "decision": "approve|reject|request_changes|conditional_accept",
  "confidence": 1-5,
  "criteria": ["accuracy", "clarity", "pedagogical_effectiveness"],
  "justification": { "runs": [{"type": "text", "text": "..."}] }
}
```

## Thread Management

Annotations can be organized into discussion threads using:
- `threadId`: Groups related annotations
- `parentAnnotationId`: Creates hierarchical responses

Example thread structure:
```
Original annotation (threadId: "thread-001")
├── Response 1 (threadId: "thread-001", parentAnnotationId: "original-id")  
├── Response 2 (threadId: "thread-001", parentAnnotationId: "original-id")
└── Response to Response 1 (threadId: "thread-001", parentAnnotationId: "response-1-id")
```

## Implementation Guidelines

### For Content Authors
1. Use `suggestion` for specific change proposals
2. Include `suggestedChange` content when possible
3. Set appropriate `priority` levels
4. Use `threadId` to group related feedback

### For Reviewers  
1. Use `reviewDecision` for formal reviews
2. Include specific `criteria` for transparency
3. Set `confidence` levels honestly
4. Use `recommendedActions` for actionable feedback

### For Tool Developers
1. Validate annotation URIs against this specification
2. Support status workflow transitions  
3. Implement thread visualization
4. Provide filtering by annotation type and status

## Extensibility

Organizations can extend this vocabulary by:

1. **Custom Types:** Define organization-specific URIs following the pattern:
   ```
   https://organization.edu/vocabularies/annotations/custom_type
   ```

2. **Extensions Object:** Use the `extensions` property on annotations for additional metadata:
   ```json
   {
     "extensions": {
       "organizationSpecific": {
         "workflow": "internal-review",
         "department": "mathematics"
       }
     }
   }
   ```

3. **Rendering Hints:** Apply rendering hints for custom display:
   ```json
   {
     "renderingHints": [
       {
         "hintType": "https://xats.org/vocabularies/hints/semantic/annotation",
         "value": "urgent-review"
       }
     ]
   }
   ```

## Compatibility

This vocabulary is designed to be:
- **Forward Compatible:** New types can be added without breaking existing tools
- **Extensible:** Custom types and properties supported
- **Interoperable:** Works with existing annotation standards (Web Annotation Data Model, OpenAnnotation)
- **Version Safe:** URIs include implicit versioning through schema version requirements

## References

- [Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) - W3C Standard
- [Open Annotation Core](http://www.openannotation.org/spec/core/) - OpenAnnotation specification  
- [xats Schema v0.5.0](/packages/schema/schemas/0.5.0/xats.schema.json) - JSON Schema definitions