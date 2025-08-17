---
name: create-extension
description: Guides users through creating custom extensions for the xats schema
model: sonnet
arguments:
  name:
    description: Name of the extension
    required: true
    example: "interactive-simulations"
  domain:
    description: Domain for the extension URIs
    required: true
    example: "example.org"
---

You are helping a user create a custom extension for the xats schema. Guide them through design, implementation, and submission.

## Extension Development Process

### 1. Extension Planning
- Define the purpose and scope
- Identify target use cases
- Design vocabulary URIs
- Plan schema extensions
- Consider compatibility

### 2. URI Design
```
https://${domain}/xats/extensions/${name}/blocks/${blockType}
https://${domain}/xats/extensions/${name}/assessments/${assessmentType}
https://${domain}/xats/extensions/${name}/resources/${resourceType}
```

### 3. Schema Definition
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://${domain}/xats/extensions/${name}/schema.json",
  "title": "${Extension Name}",
  "description": "${description}",
  "definitions": {
    "${blockType}": {
      "type": "object",
      "properties": {
        "blockType": {
          "const": "https://${domain}/xats/extensions/${name}/blocks/${blockType}"
        },
        "content": {
          "$ref": "#/definitions/${blockType}Content"
        }
      }
    }
  }
}
```

## Extension Categories

### Content Blocks
- Interactive elements
- Specialized media
- Domain-specific notation
- Custom layouts
- Dynamic content

### Assessments
- Advanced question types
- Adaptive testing
- Peer assessment
- Portfolio elements
- Competency tracking

### Metadata
- Analytics tracking
- Learning analytics
- Custom properties
- Institutional data
- Rights management

### Rendering
- Style hints
- Layout preferences
- Interaction patterns
- Accessibility features
- Platform-specific

## Agents to Use

### Design Phase
- `xats-extension-developer` - Extension architecture
- `xats-schema-engineer` - Schema design
- `xats-standards-analyst` - Standards alignment

### Implementation
- `xats-extension-developer` - Implementation
- `xats-validation-engineer` - Validation rules
- `javascript-pro` or `python-pro` - Code implementation

### Testing
- `xats-test-coordinator` - Test strategy
- `xats-extension-reviewer` - Compatibility review
- `test-automator` - Test creation

### Documentation
- `xats-doc-writer` - Documentation
- `api-documenter` - API specs
- `tutorial-engineer` - Usage guides

## Example Extension

### Interactive Simulation Block
```json
{
  "blockType": "https://example.org/xats/extensions/simulations/blocks/physics-sim",
  "content": {
    "simulationType": "pendulum",
    "parameters": {
      "length": 1.0,
      "mass": 0.5,
      "gravity": 9.8,
      "damping": 0.1
    },
    "initialConditions": {
      "angle": 30,
      "velocity": 0
    },
    "controls": ["play", "pause", "reset", "parameters"],
    "visualization": {
      "type": "2d",
      "showTrajectory": true,
      "showVectors": true
    }
  }
}
```

### Custom Assessment Type
```json
{
  "assessmentType": "https://example.org/xats/extensions/adaptive/assessments/branching-quiz",
  "content": {
    "startQuestion": "q1",
    "questions": {
      "q1": {
        "text": "Question 1",
        "options": [...],
        "branches": {
          "correct": "q2a",
          "incorrect": "q2b"
        }
      }
    },
    "scoringRules": {...}
  }
}
```

## Testing Requirements

### Validation Tests
```javascript
describe('Extension: ${name}', () => {
  test('validates correct usage', () => {
    const doc = createDocumentWithExtension();
    expect(validate(doc)).toBe(true);
  });
  
  test('provides clear errors', () => {
    const invalid = createInvalidExtension();
    const result = validate(invalid);
    expect(result.errors).toBeInformative();
  });
});
```

### Compatibility Tests
- Core schema compatibility
- Other extension compatibility
- Validator compatibility
- Platform compatibility
- Version compatibility

## Documentation Template

```markdown
# ${Extension Name}

## Overview
${description}

## Installation
${installation_instructions}

## Vocabulary URIs
- Blocks: `https://${domain}/xats/extensions/${name}/blocks/*`
- Assessments: `https://${domain}/xats/extensions/${name}/assessments/*`

## Usage Examples
${examples}

## Schema Reference
${schema_documentation}

## Compatibility
- xats version: ${version}
- Dependencies: ${dependencies}

## Testing
${test_instructions}

## License
${license}
```

## Submission Process

1. **Preparation**
   - Complete implementation
   - Full test coverage
   - Comprehensive documentation
   - Usage examples
   - Performance benchmarks

2. **Review**
   - Self-review checklist
   - Community feedback
   - Compatibility testing
   - Security review
   - Accessibility check

3. **Submission**
   - Create GitHub repository
   - Submit to extension registry
   - Provide metadata
   - Include examples
   - Await review

## Output

- Extension schema definition
- Implementation code
- Test suite
- Documentation
- Examples
- Submission package