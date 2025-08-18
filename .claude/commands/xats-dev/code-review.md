---
name: code-review
description: Performs comprehensive code review of xats schema changes and implementations
model: claude-3-5-sonnet-latest
arguments:
  pr:
    description: Pull request number to review
    required: false
    example: "123"
  branch:
    description: Branch to review if no PR
    required: false
    example: "feature/adaptive-pathways"
---

You are performing a comprehensive code review for xats schema changes. This ensures quality, consistency, and maintainability.

## Review Checklist

### Schema Design
- [ ] Follows xats architectural principles
- [ ] Maintains backward compatibility
- [ ] Uses appropriate vocabulary URIs
- [ ] Properly extensible
- [ ] Clear property naming

### Technical Quality
- [ ] Valid JSON Schema syntax
- [ ] Proper constraint definitions
- [ ] Efficient validation rules
- [ ] No redundant properties
- [ ] Consistent patterns

### Documentation
- [ ] Schema comments present
- [ ] Examples provided
- [ ] Migration guide if breaking
- [ ] API documentation updated
- [ ] README updated

### Testing
- [ ] Unit tests included
- [ ] Integration tests present
- [ ] Examples validate
- [ ] Coverage adequate
- [ ] Performance acceptable

### Security & Privacy
- [ ] No sensitive data exposure
- [ ] Input validation proper
- [ ] Safe defaults used
- [ ] Privacy compliance
- [ ] Security documented

## Review Process

1. **Initial Assessment**
   - Review PR description
   - Check linked issues
   - Understand scope
   - Identify risks

2. **Schema Review**
   - Validate JSON Schema
   - Check design patterns
   - Verify constraints
   - Test extensibility

3. **Code Review**
   - Implementation quality
   - Test coverage
   - Documentation completeness
   - Performance impact

4. **Compatibility Check**
   - Backward compatibility
   - Validator compatibility
   - Extension impact
   - Migration path

5. **Final Validation**
   - Run full test suite
   - Validate all examples
   - Check documentation
   - Approve or request changes

## Agents to Invoke

### Technical Review
- `xats-schema-engineer` - Schema design review
- `xats-validation-engineer` - Validation logic review
- `code-reviewer` - General code quality
- `typescript-pro` or `python-pro` - Language-specific review

### Quality Review
- `xats-test-coordinator` - Test coverage review
- `performance-engineer` - Performance analysis
- `security-auditor` - Security review
- `xats-doc-writer` - Documentation review

### Stakeholder Review
- `xats-consumer-advocate` - Usability review
- `xats-extension-developer` - Extension compatibility
- `xats-accessibility-champion` - Accessibility review
- `xats-publishing-expert` - Commercial viability

## Review Criteria

### Must Have
- Valid JSON Schema
- Backward compatible (or migration path)
- Tests included
- Documentation present
- Examples validate

### Should Have
- Performance benchmarks
- Security analysis
- Accessibility compliance
- Comprehensive examples
- Migration tooling

### Nice to Have
- Video walkthrough
- Interactive demos
- Community feedback
- Performance optimization
- Advanced examples

## Output Format

```markdown
## Code Review: PR #[number]

### Summary
[Overall assessment]

### Strengths
- [Positive aspects]

### Issues Found
- **Critical**: [Must fix before merge]
- **Major**: [Should fix before merge]
- **Minor**: [Can fix in follow-up]

### Recommendations
- [Improvement suggestions]

### Testing Results
- [Test execution results]
- [Coverage report]
- [Performance impact]

### Decision
- [ ] Approved
- [ ] Approved with conditions
- [ ] Changes requested
- [ ] Rejected

### Conditions/Next Steps
[If applicable]
```

## GitHub Integration

- Post review as PR comment
- Use GitHub review features
- Request changes if needed
- Approve when ready
- Update issue status