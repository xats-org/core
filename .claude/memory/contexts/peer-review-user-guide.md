# xats Peer Review & Annotation System User Guide

**Version:** 0.5.0  
**Date:** 2025-08-24  
**Target Audience:** Content authors, reviewers, and educational technology developers  

## Introduction

The xats v0.5.0 peer review and annotation system provides a comprehensive framework for collaborative content development, academic peer review workflows, and structured feedback management. This system enables seamless integration with existing publishing workflows while maintaining the semantic richness that makes xats unique.

## Key Features

### Core Capabilities
- **Structured Annotations**: Create typed annotations with rich metadata
- **Text Range Targeting**: Precisely target specific text segments
- **Discussion Threading**: Support multi-participant conversations
- **Review Decision Tracking**: Formal review outcomes with criteria and confidence scores
- **Status Management**: Track annotation lifecycle from creation to resolution
- **Priority Levels**: Organize feedback by urgency and importance

### Integration Benefits
- **Version Control**: Full compatibility with git-based workflows
- **LMS Integration**: Works with existing LTI 1.3 implementations
- **Export Compatibility**: Maintains annotation data across format conversions
- **Accessibility**: Full WCAG compliance for inclusive review processes

## Annotation Types

### Suggestion (`https://xats.org/vocabularies/annotations/suggestion`)
**Purpose**: Propose specific changes to content  
**Best For**: Content improvements, alternative wordings, structural changes  

**Example**:
```json
{
  "annotationType": "https://xats.org/vocabularies/annotations/suggestion",
  "content": {
    "runs": [{"type": "text", "text": "Consider adding a concrete example here"}]
  },
  "suggestedChange": {
    "runs": [{"type": "text", "text": "For instance, a neural network trained to recognize handwritten digits..."}]
  }
}
```

### Clarification Request (`https://xats.org/vocabularies/annotations/clarification_request`)
**Purpose**: Request additional information or explanation  
**Best For**: Identifying unclear concepts, requesting examples, asking questions  

**Example**:
```json
{
  "annotationType": "https://xats.org/vocabularies/annotations/clarification_request",
  "content": {
    "runs": [{"type": "text", "text": "What does 'explicitly programmed' mean in this context? Please provide contrast with traditional programming."}]
  }
}
```

### Minor Revision Needed (`https://xats.org/vocabularies/annotations/minor_revision_needed`)
**Purpose**: Indicate need for small corrections  
**Best For**: Typos, formatting issues, minor factual corrections  

### Major Revision Needed (`https://xats.org/vocabularies/annotations/major_revision_needed`)
**Purpose**: Indicate need for significant content changes  
**Best For**: Structural problems, missing content, pedagogical concerns  

**Example with Review Decision**:
```json
{
  "annotationType": "https://xats.org/vocabularies/annotations/major_revision_needed",
  "reviewDecision": {
    "decision": "request_changes",
    "confidence": 4,
    "criteria": ["completeness", "pedagogical_effectiveness"],
    "justification": {
      "runs": [{"type": "text", "text": "This section lacks depth and concrete examples that students need to understand the concept."}]
    },
    "recommendedActions": [
      {
        "action": "add_examples",
        "description": {"runs": [{"type": "text", "text": "Include 2-3 concrete examples with step-by-step explanations"}]},
        "priority": "high"
      }
    ]
  }
}
```

### Approval (`https://xats.org/vocabularies/annotations/approval`)
**Purpose**: Formal approval of content  
**Best For**: Peer review sign-off, content validation, quality assurance  

### Rejection (`https://xats.org/vocabularies/annotations/rejection`)
**Purpose**: Formal rejection of content  
**Best For**: Content that doesn't meet standards or requires complete rewrite  

## Workflow Management

### Annotation Status Lifecycle

1. **Open**: Newly created, requires attention
2. **Resolved**: Issue has been addressed
3. **Rejected**: Annotation dismissed without action (with justification)
4. **Deferred**: Action postponed to future iteration

