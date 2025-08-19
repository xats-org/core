# xats Examples

This directory contains example xats documents demonstrating key features and best practices for v0.2.0 of the schema.

## v0.2.0 Example Documents

### Core Assessment Framework Examples

#### `accessibility-sample-v0.2.0.json`
Demonstrates comprehensive WCAG 2.1 AA compliance features including:
- Language identification and text direction
- Skip navigation links for keyboard accessibility
- Proper alt text and long descriptions for images
- Semantic heading hierarchy
- Assessment accessibility settings
- Cognitive support metadata

**Key Features Demonstrated:**
- Multiple assessment types with accessibility accommodations
- Screen reader compatible content structure
- Keyboard navigation support
- Extended time configurations for assessments

### LMS Integration Examples

#### `lti-integration-example.json`
Comprehensive example of LTI 1.3 integration featuring:
- Complete LTI tool configuration
- Platform-specific registration (Canvas example)
- Grade passback configuration (AGS)
- Deep linking support for content selection
- Assessment integration with automatic scoring

**Key Features Demonstrated:**
- LTI 1.3 Advantage implementation
- Assignment and Grade Services (AGS) setup
- Deep Linking 2.0 for content embedding
- Platform registration and security configuration
- Assessment-level grade passback

### Rights Management Examples

#### `rights-management-example.json`
Demonstrates comprehensive copyright and licensing framework:
- Multiple license types (Creative Commons, proprietary)
- Copyright holder and year tracking
- Usage permissions and restrictions
- Attribution requirements
- Commercial use controls

**Key Features Demonstrated:**
- Granular rights metadata
- License compatibility checking
- Attribution format specification
- Permission inheritance from parent containers

### Adaptive Learning Examples

#### `adaptive-pathway-example.json`
Showcases assessment-based pathways and adaptive learning:
- Conditional branching based on assessment scores
- Remediation pathways for struggling learners
- Advanced content for high performers
- Prerequisite checking and enforcement

**Key Features Demonstrated:**
- Assessment-triggered pathways
- Score-based conditional logic
- Learning objective tracking
- Personalized content delivery

## Utility Scripts

#### `pathway-condition-parser.js`
JavaScript utility for parsing and evaluating pathway conditions:
- Score-based rule evaluation
- Boolean logic processing
- Condition validation
- Debugging support

## Example Categories

### `/drafts/`
Work-in-progress examples and experimental features:
- Early implementations of future features
- Community-contributed examples
- Testing scenarios for edge cases

### `/invalid/`
Example documents that intentionally fail validation:
- Common authoring mistakes to avoid
- Schema violation examples
- Validation testing scenarios

## Validation

All examples can be validated using the xats CLI tool:

```bash
# Validate a specific example
npx @xats-org/core validate examples/accessibility-sample-v0.2.0.json

# Validate all examples
npx @xats-org/core validate examples/*.json

# Validate with detailed accessibility checking
npx @xats-org/core validate --accessibility examples/accessibility-sample-v0.2.0.json
```

## Usage Guidelines

### For Content Authors
- Start with `accessibility-sample-v0.2.0.json` for WCAG compliance patterns
- Use `adaptive-pathway-example.json` for assessment-driven content
- Reference `rights-management-example.json` for licensing needs

### For Developers
- Examine `lti-integration-example.json` for LMS integration patterns
- Use the validation examples to test your implementation
- Study the utility scripts for common processing tasks

### For Instructional Designers
- Focus on the pedagogical metadata patterns in assessments
- Review the adaptive pathway configurations
- Consider the accessibility accommodations in your content design

## Contributing Examples

To contribute a new example:

1. **Create Document**: Build a complete, valid xats document
2. **Validate**: Ensure it passes schema validation
3. **Document**: Add clear comments and descriptions
4. **Test**: Verify it demonstrates the intended features
5. **Submit**: Create a pull request with your example

### Example Standards

- Must validate against the latest schema version
- Should demonstrate specific features clearly
- Include comprehensive metadata and descriptions
- Follow accessibility best practices
- Use realistic, educational content

## Support

For questions about the examples:

- **Schema Reference**: See [/docs/reference/](../docs/reference/)
- **Authoring Guide**: See [/docs/guides/authoring-guide.md](../docs/guides/authoring-guide.md)
- **Issues**: Report problems with examples on [GitHub Issues](https://github.com/xats-org/core/issues)
- **Discussions**: Get help on [GitHub Discussions](https://github.com/xats-org/core/discussions)
