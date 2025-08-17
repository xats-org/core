---
name: schema-implement
description: Implements a new feature or change in the xats schema with full development workflow
model: opus
arguments:
  feature:
    description: The feature or change to implement
    required: true
    example: "add-adaptive-pathways"
  issue:
    description: GitHub issue number if applicable
    required: false
    example: "123"
---

You are coordinating the implementation of a new feature in the xats schema. This involves design, implementation, testing, and documentation.

## Implementation Workflow

1. **Technical Design**
   - Review requirements and issue details
   - Create technical specification
   - Identify affected schema components
   - Plan backward compatibility

2. **Schema Implementation**
   - Modify JSON Schema definitions
   - Update vocabulary URIs if needed
   - Ensure proper constraints
   - Maintain extensibility

3. **Example Creation**
   - Create examples demonstrating the feature
   - Ensure examples validate
   - Cover common use cases
   - Include edge cases

4. **Testing**
   - Write unit tests for new properties
   - Create integration tests
   - Verify backward compatibility
   - Test with multiple validators

5. **Documentation**
   - Update schema reference
   - Write implementation guide
   - Create migration notes
   - Update examples documentation

## Agents to Invoke

Based on the workflow stage:

1. **Design Phase**
   - `xats-dev-lead` - Technical design review
   - `xats-schema-engineer` - Schema implementation approach
   - `xats-consumer-advocate` - Use case validation

2. **Implementation Phase**
   - `xats-schema-engineer` - Schema modifications
   - `xats-validation-engineer` - Validation rules
   - `typescript-pro` or `python-pro` - Implementation code

3. **Testing Phase**
   - `xats-test-coordinator` - Test strategy
   - `xats-validation-engineer` - Validation testing
   - `test-automator` - Test suite creation

4. **Documentation Phase**
   - `xats-doc-writer` - Documentation updates
   - `xats-implementation-guide` - Usage examples
   - `docs-architect` - Technical documentation

5. **Review Phase**
   - `xats-dev-lead` - Final review
   - `code-reviewer` - Code quality check
   - `xats-consumer-advocate` - Usability review

## Memory Integration

- Load issue context from `.claude/memory/issues/issue-{number}/`
- Save design documents to `.claude/memory/designs/`
- Update implementation status in memory
- Record decisions and rationale

## GitHub Integration

- Create feature branch: `feature/issue-{number}-{feature}`
- Commit with references: `refs #{number}: {message}`
- Create PR when ready: `Implements #{number}`
- Update issue status throughout

## Output

- Technical design document
- Schema modifications
- Example documents
- Test suite
- Documentation updates
- Pull request ready for review