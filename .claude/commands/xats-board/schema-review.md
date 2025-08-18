---
name: schema-review
description: Conducts thorough technical and pedagogical review of proposed schema changes before implementation
model: claude-opus-4-1-20250805
arguments:
  pr:
    description: Pull request number to review
    required: false
    example: "123"
  feature:
    description: Specific feature or change to review
    required: false
    example: "assessment-blocks"
---

You are conducting a comprehensive schema review session. Your role is to ensure proposed changes are technically sound, pedagogically valuable, and maintain backward compatibility.

## Arguments
- **pr** (optional): Specific pull request to review
- **feature** (optional): Feature name or description to review

## Memory Integration

### Before Review
1. Load previous reviews of similar features
2. Check established patterns and conventions
3. Review past rejection reasons to avoid repetition
4. Load relevant ADRs for context

### During Review
1. Create review record: `.claude/memory/reviews/YYYY-MM-DD-feature/`
2. Document each reviewer's feedback
3. Track concerns and resolutions

### After Review
1. Save complete review to memory
2. Update decision records if approved
3. Create or update ADR if needed
4. Update patterns library with new conventions

## Review Process

1. **Change Analysis**: Understand what's being proposed and why
2. **Technical Review**: Assess JSON Schema validity and architecture
3. **Pedagogical Review**: Evaluate educational value and use cases
4. **Impact Assessment**: Determine effects on existing documents and tools
5. **Standards Alignment**: Check compatibility with relevant standards
6. **Recommendation**: Approve, request changes, or reject

## Review Checklist

### Technical Aspects
- [ ] Valid JSON Schema syntax
- [ ] Follows existing architectural patterns
- [ ] Maintains backward compatibility (or documents breaking changes)
- [ ] Includes appropriate validation constraints
- [ ] Uses consistent naming conventions
- [ ] Has clear property descriptions

### Pedagogical Aspects
- [ ] Serves a clear educational purpose
- [ ] Supports evidence-based teaching practices
- [ ] Enhances learning outcomes
- [ ] Accessible to diverse learners
- [ ] Enables formative assessment

### Standards Compliance
- [ ] Aligns with existing standards where applicable
- [ ] Uses established vocabularies (CSL, Dublin Core, etc.)
- [ ] Follows semantic web best practices
- [ ] Maintains internationalization support

## Review Board

Invoke these agents for comprehensive review:
- `xats-schema-engineer` - Technical implementation review
- `xats-validation-engineer` - Testing and validation
- `xats-standards-analyst` - Standards compliance check
- `xats-pedagogy-architect` - Educational effectiveness
- `xats-publishing-expert` - Production workflow impact
- `xats-accessibility-champion` - Accessibility review
- `xats-ai-education-expert` - AI processing implications

## Review Artifacts

1. **Schema Diff**: Line-by-line changes to schema file
2. **Example Documents**: Valid and invalid test cases
3. **Migration Guide**: How to update existing documents
4. **ADR Draft**: Architecture Decision Record explaining rationale

## Output

- **Review Report**: Saved to `.claude/memory/reviews/YYYY-MM-DD-feature/report.md`
- **Test Results**: Validation results archived with review
- **Recommendation**: Clear decision saved to memory
- **Required Changes**: Tracked in review memory for follow-up
- **Documentation Updates**: List of docs needing updates
- **ADR**: New or updated ADR in `.claude/memory/decisions/` if approved