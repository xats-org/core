# xats v0.5.0 Annotation System Examples

This directory contains comprehensive examples demonstrating the annotation system implemented in xats v0.5.0 schema. The annotation system enables peer review workflows and collaborative editing for educational content.

## Example Documents

### 1. `simple-annotation-example.json`
A basic example showcasing the core annotation types:
- **Suggestion**: Propose specific improvements with suggested changes
- **Clarification Request**: Ask for explanation or additional information  
- **Approval**: Formally approve content quality
- **Major Revision Needed**: Request substantial changes with recommended actions

### 2. `comprehensive-annotation-demo.json`
A complete demonstration of all annotation system features:
- All annotation types (suggestion, clarification_request, minor_revision_needed, major_revision_needed, approval, rejection)
- All status values (open, resolved, rejected, deferred)
- All priority levels (low, medium, high, critical)
- Threading functionality with parent-child annotation relationships
- Assignee and reviewer workflow
- Target range precision targeting
- Review decisions with criteria and justification
- Recommended actions for systematic improvement
- Rich metadata including tags, descriptions, and extensions

### 3. `collaborative-annotation-example.json`
Focuses on collaborative features:
- Multi-reviewer discussions through threaded annotations
- Conversation flow with parent-child relationships
- Cross-referencing between different content sections

### 4. `peer-review-workflow-demo.json`
Demonstrates formal peer review workflows:
- Academic review processes with formal decisions
- Status transitions from open to resolved
- Structured review criteria and confidence ratings

## Annotation Vocabulary

The xats annotation system uses URI-based vocabulary for annotation types:

| Type | URI | Purpose |
|------|-----|---------|
| Suggestion | `https://xats.org/vocabularies/annotations/suggestion` | Propose specific improvements |
| Clarification Request | `https://xats.org/vocabularies/annotations/clarification_request` | Request explanation |
| Minor Revision | `https://xats.org/vocabularies/annotations/minor_revision_needed` | Small corrections needed |
| Major Revision | `https://xats.org/vocabularies/annotations/major_revision_needed` | Substantial changes needed |
| Approval | `https://xats.org/vocabularies/annotations/approval` | Formal content approval |
| Rejection | `https://xats.org/vocabularies/annotations/rejection` | Formal content rejection |

## Key Features

### Status Workflow
- `open`: Newly created annotation requiring attention
- `resolved`: Annotation has been addressed and closed  
- `rejected`: Annotation was dismissed as not applicable
- `deferred`: Annotation postponed to future revision

### Priority Levels
- `low`: Nice-to-have improvements
- `medium`: Standard review feedback
- `high`: Important issues requiring attention
- `critical`: Blocking issues that must be resolved

### Threading System
Annotations can be grouped into discussion threads using:
- `threadId`: Groups related annotations together
- `parentAnnotationId`: Creates hierarchical discussion structure

### Precision Targeting
Annotations can target specific text ranges within content using:
```json
"targetRange": {
  "startOffset": 45,
  "endOffset": 64,
  "textContent": "the specific text being annotated",
  "xpath": "//runs[1]/text()[1]"
}
```

### Review Decisions
Formal review decisions include:
```json
"reviewDecision": {
  "decision": "approve|reject|request_changes|conditional_accept",
  "confidence": 1-5,
  "criteria": ["accuracy", "clarity", "completeness"],
  "justification": { "runs": [...] },
  "recommendedActions": [...]
}
```

## Usage Guidelines

1. **Annotation Placement**: Annotations are attached to any XatsObject via the `annotations` array property
2. **Required Fields**: All annotations must have `annotationType`, `targetObjectId`, `content`, `reviewer`, and `createdAt`
3. **Thread Organization**: Use consistent `threadId` values to group related discussion
4. **Status Management**: Update `status` and add `resolvedAt` timestamp when addressing annotations
5. **Assignee Workflow**: Use `assignee` field to route annotations to specific team members

## Backward Compatibility

The annotation system is fully backward compatible with existing xats v0.5.0 documents. Annotations are optional and do not affect documents that don't use them.