### Priority Levels

- **Critical**: Blocking issues that must be addressed before publication
- **High**: Important issues requiring attention
- **Medium**: Standard feedback (default level)
- **Low**: Nice-to-have improvements

### Threading System

Annotations support hierarchical discussions through threading:

```json
{
  "id": "parent-annotation",
  "threadId": "discussion-001",
  "content": {"runs": [{"type": "text", "text": "Original question"}]}
}
```

```json
{
  "id": "reply-annotation", 
  "threadId": "discussion-001",
  "parentAnnotationId": "parent-annotation",
  "content": {"runs": [{"type": "text", "text": "Response to question"}]}
}
```

## Implementation Guide

### For Content Authors

#### Adding Annotations to Your Content
1. Identify the target object by its `id`
2. Choose appropriate annotation type
3. Set priority and assign reviewers
4. Provide clear, actionable content

#### Responding to Reviews
1. Review annotations by priority level
2. Address critical issues first
3. Update annotation status as changes are made
4. Document rationale for rejected suggestions

#### Example Document Structure
```json
{
  "id": "content-paragraph",
  "blockType": "https://xats.org/vocabularies/blocks/paragraph",
  "content": {"text": {"runs": [{"type": "text", "text": "Your content here"}]}},
  "annotations": [
    {
      "id": "review-001",
      "annotationType": "https://xats.org/vocabularies/annotations/suggestion",
      "targetObjectId": "content-paragraph",
      "status": "open",
      "priority": "medium",
      "reviewer": "peer-reviewer-id",
      "content": {"runs": [{"type": "text", "text": "Helpful feedback"}]},
      "createdAt": "2025-08-24T12:00:00Z"
    }
  ]
}
```

### For Reviewers

#### Best Practices
1. **Be Specific**: Target exact text ranges when possible
2. **Provide Context**: Explain the rationale behind suggestions
3. **Use Appropriate Types**: Choose annotation types that match your intent
4. **Set Realistic Priorities**: Reserve "critical" for truly blocking issues
5. **Follow Up**: Engage in threaded discussions when needed

#### Review Decision Guidelines
- **Confidence Levels**: Be honest about your certainty (1-5 scale)
- **Criteria Selection**: Choose relevant review criteria
- **Actionable Feedback**: Include specific recommended actions
- **Clear Justification**: Explain your decision thoroughly

### For Tool Developers

#### Annotation Utilities
The `@xats-org/utils` package provides comprehensive annotation management utilities:

```javascript
import { 
  createAnnotation, 
  filterAnnotations, 
  groupAnnotationsByThread,
  calculateReviewProgress,
  ANNOTATION_TYPES
} from '@xats-org/utils';

// Create a new suggestion
const suggestion = createAnnotation({
  annotationType: ANNOTATION_TYPES.SUGGESTION,
  targetObjectId: 'paragraph-123',
  content: createAnnotationSemanticText('Consider revising this section'),
  reviewer: 'reviewer-id',
  priority: 'medium'
});

// Filter annotations by status
const openAnnotations = filterAnnotations(annotations, { 
  status: 'open', 
  priority: 'high' 
});

// Calculate review progress
const progress = calculateReviewProgress(annotations);
console.log(`${progress.completionRate}% complete, ${progress.criticalIssues} critical issues remaining`);
```

#### UI Integration Patterns
1. **Annotation Overlays**: Display annotations as contextual overlays
2. **Review Dashboards**: Show progress metrics and priority filtering
3. **Thread Visualization**: Present discussion threads as collapsible trees  
4. **Status Management**: Provide clear status update workflows
5. **Batch Operations**: Enable bulk status updates and filtering

## Advanced Features

### Text Range Targeting
Precisely target specific text segments for focused feedback:

```json
{
  "targetRange": {
    "startOffset": 45,
    "endOffset": 72,
    "textContent": "machine learning algorithm"
  }
}
```

