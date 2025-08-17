---
name: test-suite
description: Creates or updates comprehensive test suite for xats schema features
model: sonnet
arguments:
  target:
    description: What to test (feature, component, or full schema)
    required: true
    example: "assessment-blocks"
  type:
    description: Type of tests to create (unit, integration, all)
    required: false
    default: "all"
---

You are creating a comprehensive test suite for the xats schema. This ensures all features work correctly and maintain compatibility.

## Test Strategy

### Test Categories

1. **Schema Validation Tests**
   - Valid document acceptance
   - Invalid document rejection
   - Error message clarity
   - Constraint enforcement

2. **Example Validation**
   - All examples validate
   - Examples demonstrate features
   - Edge cases covered
   - Performance acceptable

3. **Compatibility Testing**
   - Backward compatibility
   - Validator compatibility (ajv, jsonschema)
   - Extension compatibility
   - Version migration

4. **Integration Testing**
   - Full document workflows
   - Cross-feature interactions
   - Real-world scenarios
   - Platform integration

## Test Implementation

### Unit Tests
```javascript
describe('Schema Property: ${property}', () => {
  test('accepts valid values', () => {
    // Test valid inputs
  });
  
  test('rejects invalid values', () => {
    // Test invalid inputs
  });
  
  test('enforces constraints', () => {
    // Test constraints
  });
});
```

### Integration Tests
```python
def test_full_document_validation():
    """Test complete document validation"""
    doc = load_example('full-textbook.json')
    assert validate(doc, schema) == True
```

### Performance Tests
```javascript
test('validates large documents efficiently', () => {
  const largeDoc = generateLargeDocument(1000);
  const start = Date.now();
  validate(largeDoc);
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(1000); // < 1 second
});
```

## Agents to Use

1. **Test Planning**
   - `xats-test-coordinator` - Overall test strategy
   - `xats-validation-engineer` - Validation test design
   - `test-automator` - Test implementation approach

2. **Test Implementation**
   - `javascript-pro` - JavaScript test code
   - `python-pro` - Python test code
   - `typescript-pro` - TypeScript test code

3. **Test Coverage**
   - `xats-test-coordinator` - Coverage analysis
   - `performance-engineer` - Performance benchmarks
   - `xats-consumer-advocate` - Use case coverage

4. **Test Review**
   - `xats-validation-engineer` - Test quality
   - `code-reviewer` - Test code review
   - `xats-dev-lead` - Test approval

## Test Organization

```
tests/
├── unit/
│   ├── properties/    # Individual property tests
│   ├── constraints/   # Constraint validation
│   └── vocabularies/  # URI vocabulary tests
├── integration/
│   ├── documents/     # Full document tests
│   ├── workflows/     # Use case tests
│   └── compatibility/ # Cross-validator tests
├── performance/
│   ├── benchmarks/    # Performance tests
│   └── load/         # Load testing
└── fixtures/
    ├── valid/        # Valid test documents
    └── invalid/      # Invalid test documents
```

## Coverage Requirements

- Minimum 90% code coverage
- 100% schema property coverage
- All vocabulary URIs tested
- All constraints validated
- All examples verified

## Output

- Test plan document
- Test implementation files
- Coverage report
- Performance benchmarks
- Test documentation
- CI/CD configuration