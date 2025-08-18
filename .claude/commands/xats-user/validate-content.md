---
name: validate-content
description: Validates xats content for compliance, quality, and best practices
model: claude-sonnet-4-20250514
arguments:
  file:
    description: Path to xats JSON file to validate
    required: true
    example: "textbook.json"
  level:
    description: Validation level (basic, full, strict)
    required: false
    default: "full"
---

You are validating xats content for compliance and quality. Perform comprehensive checks and provide actionable feedback.

## Validation Levels

### Basic Validation
- JSON syntax validity
- Schema compliance
- Required fields present
- Valid vocabulary URIs

### Full Validation (Default)
- All basic checks
- Best practices compliance
- Accessibility review
- Performance analysis
- Example quality

### Strict Validation
- All full checks
- Production readiness
- Complete metadata
- Comprehensive testing
- Commercial viability

## Validation Process

### 1. Schema Validation
```javascript
// Validate against xats schema
const ajv = new Ajv();
const validate = ajv.compile(xatsSchema);
const valid = validate(content);

if (!valid) {
  console.error('Validation errors:', validate.errors);
}
```

### 2. Content Quality Checks
- Learning objectives present and clear
- Assessments align with objectives
- Content properly structured
- Consistent formatting
- Proper citations

### 3. Accessibility Validation
- Alt text for images
- Proper heading hierarchy
- Readable text complexity
- Color contrast compliance
- Screen reader compatibility

### 4. Performance Analysis
- Document size optimization
- Efficient structure
- Reasonable nesting depth
- Optimized media references
- Validation speed

### 5. Best Practices Review
- Semantic markup usage
- Proper vocabulary URIs
- Extensibility patterns
- Metadata completeness
- Version compatibility

## Agents to Invoke

### Validation Specialists
- `xats-validation-engineer` - Schema validation
- `xats-test-coordinator` - Test execution
- `performance-engineer` - Performance analysis

### Quality Review
- `xats-accessibility-champion` - Accessibility audit
- `xats-pedagogy-architect` - Learning design review
- `xats-content-author` - Content quality

### Compliance Check
- `xats-standards-analyst` - Standards compliance
- `xats-lms-integrator` - LMS compatibility
- `xats-international-liaison` - i18n review

## Validation Report Format

```markdown
# xats Content Validation Report

## Summary
- **File**: ${filename}
- **Schema Version**: ${version}
- **Validation Level**: ${level}
- **Status**: ✅ VALID | ⚠️ WARNINGS | ❌ INVALID

## Schema Validation
- **Result**: ${result}
- **Errors**: ${error_count}
- **Warnings**: ${warning_count}

### Issues Found
${issues_list}

## Content Quality
- **Learning Objectives**: ${status}
- **Assessment Alignment**: ${status}
- **Content Structure**: ${status}
- **Citations**: ${status}

## Accessibility
- **WCAG Compliance**: ${level}
- **Issues Found**: ${count}
- **Recommendations**: ${list}

## Performance
- **File Size**: ${size}
- **Validation Time**: ${time}
- **Optimization Opportunities**: ${list}

## Best Practices
- **Compliance Score**: ${score}/100
- **Improvements Needed**: ${list}

## Recommendations
### Critical (Must Fix)
${critical_issues}

### Important (Should Fix)
${important_issues}

### Suggestions (Nice to Have)
${suggestions}

## Next Steps
${action_items}
```

## Common Issues & Fixes

### Schema Errors
- **Missing required field**: Add the field with appropriate value
- **Invalid URI**: Use proper xats vocabulary URI
- **Type mismatch**: Correct the data type

### Content Issues
- **No learning objectives**: Add clear, measurable objectives
- **Orphaned sections**: Ensure proper nesting
- **Missing metadata**: Complete bibliographic entry

### Accessibility Problems
- **Missing alt text**: Add descriptive alt text
- **Poor contrast**: Adjust color values
- **Complex language**: Simplify for readability

## Validation Tools

### Command Line
```bash
# Basic validation
ajv validate -s xats.json -d textbook.json

# With custom messages
ajv validate -s xats.json -d textbook.json --errors=text
```

### Python
```python
import jsonschema

def validate_xats(content, schema):
    try:
        jsonschema.validate(content, schema)
        return True, None
    except jsonschema.ValidationError as e:
        return False, str(e)
```

### Online Validators
- JSON Schema Validator
- xats Online Validator (when available)
- LMS compatibility checkers

## Output

- Detailed validation report
- Error messages with fixes
- Improvement recommendations
- Performance metrics
- Accessibility audit
- Next steps guide