### Cross-References
Link annotations to related objects, citations, or external resources:

```json
{
  "content": {
    "runs": [
      {"type": "text", "text": "See "},
      {"type": "reference", "text": "Section 3.2", "refId": "section-3-2"},
      {"type": "text", "text": " for more details."}
    ]
  }
}
```

### Custom Extensions
Extend annotations with organization-specific metadata:

```json
{
  "extensions": {
    "institutionSpecific": {
      "courseCode": "CS-101",
      "semester": "Fall-2025",
      "reviewRound": 2
    }
  }
}
```

## Workflow Examples

### Academic Peer Review
1. **Submission**: Author creates content with initial self-review
2. **Assignment**: Editorial system assigns reviewers
3. **Review**: Reviewers add annotations with formal decisions  
4. **Revision**: Author addresses feedback, updates status
5. **Re-review**: Reviewers verify changes, update decisions
6. **Publication**: Final approval annotations complete the process

### Collaborative Textbook Development
1. **Drafting**: Authors create initial content
2. **Internal Review**: Team members add suggestions and clarifications
3. **Expert Review**: Subject matter experts provide detailed feedback
4. **Student Testing**: Student reviewers identify confusing sections
5. **Final Edit**: Authors incorporate feedback and close annotations
6. **Quality Check**: Final approval before publication

### Corporate Training Material Review  
1. **Content Creation**: Training developers create materials
2. **SME Review**: Subject matter experts validate technical accuracy
3. **Instructional Review**: Learning designers evaluate pedagogical approach
4. **Stakeholder Review**: Business stakeholders approve content alignment  
5. **Accessibility Review**: Accessibility specialists ensure compliance
6. **Final Production**: All critical annotations resolved before deployment

## Integration Guidelines

### Version Control Integration
- Annotations are stored within the xats document for full version control
- Git branches can be used for different review rounds
- Annotation history is preserved across document versions
- Merge conflicts can include annotation data for complete context

### LMS Integration  
- Use LTI 1.3 extensions for gradebook integration
- Map annotation priorities to assignment rubrics  
- Support single sign-on for reviewer authentication
- Provide analytics data for learning outcomes assessment

### Publishing Workflow Integration
- Export annotations as change tracking data for Word/LaTeX
- Generate reviewer reports from annotation metadata
- Support manuscript submission system requirements
- Maintain annotation data through format conversions

## Best Practices

### Content Organization
- Use consistent ID naming conventions
- Group related annotations with thread IDs
- Maintain annotation metadata completeness
- Regular status updates and progress tracking

### Review Quality  
- Provide specific, actionable feedback
- Use appropriate annotation types
- Include justification for all decisions
- Respond to follow-up questions promptly

### System Administration
- Establish clear review assignment workflows
- Define organizational priority level standards  
- Create templates for common annotation types
- Monitor annotation resolution rates and quality

## Troubleshooting

### Common Issues

**Annotation Not Displaying**
- Check `targetObjectId` matches existing object `id`
- Verify annotation schema validation
- Confirm proper nesting within XatsObject

**Text Range Targeting Problems**
- Ensure `startOffset < endOffset`
- Verify `textContent` matches actual text
- Check character encoding consistency

**Threading Issues**
- Confirm `threadId` consistency across related annotations
- Verify `parentAnnotationId` references exist
- Check annotation creation timestamps for proper ordering

**Performance Concerns**
- Limit annotation arrays to reasonable sizes
- Use filtering for large annotation sets
- Consider pagination for extensive review histories

## Conclusion

The xats annotation system provides a powerful foundation for collaborative content development while maintaining the semantic richness and extensibility that defines the xats standard. By following these guidelines and best practices, organizations can implement effective peer review workflows that enhance content quality and support diverse educational and publishing needs.

For additional support and advanced implementation guidance, refer to the xats technical documentation and community resources.